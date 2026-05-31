import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Trim difensivo: i campi testo vengono normalizzati PRIMA della validazione,
// così "     " diventa "" e viene poi rifiutato da @IsNotEmpty (vedi test A.6).
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterStaffDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(64)
  firstName: string;

  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(64)
  lastName: string;

  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(128)
  restaurantName: string;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  vatNumber?: string;
}
