import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Restaurant } from '../../identity/entities/restaurant.entity';

export type OnboardingStepStatus = 'pending' | 'in_progress' | 'processing' | 'completed' | 'failed';
export type MenuSourceType = 'photo' | 'document' | 'pdf' | 'url';

@Entity('onboarding_progress')
export class OnboardingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'restaurant_id', unique: true })
  restaurantId: string;

  @Column({ name: 'step_menu_upload', default: 'pending' })
  stepMenuUpload: OnboardingStepStatus;

  @Column({ name: 'step_ai_processing', default: 'pending' })
  stepAiProcessing: OnboardingStepStatus;

  @Column({ name: 'step_fiscal_setup', default: 'pending' })
  stepFiscalSetup: OnboardingStepStatus;

  @Column({ name: 'step_stripe_connect', default: 'pending' })
  stepStripeConnect: OnboardingStepStatus;

  @Column({ name: 'step_rooms_tables', default: 'pending' })
  stepRoomsTables: OnboardingStepStatus;

  @Column({ name: 'step_go_live', default: 'pending' })
  stepGoLive: OnboardingStepStatus;

  @Column({ name: 'menu_source_type', nullable: true })
  menuSourceType: MenuSourceType;

  @Column({ name: 'menu_source_url', type: 'varchar', nullable: true })
  menuSourceUrl: string | null;

  @Column({ name: 'website_url', type: 'varchar', nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'ai_extraction_result', type: 'json', nullable: true })
  aiExtractionResult: Record<string, unknown>;

  @Column({ name: 'ai_extraction_reviewed', default: false })
  aiExtractionReviewed: boolean;

  @Column({ name: 'fiscal_credentials_provided', default: false })
  fiscalCredentialsProvided: boolean;

  @Column({ name: 'fiscal_validation_status', nullable: true })
  fiscalValidationStatus: string;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @OneToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
