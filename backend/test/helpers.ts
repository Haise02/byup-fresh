import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

/**
 * Storage del throttler che NON accumula mai: ogni `increment` ritorna
 * `isBlocked: false`. Il ThrottlerGuard (throttler v6) lancia solo `if
 * (isBlocked)`, quindi così il rate limiting è di fatto disabilitato nei test.
 *
 * Perché serve: i test delle sezioni A (volume) e B (concorrenza) sparano molte
 * richieste a /auth/* in pochi secondi e tutte condividono la stessa app (quindi
 * lo stesso contatore per-IP). Il rate limiter (5 login/register al minuto, per
 * design) bloccherebbe lo *script di test*, non il sistema sotto esame — è il
 * "fratricidio" documentato come bug 5.3.
 *
 * NB: non si può usare `.overrideGuard(ThrottlerGuard)` perché in app.module il
 * guard è registrato come `{ provide: APP_GUARD, useClass: ThrottlerGuard }`:
 * con `useClass` Nest istanzia la classe direttamente e `overrideGuard` non la
 * intercetta. Le DIPENDENZE del guard, però, restano risolte via DI — quindi
 * sovrascrivere il provider `ThrottlerStorage` funziona ed è il modo robusto.
 */
const noopThrottlerStorage: ThrottlerStorage = {
  increment: async () => ({
    totalHits: 0,
    timeToExpire: 0,
    isBlocked: false,
    timeToBlockExpire: 0,
  }),
};

/**
 * Bootstrap dell'app per i test e2e, con la STESSA configurazione di main.ts
 * (prefix, ValidationPipe, GlobalExceptionFilter) ma con il rate limiter
 * neutralizzato (vedi `noopThrottlerStorage`).
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ThrottlerStorage)
    .useValue(noopThrottlerStorage)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.init();
  return app;
}

let counter = 0;
/** Email univoca e irripetibile fra run successivi (il DB non viene resettato). */
export function uniqueEmail(tag = 'e2e'): string {
  counter += 1;
  return `${tag}-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 7)}@byup.test`;
}

export const DEFAULT_PASSWORD = 'TestPwd123!';

export interface RegisteredStaff {
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  restaurantId: string;
  userId: string;
}

/** Registra un titolare e ritorna le credenziali/token utili ai test. */
export async function registerStaff(
  app: INestApplication,
  opts: { email?: string; password?: string; restaurantName?: string } = {},
): Promise<RegisteredStaff> {
  const email = opts.email ?? uniqueEmail('reg');
  const password = opts.password ?? DEFAULT_PASSWORD;
  const restaurantName =
    opts.restaurantName ?? `Trattoria ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/staff/register')
    .send({ email, password, firstName: 'E2E', lastName: 'Test', restaurantName });

  if (res.status !== 201) {
    throw new Error(`registerStaff: atteso 201, ricevuto ${res.status}: ${JSON.stringify(res.body)}`);
  }

  return {
    email,
    password,
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    restaurantId: res.body.data.restaurant.id,
    userId: res.body.data.user.id,
  };
}

/** Esegue il login e ritorna access + refresh token. */
export async function login(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/staff/login')
    .send({ email, password })
    .expect(200);
  return { accessToken: res.body.data.accessToken, refreshToken: res.body.data.refreshToken };
}
