import { IsUUID } from 'class-validator';

export class UpdateMembershipRoleDto {
  @IsUUID()
  roleId: string;
}
