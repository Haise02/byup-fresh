import { IsEmail, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInvitationDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsUUID()
  roleId: string;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;

  @IsString()
  @MaxLength(64)
  firstName: string;

  @IsString()
  @MaxLength(64)
  lastName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
