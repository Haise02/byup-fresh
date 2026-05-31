import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Auth e2e — register/login/me', () => {
  let app: INestApplication;
  const ts = Date.now();
  const email = `e2e-${ts}@byup.test`;
  const password = 'TestPwd123!';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register → 201 con accessToken + restaurant', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/staff/register')
      .send({
        email,
        password,
        firstName: 'E2E',
        lastName: 'Test',
        restaurantName: `E2E Trattoria ${ts}`,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.restaurant.id).toBeDefined();
  });

  it('register duplicato → 409 Conflict', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/staff/register')
      .send({
        email,
        password: 'OtherPwd123!',
        firstName: 'X',
        lastName: 'Y',
        restaurantName: 'Other',
      })
      .expect(409);
  });

  it('login con password sbagliata → 401 + messaggio generico', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/staff/login')
      .send({ email, password: 'WrongPassword' })
      .expect(401);

    expect(res.body.error.message).toContain('non valide');
    // No leak: messaggio NON contiene "password" o "email"
    expect(res.body.error.message.toLowerCase()).not.toContain('password');
    expect(res.body.error.message.toLowerCase()).not.toContain('email');
  });

  it('login → me round-trip', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/staff/login')
      .send({ email, password })
      .expect(200);
    const token = login.body.data.accessToken;

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.data.user.email).toBe(email);
    expect(me.body.data.role).toBe('titolare');
    expect(me.body.data.permissions.impostazioni).toBe(true);
  });

  it('endpoint protetto senza token → 401', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .expect(401);
  });
});
