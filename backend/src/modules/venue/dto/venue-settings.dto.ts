import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KitchenMode, PaymentMethod } from '../entities/venue-settings.entity';

const PAYMENT_METHODS: PaymentMethod[] = ['card_terminal', 'in_app', 'cash'];

export class UpdateVenueSettingsDto {
  @IsOptional()
  @IsBoolean()
  validateExternalOrders?: boolean;

  @IsOptional()
  @IsEnum(['kds', 'printer', 'both'])
  kitchenMode?: KitchenMode;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(PAYMENT_METHODS, { each: true })
  paymentMethodsEnabled?: PaymentMethod[];

  @IsOptional()
  @IsBoolean()
  serviceChargeEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(50)
  serviceChargePercentage?: number;

  @IsOptional()
  @IsBoolean()
  autoPrintReceipt?: boolean;

  // I cap @Max tengono i valori "sensati" e — soprattutto — evitano l'overflow
  // della colonna int4 Postgres (max 2_147_483_647): senza, un 999999999999
  // arriverebbe al DB e produrrebbe un 500 invece di un 400 (vedi test A.15).
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440) // 24h in minuti
  noOrderWarnMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  noOrderAlertMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  overstayMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(720) // 30 giorni in ore
  oldBillHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  defaultReservationDurationMin?: number;

  @IsOptional()
  @IsBoolean()
  autoAssignTable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  noShowTimeoutMin?: number;
}
