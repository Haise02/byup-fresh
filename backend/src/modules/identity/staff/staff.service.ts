import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../entities/user.entity';
import { Role, SYSTEM_ROLES } from '../entities/role.entity';
import { Membership } from '../entities/membership.entity';
import { Invitation } from '../entities/invitation.entity';

import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { CreateRoleDto, UpdateRoleDto, sanitizePermissions } from './dto/role.dto';
import { UpdateMembershipRoleDto } from './dto/membership.dto';

const BCRYPT_ROUNDS = 12;
const INVITATION_TTL_DAYS = 7;

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Membership) private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(Invitation) private readonly invitationRepo: Repository<Invitation>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── INVITATIONS ────────────────────────────────────────────────────────────

  async createInvitation(restaurantId: string, invitedBy: string, dto: CreateInvitationDto) {
    // Il ruolo deve esistere e appartenere a questo ristorante (o essere di sistema)
    const role = await this.requireRole(restaurantId, dto.roleId);

    // Email già membro attivo?
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      const existingMembership = await this.membershipRepo.findOne({
        where: { userId: existingUser.id, restaurantId, isActive: true },
      });
      if (existingMembership) {
        throw new ConflictException(
          'Questa persona è già nello staff di questo ristorante.',
        );
      }
    }

    // Invito pending già attivo per la stessa email?
    const existingInvite = await this.invitationRepo.findOne({
      where: { restaurantId, email: dto.email, status: 'pending' },
    });
    if (existingInvite) {
      throw new ConflictException(
        'Un invito è già stato inviato a questa email. Revoca quello precedente o aspetta che scada.',
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);

    const invitation = this.invitationRepo.create({
      restaurantId,
      roleId: role.id,
      email: dto.email,
      token,
      status: 'pending',
      invitedBy,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    // TODO: integrare SES per invio email reale.
    // Per ora il token viene loggato — in dev può essere usato direttamente.
    this.logger.log(
      `Invito creato per ${dto.email} (restaurant=${restaurantId}). Token: ${token}`,
    );

    return {
      id: invitation.id,
      email: invitation.email,
      role: role.name,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      // In dev/MVP esponiamo il token nella response, così frontend può
      // costruire il link di accept anche senza email. Da rimuovere in prod
      // quando SES è collegato.
      token,
    };
  }

  async listInvitations(restaurantId: string) {
    return this.invitationRepo.find({
      where: { restaurantId },
      relations: ['role', 'inviter'],
      order: { createdAt: 'DESC' },
    });
  }

  async revokeInvitation(restaurantId: string, invitationId: string) {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId },
    });
    if (!invitation) throw new NotFoundException('Invito non trovato.');
    if (invitation.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questo invito.');
    }
    if (invitation.status !== 'pending') {
      throw new BadRequestException(`L'invito è già ${invitation.status}.`);
    }
    await this.invitationRepo.update(invitation.id, { status: 'revoked' });
  }

  /**
   * Verifica un token e ritorna info per la preview pre-accept.
   * Endpoint pubblico — non richiede JWT.
   */
  async verifyInvitation(token: string) {
    const invitation = await this.invitationRepo.findOne({
      where: { token },
      relations: ['role', 'restaurant'],
    });
    if (!invitation) throw new NotFoundException('Invito non valido.');
    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Questo invito è ${invitation.status}.`);
    }
    if (invitation.expiresAt < new Date()) {
      await this.invitationRepo.update(invitation.id, { status: 'expired' });
      throw new BadRequestException('Questo invito è scaduto.');
    }

    return {
      email: invitation.email,
      restaurantName: invitation.restaurant.name,
      roleName: invitation.role.name,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Accetta un invito. Endpoint pubblico.
   * Per ora supporta solo nuovi utenti — se l'email esiste già, errore.
   * Quando avremo password reset + flow "accetta come utente loggato",
   * estenderemo qui.
   */
  async acceptInvitation(dto: AcceptInvitationDto) {
    return this.dataSource.transaction(async (em) => {
      // Lock pessimistico sulla riga invito: due accept simultanee con lo stesso
      // token si serializzano qui. Il perdente, una volta ottenuto il lock,
      // rilegge lo stato ormai 'accepted' e cade nel ramo 400 sotto (test B.2).
      // NB: niente `relations` con pessimistic_write — il LEFT JOIN farebbe
      // fallire il FOR UPDATE su Postgres; il ruolo lo carichiamo a parte.
      const invitation = await em.findOne(Invitation, {
        where: { token: dto.token },
        lock: { mode: 'pessimistic_write' },
      });
      if (!invitation) throw new NotFoundException('Invito non valido.');
      if (invitation.status !== 'pending') {
        throw new BadRequestException(`Questo invito è ${invitation.status}.`);
      }
      if (invitation.expiresAt < new Date()) {
        await em.update(Invitation, invitation.id, { status: 'expired' });
        throw new BadRequestException('Questo invito è scaduto.');
      }

      const role = await em.findOne(Role, { where: { id: invitation.roleId } });
      if (!role) throw new NotFoundException('Ruolo dell\'invito non trovato.');

      const existing = await em.findOne(User, { where: { email: invitation.email } });
      if (existing) {
        throw new ConflictException(
          'Esiste già un account con questa email. Accedi e accetta l\'invito dal pannello.',
        );
      }

      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      const user = em.create(User, {
        email: invitation.email,
        passwordHash,
        type: 'staff',
        firstName: dto.firstName,
        lastName: dto.lastName,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
      await em.save(user);

      const membership = em.create(Membership, {
        userId: user.id,
        restaurantId: invitation.restaurantId,
        roleId: invitation.roleId,
        isActive: true,
        invitedBy: invitation.invitedBy,
        invitedAt: invitation.createdAt,
        acceptedAt: new Date(),
      });
      await em.save(membership);

      await em.update(Invitation, invitation.id, {
        status: 'accepted',
        acceptedAt: new Date(),
      });

      return {
        userId: user.id,
        email: user.email,
        restaurantId: invitation.restaurantId,
        roleId: invitation.roleId,
        roleName: role.name,
      };
    });
  }

  // ─── MEMBERSHIPS ────────────────────────────────────────────────────────────

  async listMembers(restaurantId: string) {
    const memberships = await this.membershipRepo.find({
      where: { restaurantId },
      relations: ['user', 'role'],
      order: { createdAt: 'ASC' },
    });
    return memberships.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      avatarUrl: m.user.avatarUrl ?? null,
      roleId: m.roleId,
      roleName: m.role.name,
      isActive: m.isActive,
      acceptedAt: m.acceptedAt,
      lastLoginAt: m.user.lastLoginAt,
    }));
  }

  async updateMemberRole(
    restaurantId: string,
    currentUserId: string,
    membershipId: string,
    dto: UpdateMembershipRoleDto,
  ) {
    const membership = await this.requireMembership(restaurantId, membershipId);
    const newRole = await this.requireRole(restaurantId, dto.roleId);

    const isOwnerDemotion =
      membership.role.name === SYSTEM_ROLES.TITOLARE && newRole.name !== SYSTEM_ROLES.TITOLARE;

    // Vietato auto-downgrade del titolare corrente (evita lockout dovuto a errore)
    if (isOwnerDemotion && membership.userId === currentUserId) {
      throw new BadRequestException(
        'Non puoi rimuovere a te stesso il ruolo di titolare. Promuovi un altro membro prima.',
      );
    }

    // Check anti-lockout + update nella stessa transazione: il lock sugli owner
    // attivi serializza demotion concorrenti, l'update vede lo stato bloccato.
    await this.dataSource.transaction(async (em) => {
      if (isOwnerDemotion) {
        await this.ensureNotLastOwner(em, restaurantId, membership.id);
      }
      await em.update(Membership, membership.id, { roleId: newRole.id });
    });

    return this.listMembers(restaurantId).then((list) =>
      list.find((m) => m.id === membership.id),
    );
  }

  async deactivateMember(
    restaurantId: string,
    currentUserId: string,
    membershipId: string,
  ) {
    const membership = await this.requireMembership(restaurantId, membershipId);

    if (membership.userId === currentUserId) {
      throw new BadRequestException('Non puoi disattivare te stesso.');
    }
    if (!membership.isActive) {
      throw new BadRequestException('Questo membro è già disattivato.');
    }

    // Check anti-lockout + update nella stessa transazione (vedi updateMemberRole).
    await this.dataSource.transaction(async (em) => {
      if (membership.role.name === SYSTEM_ROLES.TITOLARE) {
        await this.ensureNotLastOwner(em, restaurantId, membership.id);
      }
      await em.update(Membership, membership.id, {
        isActive: false,
        deactivatedAt: new Date(),
      });
    });
  }

  // ─── ROLES ──────────────────────────────────────────────────────────────────

  async listRoles(restaurantId: string) {
    // 3 ruoli di sistema del ristorante + eventuali custom
    return this.roleRepo.find({
      where: { restaurantId },
      order: { isSystem: 'DESC', createdAt: 'ASC' },
    });
  }

  async createRole(restaurantId: string, dto: CreateRoleDto) {
    const name = dto.name.trim().toLowerCase();
    if ((SYSTEM_ROLES as Record<string, string>)[name.toUpperCase()] === name) {
      throw new ConflictException(`"${name}" è un ruolo di sistema riservato.`);
    }
    const existing = await this.roleRepo.findOne({ where: { restaurantId, name } });
    if (existing) throw new ConflictException('Esiste già un ruolo con questo nome.');

    const role = this.roleRepo.create({
      restaurantId,
      name,
      isSystem: false,
      permissions: sanitizePermissions(dto.permissions),
    });
    return this.roleRepo.save(role);
  }

  async updateRole(restaurantId: string, roleId: string, dto: UpdateRoleDto) {
    const role = await this.requireRole(restaurantId, roleId);
    if (role.isSystem) {
      // I ruoli di sistema permettono solo cambio permissions, non rename
      if (dto.name && dto.name.trim().toLowerCase() !== role.name) {
        throw new BadRequestException(
          'I ruoli di sistema non possono essere rinominati.',
        );
      }
    } else if (dto.name) {
      const newName = dto.name.trim().toLowerCase();
      if (newName !== role.name) {
        const conflict = await this.roleRepo.findOne({
          where: { restaurantId, name: newName },
        });
        if (conflict) throw new ConflictException('Esiste già un ruolo con questo nome.');
        role.name = newName;
      }
    }
    if (dto.permissions) {
      role.permissions = sanitizePermissions(dto.permissions);
    }
    return this.roleRepo.save(role);
  }

  async deleteRole(restaurantId: string, roleId: string) {
    const role = await this.requireRole(restaurantId, roleId);
    if (role.isSystem) {
      throw new BadRequestException('I ruoli di sistema non possono essere eliminati.');
    }
    const inUse = await this.membershipRepo.count({ where: { roleId: role.id } });
    if (inUse > 0) {
      throw new ConflictException(
        `Questo ruolo è assegnato a ${inUse} membro/i. Riassegnali prima di eliminarlo.`,
      );
    }
    await this.roleRepo.delete(role.id);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async requireRole(restaurantId: string, roleId: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Ruolo non trovato.');
    if (role.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questo ruolo.');
    }
    return role;
  }

  private async requireMembership(
    restaurantId: string,
    membershipId: string,
  ): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({
      where: { id: membershipId },
      relations: ['role'],
    });
    if (!membership) throw new NotFoundException('Membro non trovato.');
    if (membership.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questo membro.');
    }
    return membership;
  }

  /**
   * Garantisce che il ristorante non resti senza titolari. Va chiamata DENTRO
   * una transazione (`em`): prende un lock pessimistico su tutte le righe
   * titolare attive, così due operazioni simultanee che declassano/disattivano
   * titolari diversi si serializzano. Il secondo, ottenuto il lock, rilegge lo
   * stato già aggiornato dal primo e vede 0 titolari residui → blocca (test B.8).
   * Niente `relations`/outer-join col lock: romperebbe il FOR UPDATE su Postgres.
   */
  private async ensureNotLastOwner(
    em: EntityManager,
    restaurantId: string,
    excludeMembershipId: string,
  ) {
    const titolareRole = await em.findOne(Role, {
      where: { restaurantId, name: SYSTEM_ROLES.TITOLARE },
    });
    if (!titolareRole) return; // edge case improbabile

    const activeOwners = await em
      .getRepository(Membership)
      .createQueryBuilder('m')
      .setLock('pessimistic_write')
      .where('m.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('m.role_id = :roleId', { roleId: titolareRole.id })
      .andWhere('m.is_active = true')
      .getMany();

    const remaining = activeOwners.filter((m) => m.id !== excludeMembershipId).length;
    if (remaining === 0) {
      throw new BadRequestException(
        'Deve esistere almeno un titolare attivo. Promuovi un altro membro a titolare prima di procedere.',
      );
    }
  }
}
