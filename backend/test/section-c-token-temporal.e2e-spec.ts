import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import * as request from 'supertest';
import { createTestApp, registerStaff, login, DEFAULT_PASSWORD } from './helpers';
import { Session } from '../src/modules/identity/entities/session.entity';
import { PasswordReset } from '../src/modules/identity/entities/password-reset.entity';

/**
 * SEZIONE C — Edge case temporali su token e sessioni.
 * Per manipolare il tempo forgiamo access token con scadenze artificiali
 * (JwtService dell'app) e modifichiamo le scadenze a DB (DataSource dell'app).
 *
 * NB sul comportamento delle sessioni: la JwtAccessStrategy verifica che la
 * sessione collegata al token sia ancora ATTIVA. Conseguenza: logout, revoca e
 * cambio password invalidano l'access token immediatamente (test C.5/C.6/C.12),
 * non solo alla scadenza naturale.
 */
describe('Sezione C — edge temporali token/sessioni', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let accessSecret: string;
  let ds: DataSource;
  const srv = () => app.getHttpServer();
  const ME = '/api/v1/auth/me';

  beforeAll(async () => {
    app = await createTestApp();
    jwt = app.get(JwtService);
    ds = app.get(DataSource);
    accessSecret = app.get(ConfigService).getOrThrow<string>('jwt.accessSecret');
  });
  afterAll(async () => {
    await app.close();
  });

  // Forgia un access token con scadenza arbitraria, riusando i claim di una
  // sessione reale (così la verifica della sessione attiva nella strategy passa).
  function signAccess(claims: { sub: string; sessionId: string; restaurantId: string; role: string }, expiresIn: string) {
    return jwt.sign({ ...claims, type: 'access' }, { secret: accessSecret, expiresIn });
  }

  function claimsFrom(accessToken: string) {
    const p = jwt.decode(accessToken) as {
      sub: string;
      sessionId: string;
      restaurantId: string;
      role: string;
    };
    return { sub: p.sub, sessionId: p.sessionId, restaurantId: p.restaurantId, role: p.role };
  }

  const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

  // C.1 — token che scade tra ~2s, usato subito → accettato
  it('C.1 — access token in scadenza imminente usato subito → 200', async () => {
    const reg = await registerStaff(app);
    const token = signAccess(claimsFrom(reg.accessToken), '2s');
    await request(srv()).get(ME).set('Authorization', `Bearer ${token}`).expect(200);
  });

  // C.2 — token scaduto da poco → 401
  it('C.2 — access token scaduto → 401', async () => {
    const reg = await registerStaff(app);
    const token = signAccess(claimsFrom(reg.accessToken), '-5s'); // già scaduto
    await request(srv()).get(ME).set('Authorization', `Bearer ${token}`).expect(401);
  });

  // C.3 — refresh token con sessione scaduta → 401
  it('C.3 — refresh con sessione scaduta → 401', async () => {
    const reg = await registerStaff(app);
    await ds
      .getRepository(Session)
      .update({ tokenHash: sha256(reg.refreshToken) }, { expiresAt: new Date(Date.now() - 1000) });
    await request(srv())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: reg.refreshToken })
      .expect(401);
  });

  // C.4 — token di reset al confine del TTL: dentro funziona, fuori no
  it('C.4 — reset token: valido entro il TTL, rifiutato una volta scaduto', async () => {
    // (a) appena dentro: un token fresco funziona
    const inTtl = await registerStaff(app);
    const f1 = await request(srv())
      .post('/api/v1/auth/password/forgot')
      .send({ email: inTtl.email })
      .expect(200);
    await request(srv())
      .post('/api/v1/auth/password/reset')
      .send({ token: f1.body.devToken, newPassword: 'FreshPwd123!' })
      .expect(200);

    // (b) appena fuori: lo stesso flusso ma con expiresAt nel passato → 400
    const expired = await registerStaff(app);
    const f2 = await request(srv())
      .post('/api/v1/auth/password/forgot')
      .send({ email: expired.email })
      .expect(200);
    await ds
      .getRepository(PasswordReset)
      .update({ tokenHash: sha256(f2.body.devToken) }, { expiresAt: new Date(Date.now() - 1000) });
    const res = await request(srv())
      .post('/api/v1/auth/password/reset')
      .send({ token: f2.body.devToken, newPassword: 'FreshPwd123!' });
    expect(res.status).toBe(400);
    expect(res.body.error.message.toLowerCase()).toContain('scadut');
  });

  // C.5 — sessione revocata da un altro dispositivo invalida l'access token in volo
  it('C.5 — revoca sessione da altro device → access token rifiutato', async () => {
    const reg = await registerStaff(app);
    // token1 funziona
    await request(srv()).get(ME).set('Authorization', `Bearer ${reg.accessToken}`).expect(200);

    // Secondo login = seconda sessione; da lì revoco la PRIMA sessione.
    const second = await login(app, reg.email, reg.password);
    const sessions = await request(srv())
      .get('/api/v1/auth/sessions')
      .set('Authorization', `Bearer ${second.accessToken}`)
      .expect(200);
    const firstSession = sessions.body.data.find((s: { isCurrent: boolean }) => !s.isCurrent);
    expect(firstSession).toBeDefined();
    await request(srv())
      .delete(`/api/v1/auth/sessions/${firstSession.id}`)
      .set('Authorization', `Bearer ${second.accessToken}`)
      .expect(200);

    // Ora il token1 (sessione revocata) è rifiutato anche se non è scaduto.
    await request(srv()).get(ME).set('Authorization', `Bearer ${reg.accessToken}`).expect(401);
  });

  // C.6 — refresh dopo revoca della sessione → fallisce
  it('C.6 — refresh dopo logout (sessione revocata) → 401', async () => {
    const reg = await registerStaff(app);
    await request(srv())
      .delete('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${reg.accessToken}`)
      .expect(200);
    await request(srv())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: reg.refreshToken })
      .expect(401);
  });

  // C.7 — token firmato con un segreto diverso → 401
  it('C.7 — token firmato con segreto vecchio/diverso → 401', async () => {
    const reg = await registerStaff(app);
    const token = jwt.sign(
      { ...claimsFrom(reg.accessToken), type: 'access' },
      { secret: 'un-segreto-completamente-diverso-da-32+chars', expiresIn: '15m' },
    );
    await request(srv()).get(ME).set('Authorization', `Bearer ${token}`).expect(401);
  });

  // C.8 — payload manomesso (exp allungato) → firma non valida → 401
  it('C.8 — exp manomessa nel payload → 401 (firma non combacia)', async () => {
    const reg = await registerStaff(app);
    const [h, p, s] = reg.accessToken.split('.');
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    payload.exp = (payload.exp ?? 0) + 10_000_000; // mi auto-prolungo la vita
    const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const tampered = `${h}.${tamperedPayload}.${s}`;
    await request(srv()).get(ME).set('Authorization', `Bearer ${tampered}`).expect(401);
  });

  // C.9 / C.10 — TOTP: finestra temporale e replay
  it('C.9/C.10 — TOTP fuori finestra rifiutato; comportamento di replay documentato', async () => {
    const reg = await registerStaff(app);
    const auth = `Bearer ${reg.accessToken}`;

    // Setup + enable 2FA
    const setup = await request(srv())
      .post('/api/v1/auth/2fa/setup')
      .set('Authorization', auth)
      .expect(201);
    const secret = setup.body.data.secret as string;
    await request(srv())
      .post('/api/v1/auth/2fa/enable')
      .set('Authorization', auth)
      .send({ code: authenticator.generate(secret) })
      .expect(201); // @Post senza @HttpCode → 201

    // Login ora richiede 2FA
    const l = await request(srv())
      .post('/api/v1/auth/staff/login')
      .send({ email: reg.email, password: reg.password })
      .expect(200);
    expect(l.body.data.requiresTwoFactor).toBe(true);
    const twoFactorToken = l.body.data.twoFactorToken as string;

    // C.9 — codice di una finestra passata (≈90s fa) → rifiutato.
    // IMPORTANTE: genero il codice "vecchio" su un CLONE isolato. Il singleton
    // globale `authenticator` è lo stesso che usa il server (stesso processo):
    // mutarne le options qui corromperebbe la verify lato server.
    const staleAuth = authenticator.clone({ epoch: Date.now() - 90_000 });
    const staleCode = staleAuth.generate(secret);
    const stale = await request(srv())
      .post('/api/v1/auth/staff/login/2fa')
      .send({ twoFactorToken, code: staleCode });
    expect(stale.status).toBe(401);

    // C.10 — replay dello stesso codice valido due volte di fila.
    // Comportamento ATTUALE documentato: senza tracciamento del counter, il
    // codice è accettato finché la finestra è valida (meno sicuro ma comune).
    // Il test verifica/documenta lo stato attuale: il primo uso ha successo.
    const code = authenticator.generate(secret);
    const first = await request(srv())
      .post('/api/v1/auth/staff/login/2fa')
      .send({ twoFactorToken, code });
    expect(first.status).toBe(200);
    const second = await request(srv())
      .post('/api/v1/auth/staff/login/2fa')
      .send({ twoFactorToken, code });
    // Documentazione del comportamento: nessuna prevenzione del replay nella
    // finestra → 200. Se in futuro si aggiunge protezione, diventerà 401.
    expect([200, 401]).toContain(second.status);
  });

  // C.11 — sessione dispositivo persistente: richiede un device KDS provisionato
  // (onboarding/venue completo), fuori scope qui. Atteso/documentato: il device
  // token ha TTL 365g e NON dipende dalle sessioni staff → resta valido a lungo.
  it.skip('C.11 — device token persistente (richiede device KDS provisionato)', () => {
    /* documentato sopra */
  });

  // C.12 — dopo il logout, sia access sia refresh token sono rifiutati
  it('C.12 — logout invalida access E refresh token', async () => {
    const reg = await registerStaff(app);
    await request(srv())
      .delete('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${reg.accessToken}`)
      .expect(200);

    // access token → 401
    await request(srv()).get(ME).set('Authorization', `Bearer ${reg.accessToken}`).expect(401);
    // refresh token → 401
    await request(srv())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: reg.refreshToken })
      .expect(401);
  });
});
