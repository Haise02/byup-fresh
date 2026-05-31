import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { MenuSourceType } from '../entities/onboarding-progress.entity';

export class SetMenuSourceDto {
  @IsEnum(['photo', 'document', 'pdf', 'url'])
  sourceType: MenuSourceType;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  // fileKey: set by the upload handler after S3 upload (future)
  @IsOptional()
  @IsString()
  fileKey?: string;
}
