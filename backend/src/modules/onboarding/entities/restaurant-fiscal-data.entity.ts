import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Restaurant } from '../../identity/entities/restaurant.entity';

export type RegimeFiscale = 'ordinario' | 'forfettario' | 'semplificato';
export type OpenapiChannelStatus = 'active' | 'suspended' | 'error';

@Entity('restaurant_fiscal_data')
export class RestaurantFiscalData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', unique: true })
  restaurantId: string;

  @Column({ name: 'vat_number' })
  vatNumber: string;

  @Column({ name: 'legal_name' })
  legalName: string;

  @Column({ nullable: true })
  insegna: string;

  @Column({ name: 'regime_fiscale', type: 'varchar', nullable: true })
  regimeFiscale: RegimeFiscale | null;

  @Column({ name: 'codice_ateco', nullable: true })
  codiceAteco: string;

  @Column({ name: 'rea_number', nullable: true })
  reaNumber: string;

  @Column({ nullable: true })
  cciaa: string;

  @Column({ name: 'capitale_sociale', type: 'decimal', nullable: true })
  capitaleSociale: number;

  @Column({ name: 'socio_unico', nullable: true })
  socioUnico: boolean;

  @Column({ name: 'in_liquidazione', nullable: true })
  inLiquidazione: boolean;

  @Column({ name: 'fiscal_address', nullable: true })
  fiscalAddress: string;

  @Column({ name: 'fiscal_city', nullable: true })
  fiscalCity: string;

  @Column({ name: 'fiscal_province', nullable: true })
  fiscalProvince: string;

  @Column({ name: 'fiscal_zip', nullable: true })
  fiscalZip: string;

  @Column({ name: 'codice_sdi', nullable: true })
  codiceSdi: string;

  @Column({ nullable: true })
  pec: string;

  @Column({ nullable: true })
  iban: string;

  @Column({ name: 'bic_swift', nullable: true })
  bicSwift: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'openapi_channel_configured', default: false })
  openapiChannelConfigured: boolean;

  @Column({ name: 'openapi_channel_status', nullable: true })
  openapiChannelStatus: OpenapiChannelStatus;

  @Column({ name: 'openapi_validation_date', nullable: true })
  openapiValidationDate: Date;

  @OneToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
