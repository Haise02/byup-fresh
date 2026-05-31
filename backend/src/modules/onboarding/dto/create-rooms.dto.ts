import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class RoomDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsInt()
  @Min(0)
  @Max(200)
  tables: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateRoomsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms: RoomDto[];
}
