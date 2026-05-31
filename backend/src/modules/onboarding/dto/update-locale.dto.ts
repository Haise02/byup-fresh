import { IsEnum, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { RegimeFiscale } from '../entities/restaurant-fiscal-data.entity';

export class UpdateLocaleDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  // Accepts both IT + 11 digits or just 11 digits — normalized server-side
  vatNumber?: string;

  @IsString()
  @MaxLength(200)
  addressStreet: string;

  @IsString()
  @MaxLength(64)
  addressCity: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  addressProvince?: string;

  @IsString()
  @Matches(/^\d{5}$/, { message: 'CAP deve essere 5 cifre' })
  addressZip: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(['ordinario', 'forfettario', 'semplificato'])
  regimeFiscale?: RegimeFiscale;
}
