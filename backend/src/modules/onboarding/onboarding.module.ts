import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

import { OnboardingProgress } from './entities/onboarding-progress.entity';
import { RestaurantFiscalData } from './entities/restaurant-fiscal-data.entity';
import { Venue } from '../venue/entities/venue.entity';
import { Room } from '../venue/entities/room.entity';
import { Table } from '../venue/entities/table.entity';
import { Restaurant } from '../identity/entities/restaurant.entity';

import { IdentityModule } from '../identity/identity.module';
import { CatalogModule } from '../catalog/catalog.module';

// Tutte le entity usate (anche solo via EntityManager nelle transazioni)
// devono comparire in forFeature in qualche modulo, altrimenti TypeORM non
// le carica nel metadata registry.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      OnboardingProgress,
      RestaurantFiscalData,
      Venue,
      Room,
      Table,
      Restaurant,
    ]),
    IdentityModule,
    CatalogModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
