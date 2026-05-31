import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Allergen, ALLERGEN_CODES, AllergenCode } from '../entities/allergen.entity';
import { Tag, TAG_NAMES, TagName } from '../entities/tag.entity';

const ALLERGEN_LABELS_IT: Record<AllergenCode, string> = {
  gluten: 'Glutine',
  crustaceans: 'Crostacei',
  eggs: 'Uova',
  fish: 'Pesce',
  peanuts: 'Arachidi',
  soybeans: 'Soia',
  milk: 'Latte',
  nuts: 'Frutta a guscio',
  celery: 'Sedano',
  mustard: 'Senape',
  sesame: 'Sesamo',
  sulphites: 'Solfiti',
  lupin: 'Lupini',
  molluscs: 'Molluschi',
};

const TAG_DISPLAY_ORDER: Record<TagName, number> = {
  senza_glutine: 0,
  vegano: 1,
  vegetariano: 2,
  bio: 3,
  piccante: 4,
  senza_lattosio: 5,
};

@Injectable()
export class CatalogSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CatalogSeedService.name);

  constructor(
    @InjectRepository(Allergen)
    private readonly allergenRepo: Repository<Allergen>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAllergens();
    await this.seedTags();
  }

  private async seedAllergens() {
    const existing = await this.allergenRepo.count();
    if (existing >= ALLERGEN_CODES.length) return;

    const rows = ALLERGEN_CODES.map((code) =>
      this.allergenRepo.create({ code, nameIt: ALLERGEN_LABELS_IT[code] }),
    );

    // upsert per code (idempotente in caso di re-run su DB parzialmente popolato)
    await this.allergenRepo.upsert(rows, ['code']);
    this.logger.log(`Seeded ${rows.length} allergens.`);
  }

  private async seedTags() {
    const existing = await this.tagRepo.count();
    if (existing >= TAG_NAMES.length) return;

    const rows = TAG_NAMES.map((name) =>
      this.tagRepo.create({ name, displayOrder: TAG_DISPLAY_ORDER[name] }),
    );

    await this.tagRepo.upsert(rows, ['name']);
    this.logger.log(`Seeded ${rows.length} tags.`);
  }
}
