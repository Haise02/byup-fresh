import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SYSTEM_ROLES } from '../../entities/role.entity';

/**
 * Permette l'accesso solo agli utenti con role "titolare" sul ristorante corrente.
 * Da usare DOPO JwtAuthGuard (così request.user è popolato).
 *
 * Why: gestione staff (inviti, ruoli custom, disattivazione membership)
 * è prerogativa del titolare. Camerieri e cassa non possono modificare il team.
 */
@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Autenticazione richiesta.');
    }
    if (user.role !== SYSTEM_ROLES.TITOLARE) {
      throw new ForbiddenException(
        'Solo il titolare può eseguire questa operazione.',
      );
    }
    return true;
  }
}
