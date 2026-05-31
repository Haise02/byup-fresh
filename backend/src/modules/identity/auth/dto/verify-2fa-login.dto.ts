import { IsString, Length } from 'class-validator';

export class Verify2faLoginDto {
  @IsString()
  twoFactorToken: string;

  @IsString()
  @Length(6, 8)
  code: string;
}
