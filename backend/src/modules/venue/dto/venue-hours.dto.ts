import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class VenueHoursDayDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  // HH:MM (24h)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'openTime deve essere HH:MM' })
  openTime: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'closeTime deve essere HH:MM' })
  closeTime: string;

  @IsBoolean()
  isClosed: boolean;
}

export class SetVenueHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueHoursDayDto)
  hours: VenueHoursDayDto[];
}
