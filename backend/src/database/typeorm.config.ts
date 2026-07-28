/**
 * DataSource per la CLI di TypeORM (script migration:generate / run / revert).
 *
 * Vive separato da database.module.ts perche' la CLI gira fuori dal contesto
 * Nest e non ha ConfigService: legge le stesse variabili d'ambiente a mano.
 * Tenere i due file allineati se cambia la configurazione del database.
 *
 * synchronize resta SEMPRE false qui: con le migrazioni lo schema lo governano
 * loro, e un sync accidentale dalla CLI sovrascriverebbe il lavoro.
 */
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

loadEnv();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
