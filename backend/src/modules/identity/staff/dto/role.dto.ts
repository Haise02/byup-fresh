import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

// Le 8 aree funzionali del gestionale (allineate all'ERD).
export interface RolePermissionsBody {
  panoramica?: boolean;
  sala?: boolean;
  cucina?: boolean;
  app?: boolean;
  statistiche?: boolean;
  contabilita?: boolean;
  supporto?: boolean;
  impostazioni?: boolean;
}

export class CreateRoleDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsObject()
  permissions: RolePermissionsBody;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsObject()
  permissions?: RolePermissionsBody;
}

// Tipo dei valori dentro permissions — solo booleani sulle 8 aree.
// Lasciato a livello body senza nested validation per snellire.
export const PERMISSION_AREAS = [
  'panoramica',
  'sala',
  'cucina',
  'app',
  'statistiche',
  'contabilita',
  'supporto',
  'impostazioni',
] as const;
export type PermissionArea = (typeof PERMISSION_AREAS)[number];

// Convenience: forza solo le chiavi conosciute, normalizza i valori a boolean.
export function sanitizePermissions(input: RolePermissionsBody | undefined): Record<PermissionArea, boolean> {
  const out = {} as Record<PermissionArea, boolean>;
  for (const area of PERMISSION_AREAS) {
    out[area] = Boolean(input?.[area]);
  }
  return out;
}
