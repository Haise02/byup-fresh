import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { Room } from './entities/room.entity';
import { Table } from './entities/table.entity';
import { VenueHours } from './entities/venue-hours.entity';
import { VenueSettings } from './entities/venue-settings.entity';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venue, Room, Table, VenueHours, VenueSettings]),
    IdentityModule,
  ],
  controllers: [VenueController],
  providers: [VenueService],
  exports: [TypeOrmModule, VenueService],
})
export class VenueModule {}
