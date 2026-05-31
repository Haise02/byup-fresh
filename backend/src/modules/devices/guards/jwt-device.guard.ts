import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtDeviceGuard extends AuthGuard('jwt-device') {}
