import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, QueryFailedError } from 'typeorm';
import * as crypto from 'crypto';

import { OnboardingProgress } from './entities/onboarding-progress.entity';
import { RestaurantFiscalData } from './entities/restaurant-fiscal-data.entity';
import { Venue } from '../venue/entities/venue.entity';
import { Room } from '../venue/entities/room.entity';
import { Table } from '../venue/entities/table.entity';
import { Restaurant } from '../identity/entities/restaurant.entity';

import { SetMenuSourceDto } from './dto/set-menu-source.dto';
import { UpdateLocaleDto } from './dto/update-locale.dto';
import { CreateRoomsDto } from './dto/create-rooms.dto';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingProgress)
    private readonly progressRepo: Repository<OnboardingProgress>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly dataSource: DataSource,
    private readonly catalogService: CatalogService,
  ) {}

  // ─── Status ─────────────────────────────────────────────────────────────────

  async getStatus(restaurantId: string) {
    const progress = await this.requireProgress(restaurantId);
    const restaurant = await this.restaurantRepo.findOneBy({ id: restaurantId });
    if (!restaurant) throw new NotFoundException('Ristorante non trovato.');
    const venue = await this.venueRepo.findOne({
      where: { restaurantId, isDefault: true },
      relations: ['rooms', 'rooms.tables'],
    });

    return {
      steps: {
        menuUpload: progress.stepMenuUpload,
        aiProcessing: progress.stepAiProcessing,
        fiscalSetup: progress.stepFiscalSetup,
        stripeConnect: progress.stepStripeConnect,
        roomsTables: progress.stepRoomsTables,
        goLive: progress.stepGoLive,
      },
      completedAt: progress.completedAt,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        vatNumber: restaurant.vatNumber,
        platformStatus: restaurant.platformStatus,
      },
      venue: venue
        ? {
            id: venue.id,
            name: venue.name,
            addressStreet: venue.addressStreet,
            addressCity: venue.addressCity,
            addressZip: venue.addressZip,
            phone: venue.phone,
            rooms: venue.rooms?.map((r) => ({
              id: r.id,
              name: r.name,
              tablesCount: r.tables?.length ?? 0,
            })),
          }
        : null,
    };
  }

  // ─── Step 1: Sorgente menu ───────────────────────────────────────────────────

  async setMenuSource(restaurantId: string, dto: SetMenuSourceDto) {
    const progress = await this.requireProgress(restaurantId);

    if (dto.sourceType === 'url' && !dto.sourceUrl) {
      throw new BadRequestException('sourceUrl è richiesta per sourceType=url.');
    }

    await this.progressRepo.update(progress.id, {
      menuSourceType: dto.sourceType,
      menuSourceUrl: dto.sourceUrl ?? dto.fileKey ?? null,
      websiteUrl: dto.websiteUrl ?? null,
      stepMenuUpload: 'completed',
      // L'AI processing è asincrono (SQS job future). Per ora mock immediato.
      stepAiProcessing: 'processing',
    });

    // TODO: emetti job SQS per Claude API processing
    // Per MVP: simula completamento asincrono con dati mock
    this.simulateAiProcessing(progress.id, restaurantId);

    return { stepMenuUpload: 'completed', stepAiProcessing: 'processing' };
  }

  async getAiResult(restaurantId: string) {
    const progress = await this.requireProgress(restaurantId);
    return {
      stepAiProcessing: progress.stepAiProcessing,
      aiExtractionResult: progress.aiExtractionResult,
      aiExtractionReviewed: progress.aiExtractionReviewed,
    };
  }

  async reviewAiResult(restaurantId: string) {
    const progress = await this.requireProgress(restaurantId);

    if (progress.stepAiProcessing !== 'completed') {
      throw new BadRequestException('Il processing AI non è ancora completato.');
    }
    if (progress.aiExtractionReviewed) {
      throw new ConflictException('Il risultato AI è già stato confermato.');
    }

    await this.progressRepo.update(progress.id, { aiExtractionReviewed: true });
    return { aiExtractionReviewed: true };
  }

  // ─── Step 2a: Locale info ────────────────────────────────────────────────────

  async updateLocale(restaurantId: string, dto: UpdateLocaleDto) {
    const progress = await this.requireProgress(restaurantId);

    try {
      await this.dataSource.transaction(async (em) => {
      // 1. Aggiorna restaurant
      await em.update(Restaurant, restaurantId, {
        name: dto.name,
        ...(dto.vatNumber ? { vatNumber: this.normalizeVat(dto.vatNumber) } : {}),
      });

      // 2. Crea o aggiorna il venue di default
      let venue = await em.findOne(Venue, { where: { restaurantId, isDefault: true } });
      if (venue) {
        await em.update(Venue, venue.id, {
          name: dto.name,
          addressStreet: dto.addressStreet,
          addressCity: dto.addressCity,
          addressProvince: dto.addressProvince ?? '',
          addressZip: dto.addressZip,
          ...(dto.phone ? { phone: dto.phone } : {}),
        });
      } else {
        venue = em.create(Venue, {
          restaurantId,
          name: dto.name,
          isDefault: true,
          addressStreet: dto.addressStreet,
          addressCity: dto.addressCity,
          addressProvince: dto.addressProvince ?? '',
          addressZip: dto.addressZip,
          phone: dto.phone ?? null,
        });
        await em.save(venue);
      }

      // 3. Crea o aggiorna restaurant_fiscal_data
      const vatNumber = dto.vatNumber ? this.normalizeVat(dto.vatNumber) : null;
      let fiscal = await em.findOne(RestaurantFiscalData, { where: { restaurantId } });
      if (fiscal) {
        await em.update(RestaurantFiscalData, fiscal.id, {
          ...(vatNumber ? { vatNumber, legalName: dto.name } : {}),
          ...(dto.regimeFiscale ? { regimeFiscale: dto.regimeFiscale } : {}),
          fiscalAddress: dto.addressStreet,
          fiscalCity: dto.addressCity,
          fiscalProvince: dto.addressProvince ?? '',
          fiscalZip: dto.addressZip,
        });
      } else {
        fiscal = em.create(RestaurantFiscalData, {
          restaurantId,
          vatNumber: vatNumber ?? '',
          legalName: dto.name,
          regimeFiscale: dto.regimeFiscale ?? null,
          fiscalAddress: dto.addressStreet,
          fiscalCity: dto.addressCity,
          fiscalProvince: dto.addressProvince ?? '',
          fiscalZip: dto.addressZip,
        });
        await em.save(fiscal);
      }

      // 4. Aggiorna step
      const fiscalComplete = !!(vatNumber && dto.regimeFiscale);
      await em.update(OnboardingProgress, progress.id, {
        stepFiscalSetup: fiscalComplete ? 'completed' : 'in_progress',
      });
      });
    } catch (e) {
      // P.IVA già usata da un altro ristorante: il vincolo UNIQUE su
      // restaurants.vat_number fa fallire l'update con SQLSTATE 23505.
      // Convertito in 409 pulito invece di un 500 (stessa classe del bug B.1).
      if (e instanceof QueryFailedError && (e as { code?: string }).code === '23505') {
        throw new ConflictException('Partita IVA già registrata da un altro ristorante.');
      }
      throw e;
    }

    return { stepFiscalSetup: dto.vatNumber && dto.regimeFiscale ? 'completed' : 'in_progress' };
  }

  // ─── Step 2b: Stripe Connect ─────────────────────────────────────────────────

  async initiateStripeConnect(restaurantId: string) {
    const progress = await this.requireProgress(restaurantId);

    // TODO: chiamata reale a Stripe Connect API
    // Per MVP: restituisce URL placeholder
    const connectUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_placeholder&scope=read_write&state=${restaurantId}`;

    await this.progressRepo.update(progress.id, { stepStripeConnect: 'in_progress' });

    return { connectUrl, stepStripeConnect: 'in_progress' };
  }

  async completeStripeConnect(restaurantId: string, _stripeAccountId: string) {
    const progress = await this.requireProgress(restaurantId);
    // TODO: salva stripe_connect_account_id su restaurant
    await this.progressRepo.update(progress.id, { stepStripeConnect: 'completed' });
    return { stepStripeConnect: 'completed' };
  }

  // ─── Step 3: Sale e tavoli ───────────────────────────────────────────────────

  async createRooms(restaurantId: string, dto: CreateRoomsDto) {
    if (dto.rooms.length === 0) {
      throw new BadRequestException('Almeno una sala è richiesta.');
    }

    const venue = await this.venueRepo.findOne({ where: { restaurantId, isDefault: true } });
    if (!venue) {
      throw new BadRequestException(
        'Completa prima le informazioni del locale (step 2).',
      );
    }

    const progress = await this.requireProgress(restaurantId);

    await this.dataSource.transaction(async (em) => {
      // Elimina sale e tavoli esistenti (replace completo — idempotente)
      const existingRooms = await em.find(Room, { where: { venueId: venue.id } });
      if (existingRooms.length > 0) {
        const roomIds = existingRooms.map((r) => r.id);
        await em.delete(Table, { roomId: In(roomIds) });
        await em.delete(Room, { id: In(roomIds) });
      }

      // Crea le nuove sale con i tavoli
      for (let i = 0; i < dto.rooms.length; i++) {
        const roomDef = dto.rooms[i];
        const room = em.create(Room, {
          venueId: venue.id,
          name: roomDef.name,
          displayOrder: i,
          isActive: true,
        });
        await em.save(room);

        const tables = Array.from({ length: roomDef.tables }, (_, j) =>
          em.create(Table, {
            roomId: room.id,
            label: `T${j + 1}`,
            capacity: 4,
            status: 'free',
            qrToken: crypto.randomUUID(),
          }),
        );
        if (tables.length > 0) await em.save(tables);
      }

      await em.update(OnboardingProgress, progress.id, { stepRoomsTables: 'completed' });
    });

    const totalTables = dto.rooms.reduce((s, r) => s + r.tables, 0);
    return {
      stepRoomsTables: 'completed',
      roomsCreated: dto.rooms.length,
      tablesCreated: totalTables,
    };
  }

  // ─── Step 4: Go live ─────────────────────────────────────────────────────────

  async goLive(restaurantId: string) {
    const progress = await this.requireProgress(restaurantId);

    // Validazione minima: menu e sale devono essere completati
    if (progress.stepMenuUpload !== 'completed') {
      throw new BadRequestException('Carica prima il menù (step 1).');
    }
    if (progress.stepRoomsTables !== 'completed') {
      throw new BadRequestException('Configura le sale (step 3).');
    }

    await this.dataSource.transaction(async (em) => {
      await em.update(Restaurant, restaurantId, { platformStatus: 'active' });
      await em.update(OnboardingProgress, progress.id, {
        stepGoLive: 'completed',
        completedAt: new Date(),
      });
    });

    return { platformStatus: 'active', stepGoLive: 'completed' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async requireProgress(restaurantId: string): Promise<OnboardingProgress> {
    const progress = await this.progressRepo.findOne({ where: { restaurantId } });
    if (!progress) throw new NotFoundException('Onboarding non trovato per questo ristorante.');
    return progress;
  }

  private normalizeVat(raw: string): string {
    return raw.trim().toUpperCase().replace(/^IT/, '');
  }

  // Mock AI processing — sostituire con SQS job + Claude API.
  // In addition to salvare il JSON di estrazione, popoliamo il catalog
  // reale (menu + categorie + piatti) per dare un end-to-end completo.
  private simulateAiProcessing(progressId: string, restaurantId: string) {
    const mockResult = {
      source: 'mock',
      confidence: 0.92,
      extractedAt: new Date().toISOString(),
      categories: [
        {
          name: 'Antipasti',
          items: [
            { name: 'Bruschetta al pomodoro', price: 6.0 },
            { name: 'Tagliere di salumi', price: 12.0 },
          ],
        },
        {
          name: 'Primi',
          items: [
            { name: 'Cacio e pepe', price: 14.0 },
            { name: 'Amatriciana', price: 14.0 },
            { name: 'Carbonara', price: 14.0 },
          ],
        },
        {
          name: 'Secondi',
          items: [
            { name: 'Saltimbocca alla romana', price: 18.0 },
            { name: 'Coda alla vaccinara', price: 17.0 },
          ],
        },
      ],
    };

    setTimeout(async () => {
      try {
        await this.catalogService.createFromAiResult(restaurantId, mockResult);
        await this.progressRepo.update(progressId, {
          stepAiProcessing: 'completed',
          aiExtractionResult: mockResult,
        });
      } catch {
        await this.progressRepo.update(progressId, { stepAiProcessing: 'failed' });
      }
    }, 5000);
  }
}
