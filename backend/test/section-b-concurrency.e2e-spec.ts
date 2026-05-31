import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  registerStaff,
  login,
  uniqueEmail,
  DEFAULT_PASSWORD,
} from './helpers';

/**
 * SEZIONE B — Concorrenza e race condition.
 * Le richieste vengono sparate IN PARALLELO con Promise.all. Un fallimento qui
 * indica tipicamente un vincolo DB mancante o una gestione transazionale errata.
 */
describe('Sezione B — concorrenza', () => {
  let app: INestApplication;
  const REGISTER = '/api/v1/auth/staff/register';
  const srv = () => app.getHttpServer();

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // helper: ritorna l'id di un ruolo NON titolare del ristorante
  async function nonOwnerRoleId(token: string): Promise<string> {
    const res = await request(srv())
      .get('/api/v1/staff/roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const role = res.body.data.find((r: { name: string }) => r.name !== 'titolare');
    if (!role) throw new Error('Nessun ruolo non-titolare trovato');
    return role.id;
  }

  async function listMembers(token: string): Promise<
    Array<{ id: string; userId: string; email: string; roleName: string; isActive: boolean }>
  > {
    const res = await request(srv())
      .get('/api/v1/staff/members')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return res.body.data;
  }

  // B.1 — registrazione simultanea stessa email → una sola passa
  it('B.1 — due register simultanee stessa email → 201 + 409, mai due utenti', async () => {
    const email = uniqueEmail('b1');
    const body = (rn: string) => ({
      email,
      password: DEFAULT_PASSWORD,
      firstName: 'A',
      lastName: 'B',
      restaurantName: rn,
    });
    const [r1, r2] = await Promise.all([
      request(srv()).post(REGISTER).send(body('Uno')),
      request(srv()).post(REGISTER).send(body('Due')),
    ]);
    const statuses = [r1.status, r2.status].sort();
    expect(statuses).toEqual([201, 409]);

    // Esiste un solo utente: il login con quella email funziona una volta sola
    // e con la password usata. (Se ci fossero due righe, l'email non sarebbe
    // più univoca e il findOne fallirebbe o sarebbe ambiguo.)
    const ok = await login(app, email, DEFAULT_PASSWORD);
    expect(ok.accessToken).toBeDefined();
  });

  // B.2 — accettazione simultanea dello stesso invito → una sola membership
  it('B.2 — due accept simultanei stesso token → una sola membership', async () => {
    const owner = await registerStaff(app);
    const roleId = await nonOwnerRoleId(owner.accessToken);
    const inviteeEmail = uniqueEmail('b2-invitee');

    const inv = await request(srv())
      .post('/api/v1/staff/invitations')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ email: inviteeEmail, roleId })
      .expect(201);
    const token = inv.body.data.token as string;

    const accept = () =>
      request(srv())
        .post('/api/v1/staff/invitations/accept')
        .send({ token, firstName: 'New', lastName: 'Member', password: DEFAULT_PASSWORD });

    const [a, b] = await Promise.all([accept(), accept()]);
    const statuses = [a.status, b.status].sort((x, y) => x - y);
    expect(statuses[0]).toBe(200); // uno solo accetta
    expect(statuses[1]).toBeGreaterThanOrEqual(400); // l'altro fallisce pulito

    // Esattamente una membership per l'invitato
    const members = await listMembers(owner.accessToken);
    const forInvitee = members.filter((m) => m.email === inviteeEmail);
    expect(forInvitee).toHaveLength(1);
  });

  // B.3 — doppio uso del refresh token → solo uno passa (no replay)
  it('B.3 — refresh token usato due volte in parallelo → 200 + 401', async () => {
    const { refreshToken } = await registerStaff(app);
    const refresh = () =>
      request(srv()).post('/api/v1/auth/refresh').send({ refreshToken });

    const [a, b] = await Promise.all([refresh(), refresh()]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 401]);
  });

  // B.4 — doppio uso del token di reset → una sola cambia la password
  it('B.4 — reset password doppio in parallelo → 200 + 400', async () => {
    const { email } = await registerStaff(app);
    const forgot = await request(srv())
      .post('/api/v1/auth/password/forgot')
      .send({ email })
      .expect(200);
    const token = forgot.body.devToken as string;
    expect(token).toBeDefined();

    const pwA = 'NewPwdAAA111!';
    const pwB = 'NewPwdBBB222!';
    const [a, b] = await Promise.all([
      request(srv()).post('/api/v1/auth/password/reset').send({ token, newPassword: pwA }),
      request(srv()).post('/api/v1/auth/password/reset').send({ token, newPassword: pwB }),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 400]);

    // La vecchia password non funziona più; ESATTAMENTE una delle due nuove sì.
    await request(srv())
      .post('/api/v1/auth/staff/login')
      .send({ email, password: DEFAULT_PASSWORD })
      .expect(401);
    const results = await Promise.all([
      request(srv()).post('/api/v1/auth/staff/login').send({ email, password: pwA }),
      request(srv()).post('/api/v1/auth/staff/login').send({ email, password: pwB }),
    ]);
    const successes = results.filter((r) => r.status === 200).length;
    expect(successes).toBe(1);
  });

  // B.5 — login simultanei multipli → tutte sessioni valide e distinte
  it('B.5 — 5 login simultanei → 5 sessioni distinte', async () => {
    const { email, password } = await registerStaff(app);
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(srv()).post('/api/v1/auth/staff/login').send({ email, password }),
      ),
    );
    expect(results.every((r) => r.status === 200)).toBe(true);
    const refreshTokens = new Set(results.map((r) => r.body.data.refreshToken));
    expect(refreshTokens.size).toBe(5); // nessuna sovrascrittura/corruzione
  });

  // B.6 — disattivazione membership durante una richiesta attiva → stato coerente
  it('B.6 — request del membro concorrente alla sua disattivazione → nessun 500', async () => {
    const owner = await registerStaff(app);
    const roleId = await nonOwnerRoleId(owner.accessToken);
    const memberEmail = uniqueEmail('b6-member');

    const inv = await request(srv())
      .post('/api/v1/staff/invitations')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ email: memberEmail, roleId })
      .expect(201);
    await request(srv())
      .post('/api/v1/staff/invitations/accept')
      .send({ token: inv.body.data.token, firstName: 'Mem', lastName: 'Ber', password: DEFAULT_PASSWORD })
      .expect(200);

    const memberTok = (await login(app, memberEmail, DEFAULT_PASSWORD)).accessToken;
    const members = await listMembers(owner.accessToken);
    const memberMembership = members.find((m) => m.email === memberEmail)!;

    // In parallelo: il membro fa una richiesta mentre il titolare lo disattiva.
    const [memReq, deact] = await Promise.all([
      request(srv()).get('/api/v1/auth/me').set('Authorization', `Bearer ${memberTok}`),
      request(srv())
        .delete(`/api/v1/staff/members/${memberMembership.id}`)
        .set('Authorization', `Bearer ${owner.accessToken}`),
    ]);
    // La richiesta in volo o completa (200) o viene rifiutata pulita (401/403),
    // mai uno stato a metà (500).
    expect([200, 401, 403]).toContain(memReq.status);
    expect(deact.status).toBe(200);
  });

  // B.7 — login dispositivo vs rigenerazione password: richiede un device KDS
  // provisionato (e quindi onboarding/venue completo), fuori dallo scope di
  // questa suite auth-only. Comportamento atteso/documentato: un login che ha
  // GIÀ letto l'hash prima della regen usa credenziali valide-all'istante; ogni
  // login successivo alla regen con la vecchia password fallisce. La garanzia
  // deterministica (vecchia password KO dopo regen) è coperta dai test devices.
  it.skip('B.7 — device login vs regen password (richiede device KDS provisionato)', () => {
    /* documentato sopra */
  });

  // B.8 — anti-lockout sotto concorrenza → resta sempre ≥1 titolare
  it('B.8 — due titolari si declassano a vicenda → mai zero titolari', async () => {
    const owner1 = await registerStaff(app);

    // Crea un secondo titolare: invito con ruolo 'titolare' + accept + login.
    const rolesRes = await request(srv())
      .get('/api/v1/staff/roles')
      .set('Authorization', `Bearer ${owner1.accessToken}`)
      .expect(200);
    const titolareRoleId = rolesRes.body.data.find(
      (r: { name: string }) => r.name === 'titolare',
    ).id;
    const nonOwnerId = rolesRes.body.data.find(
      (r: { name: string }) => r.name !== 'titolare',
    ).id;

    const owner2Email = uniqueEmail('b8-owner2');
    const inv = await request(srv())
      .post('/api/v1/staff/invitations')
      .set('Authorization', `Bearer ${owner1.accessToken}`)
      .send({ email: owner2Email, roleId: titolareRoleId })
      .expect(201);
    await request(srv())
      .post('/api/v1/staff/invitations/accept')
      .send({ token: inv.body.data.token, firstName: 'Own', lastName: 'Two', password: DEFAULT_PASSWORD })
      .expect(200);
    const owner2Tok = (await login(app, owner2Email, DEFAULT_PASSWORD)).accessToken;

    const members = await listMembers(owner1.accessToken);
    const m1 = members.find((m) => m.userId === owner1.userId)!;
    const m2 = members.find((m) => m.email === owner2Email)!;

    // In parallelo: owner1 declassa owner2 e owner2 declassa owner1.
    const demote = (token: string, membershipId: string) =>
      request(srv())
        .put(`/api/v1/staff/members/${membershipId}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roleId: nonOwnerId });

    const [a, b] = await Promise.all([
      demote(owner1.accessToken, m2.id),
      demote(owner2Tok, m1.id),
    ]);
    // Almeno una delle due deve fallire (altrimenti zero titolari).
    const failed = [a.status, b.status].filter((s) => s >= 400);
    expect(failed.length).toBeGreaterThanOrEqual(1);

    // Invariante: resta almeno un titolare attivo.
    const after = await listMembers(owner1.accessToken);
    const activeOwners = after.filter((m) => m.roleName === 'titolare' && m.isActive);
    expect(activeOwners.length).toBeGreaterThanOrEqual(1);
  });
});
