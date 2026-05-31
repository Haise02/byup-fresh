import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, registerStaff, uniqueEmail, DEFAULT_PASSWORD } from './helpers';

/**
 * SEZIONE A — Robustezza degli input malformati.
 * Obiettivo: il sistema rifiuta input sporchi con un errore PULITO (4xx) e mai
 * con un 500 o accettandoli. Tutte le risposte di errore seguono lo schema
 * { success:false, error:{ code, message } }.
 */
describe('Sezione A — input malformati', () => {
  let app: INestApplication;
  const REGISTER = '/api/v1/auth/staff/register';

  const validBody = () => ({
    email: uniqueEmail('a'),
    password: DEFAULT_PASSWORD,
    firstName: 'Mario',
    lastName: 'Rossi',
    restaurantName: `Locale ${Date.now()}`,
  });

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });

  // A.1 — JSON malformato → 400, mai 500
  it('A.1 — JSON rotto → 400 pulito (non 500)', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .set('Content-Type', 'application/json')
      .send('{"email": "a@b.com", "password": '); // parentesi non chiusa
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('A.1bis — testo non-JSON con content-type json → 400', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .set('Content-Type', 'application/json')
      .send('questo non è json');
    expect(res.status).toBe(400);
  });

  // A.2 — campo obbligatorio mancante
  it('A.2 — manca email → 400 che indica il campo', async () => {
    const { email, ...noEmail } = validBody();
    void email;
    const res = await request(app.getHttpServer()).post(REGISTER).send(noEmail);
    expect(res.status).toBe(400);
    expect(res.body.error.message.toLowerCase()).toContain('email');
  });

  // A.3 — tipo sbagliato
  it('A.3 — email numero / password array → 400', async () => {
    const r1 = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: 12345 });
    expect(r1.status).toBe(400);

    const r2 = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), password: ['a', 'b'] });
    expect(r2.status).toBe(400);
  });

  // A.4 — campo estremamente lungo → 400 (esiste un limite), mai errore DB
  it('A.4 — restaurantName da 10.000 caratteri → 400', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), restaurantName: 'x'.repeat(10_000) });
    expect(res.status).toBe(400);
  });

  // A.5 — stringa vuota dove serve un valore
  it('A.5 — email "" e password "" → 400', async () => {
    const r1 = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: '' });
    expect(r1.status).toBe(400);

    const r2 = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), password: '' });
    expect(r2.status).toBe(400);
  });

  // A.6 — solo spazi bianchi → trimming lo rende vuoto → rifiutato
  it('A.6 — restaurantName di soli spazi → 400', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), restaurantName: '       ' });
    expect(res.status).toBe(400);
  });

  // A.7 — unicode/emoji accettati e salvati integri
  it('A.7 — emoji + caratteri cinesi nel nome → 201 e dato integro al readback', async () => {
    const name = '寿司 Bar 🍣 “Là” n°1';
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), restaurantName: name });
    expect(res.status).toBe(201);
    // Integrità: il nome torna identico nella response di creazione...
    expect(res.body.data.restaurant.name).toBe(name);
    // ...e anche rileggendolo via /me dopo il login.
    const token = res.body.data.accessToken;
    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.restaurant.name).toBe(name);
  });

  // A.8 — SQL injection trattata come testo, DB intatto
  it('A.8 — payload SQL injection salvato come testo, users intatta', async () => {
    const evil = "'; DROP TABLE users; --";
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), restaurantName: evil });
    expect(res.status).toBe(201);
    expect(res.body.data.restaurant.name).toBe(evil);

    // Prova che la tabella users esiste ancora e funziona: una nuova
    // registrazione + login va a buon fine.
    const fresh = await registerStaff(app);
    expect(fresh.accessToken).toBeDefined();
  });

  // A.9 — operator injection (oggetti $gt/$ne) → 400 per tipo non valido
  it('A.9 — {"$gt":""} / {"$ne":null} nei campi → 400', async () => {
    const r1 = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: { $gt: '' } });
    expect(r1.status).toBe(400);

    const r2 = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), password: { $ne: null } });
    expect(r2.status).toBe(400);
  });

  // A.10 — XSS payload salvato grezzo, nessun crash
  it('A.10 — <script> nel nome → 201, salvato come testo grezzo', async () => {
    const xss = '<script>alert(1)</script>';
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), restaurantName: xss });
    expect(res.status).toBe(201);
    expect(res.body.data.restaurant.name).toBe(xss);
  });

  // A.11 — formati email limite
  it('A.11 — plus-addressing e sottodominio accettati; formato palese rifiutato', async () => {
    const plus = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: `mario+test-${Date.now()}@dominio.it` });
    expect(plus.status).toBe(201);

    const sub = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: `info-${Date.now()}@mail.sub.dominio.it` });
    expect(sub.status).toBe(201);

    const bad = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: 'non-una-email' });
    expect(bad.status).toBe(400);
  });

  // A.12 — header Authorization malformato → 401 pulito
  it('A.12 — Authorization malformato → 401', async () => {
    const me = '/api/v1/auth/me';
    for (const header of ['', 'Bearer', 'Bearer ', 'xyz-no-bearer', 'Bearer abc.def']) {
      const res = await request(app.getHttpServer()).get(me).set('Authorization', header);
      expect(res.status).toBe(401);
    }
  });

  // A.13 — Content-Type sbagliato → 400/415, mai crash
  it('A.13 — body JSON con Content-Type text/plain → 400 o 415', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify(validBody()));
    expect([400, 415]).toContain(res.status);
  });

  // A.14 — payload gigante → 413, non satura la memoria
  it('A.14 — body da ~2MB → 413 Payload Too Large', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), restaurantName: 'x'.repeat(2 * 1024 * 1024) });
    expect(res.status).toBe(413);
  });

  // A.15 — numeri fuori range su campi interi (venue settings) → 400 al pipe
  it('A.15 — interi negativi/decimali/enormi su venue/settings → 400', async () => {
    const { accessToken } = await registerStaff(app);
    const settings = '/api/v1/venue/settings';
    const auth = `Bearer ${accessToken}`;

    const neg = await request(app.getHttpServer())
      .patch(settings)
      .set('Authorization', auth)
      .send({ noOrderWarnMin: -5 });
    expect(neg.status).toBe(400);

    const dec = await request(app.getHttpServer())
      .patch(settings)
      .set('Authorization', auth)
      .send({ noOrderWarnMin: 1.5 });
    expect(dec.status).toBe(400);

    const huge = await request(app.getHttpServer())
      .patch(settings)
      .set('Authorization', auth)
      .send({ noOrderWarnMin: 999999999999 });
    expect(huge.status).toBe(400);
  });

  // A.16 — null esplicito su campo obbligatorio → 400
  it('A.16 — email: null → 400', async () => {
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), email: null });
    expect(res.status).toBe(400);
  });

  // A.17 — array dove è atteso un oggetto (e campo oggetto dove serve stringa)
  it('A.17 — body array e campo oggetto → 400', async () => {
    const arrBody = await request(app.getHttpServer())
      .post(REGISTER)
      .set('Content-Type', 'application/json')
      .send('[]');
    expect(arrBody.status).toBe(400);

    const objField = await request(app.getHttpServer())
      .post(REGISTER)
      .send({ ...validBody(), firstName: { nested: true } });
    expect(objField.status).toBe(400);
  });

  // A.18 — chiave duplicata nel JSON → comportamento deterministico (vince l'ultima)
  it('A.18 — restaurantName duplicato → vince l\'ultimo, nessun crash', async () => {
    const email = uniqueEmail('a18');
    const raw =
      `{"email":"${email}","password":"${DEFAULT_PASSWORD}",` +
      `"firstName":"A","lastName":"B",` +
      `"restaurantName":"PRIMO","restaurantName":"SECONDO"}`;
    const res = await request(app.getHttpServer())
      .post(REGISTER)
      .set('Content-Type', 'application/json')
      .send(raw);
    expect(res.status).toBe(201);
    expect(res.body.data.restaurant.name).toBe('SECONDO');
  });
});
