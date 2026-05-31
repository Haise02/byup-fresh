import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VatCategory } from '../entities/menu-item.entity';

export class CreateItemDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  foodCost?: number;

  @IsOptional()
  @IsEnum(['prepared_on_site', 'packaged_product'])
  vatCategory?: VatCategory;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  recipe?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  foodCost?: number;

  @IsOptional()
  @IsEnum(['prepared_on_site', 'packaged_product'])
  vatCategory?: VatCategory;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  recipe?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class SetItemAllergensDto {
  @IsArray()
  @IsUUID('all', { each: true })
  allergenIds: string[];
}

export class SetItemTagsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds: string[];
}
