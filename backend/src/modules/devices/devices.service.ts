import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { Device, DeviceType } from './entities/device.entity';
import { Venue } from '../venue/entities/venue.entity';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';

const BCRYPT_ROUNDS = 12;
const DEVICE_TOKEN_TTL = '365d';

/** Scope ridotto: il dispositivo può leggere comande del proprio venue,
 *  segnare ticket come ready/cancelled, ma non vede dati staff o impostazioni. */
const KDS_SCOPE = ['kitchen:read', 'kitchen:update'];
const POS_SCOPE = ['orders:read', 'payments:create', 'payments:read'];
const TABLET_SCOPE = ['orders:read', 'orders:create'];

function scopeFor(type: DeviceType): string[] {
  switch (type) {
    case 'kds': return KDS_SCOPE;
    case 'pos_terminal': return POS_SCOPE;
    case 'tablet': return TABLET_SCOPE;
  }
}

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
    @InjectRepository(Venue) private readonly venueRepo: Repository<Venue>,
    private readonly jwtService: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  async list(restaurantId: string): Promise<Device[]> {
    return this.deviceRepo
      .createQueryBuilder('d')
      .innerJoin('d.venue', 'v')
      .where('v.restaurant_id = :restaurantId', { restaurantId })
      .orderBy('d.created_at', 'ASC')
      .getMany();
  }

  async create(restaurantId: string, dto: CreateDeviceDto): Promise<{
    device: Device;
    username: string | null;
    password: string | null;
  }> {
    const venue = await this.venueRepo.findOne({
      where: { restaurantId, isDefault: true },
    });
    if (!venue) {
      throw new BadRequestException(
        'Crea prima il venue di default (completa l\'onboarding).',
      );
    }

    // Genera username e password solo per KDS
    let username: string | null = null;
    let rawPassword: string | null = null;
    let passwordHash: string | null = null;

    if (dto.type === 'kds') {
      const prefix = this.deviceCodePrefix(venue.name);
      const seq = await this.nextDeviceSeq(venue.id, dto.type);
      username = `${prefix}${seq}-${dto.name.toLowerCase().replace(/\s+/g, '')}`;
      rawPassword = crypto.randomBytes(6).toString('hex'); // 12 char
      passwordHash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);
    }

    const device = this.deviceRepo.create({
      venueId: venue.id,
      type: dto.type,
      name: dto.name,
      deviceModel: dto.deviceModel ?? null,
      username,
      passwordHash,
      isActive: true,
    });
    await this.deviceRepo.save(device);

    return {
      device,
      username,
      // Password rawpassword tornata solo qui — non più recuperabile dopo.
      password: rawPassword,
    };
  }

  async update(restaurantId: string, deviceId: string, dto: UpdateDeviceDto) {
    const device = await this.requireDevice(restaurantId, deviceId);
    Object.assign(device, dto);
    return this.deviceRepo.save(device);
  }

  async delete(restaurantId: string, deviceId: string) {
    const device = await this.requireDevice(restaurantId, deviceId);
    await this.deviceRepo.delete(device.id);
  }

  /** Genera una nuova password per il dispositivo (solo KDS) e invalida quella precedente. */
  async regeneratePassword(restaurantId: string, deviceId: string): Promise<{
    username: string | null;
    password: string;
  }> {
    const device = await this.requireDevice(restaurantId, deviceId);
    if (device.type !== 'kds') {
      throw new BadRequestException('Solo i dispositivi KDS hanno credenziali locali.');
    }
    const rawPassword = crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);
    await this.deviceRepo.update(device.id, { passwordHash });
    return { username: device.username, password: rawPassword };
  }

  // ─── Login dispositivo ──────────────────────────────────────────────────────

  async login(username: string, password: string) {
    const device = await this.deviceRepo.findOne({
      where: { username, isActive: true },
      relations: ['venue'],
    });
    if (!device || !device.passwordHash) {
      throw new UnauthorizedException('Credenziali non valide.');
    }
    const ok = await bcrypt.compare(password, device.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenziali non valide.');

    await this.deviceRepo.update(device.id, { lastSeenAt: new Date() });

    const token = this.jwtService.sign(
      {
        sub: device.id,
        type: 'device',
        deviceType: device.type,
        venueId: device.venueId,
        restaurantId: device.venue.restaurantId,
        scope: scopeFor(device.type),
      },
      {
        secret: this.cfg.get('jwt.accessSecret'),
        expiresIn: DEVICE_TOKEN_TTL,
      },
    );

    return {
      deviceToken: token,
      device: {
        id: device.id,
        type: device.type,
        name: device.name,
        venueId: device.venueId,
      },
      scope: scopeFor(device.type),
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async requireDevice(restaurantId: string, deviceId: string): Promise<Device> {
    const device = await this.deviceRepo.findOne({
      where: { id: deviceId },
      relations: ['venue'],
    });
    if (!device) throw new NotFoundException('Dispositivo non trovato.');
    if (device.venue.restaurantId !== restaurantId) {
      throw new ForbiddenException('Accesso negato a questo dispositivo.');
    }
    return device;
  }

  /** Prefisso "PG1" derivato dalle iniziali del venue. Es. "Cacio e Pepe" → "CP". */
  private deviceCodePrefix(venueName: string): string {
    const parts = venueName.split(/\s+/).filter(Boolean).slice(0, 3);
    return parts.map((p) => p[0].toUpperCase()).join('') || 'V';
  }

  private async nextDeviceSeq(venueId: string, type: DeviceType): Promise<number> {
    const count = await this.deviceRepo.count({ where: { venueId, type } });
    return count + 1;
  }
}
