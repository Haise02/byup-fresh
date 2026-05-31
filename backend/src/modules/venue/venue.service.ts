import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Venue } from './entities/venue.entity';
import { VenueHours } from './entities/venue-hours.entity';
import { VenueSettings } from './entities/venue-settings.entity';

import { SetVenueHoursDto } from './dto/venue-hours.dto';
import { UpdateVenueSettingsDto } from './dto/venue-settings.dto';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(Venue) private readonly venueRepo: Repository<Venue>,
    @InjectRepository(VenueHours) private readonly hoursRepo: Repository<VenueHours>,
    @InjectRepository(VenueSettings) private readonly settingsRepo: Repository<VenueSettings>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Venue di default ───────────────────────────────────────────────────────

  async getDefaultVenue(restaurantId: string): Promise<Venue> {
    const venue = await this.venueRepo.findOne({
      where: { restaurantId, isDefault: true },
    });
    if (!venue) {
      throw new NotFoundException(
        'Nessun venue di default per questo ristorante. Completa l\'onboarding.',
      );
    }
    return venue;
  }

  // ─── Orari ──────────────────────────────────────────────────────────────────

  async getHours(restaurantId: string) {
    const venue = await this.getDefaultVenue(restaurantId);
    return this.hoursRepo.find({
      where: { venueId: venue.id },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async setHours(restaurantId: string, dto: SetVenueHoursDto) {
    const venue = await this.getDefaultVenue(restaurantId);

    // Validazione: niente giorni duplicati
    const seen = new Set<number>();
    for (const h of dto.hours) {
      if (seen.has(h.dayOfWeek)) {
        throw new BadRequestException(
          `dayOfWeek=${h.dayOfWeek} ripetuto. Usa una sola riga per giorno.`,
        );
      }
      seen.add(h.dayOfWeek);
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(VenueHours, { venueId: venue.id });
      const rows = dto.hours.map((h) =>
        em.create(VenueHours, {
          venueId: venue.id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        }),
      );
      if (rows.length > 0) await em.save(rows);
    });

    return this.getHours(restaurantId);
  }

  // ─── Settings (upsert lazy) ─────────────────────────────────────────────────

  async getSettings(restaurantId: string) {
    const venue = await this.getDefaultVenue(restaurantId);
    let settings = await this.settingsRepo.findOne({ where: { venueId: venue.id } });
    if (!settings) {
      // Lazy create con i default — l'ERD ha tutti i default sensibili.
      settings = this.settingsRepo.create({ venueId: venue.id });
      settings = await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(restaurantId: string, dto: UpdateVenueSettingsDto) {
    const settings = await this.getSettings(restaurantId);
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }
}
