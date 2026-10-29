import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityEntity } from './activity.entity';

/** File attached directly to a sub-process (activity), stored on the server. */
@Entity('activity_attachments')
export class ActivityAttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  activityId: string;

  @ManyToOne(() => ActivityEntity, (activity) => activity.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activityId' })
  @Exclude()
  activity: ActivityEntity;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 127, nullable: true })
  mimeType: string | null;

  @Column({ type: 'varchar', length: 512 })
  storedPath: string;

  @Column({ type: 'varchar', length: 255 })
  storedFileName: string;

  @Column({ type: 'int', default: 0 })
  fileSize: number;

  @Column({ type: 'varchar', length: 255 })
  uploadedByEmail: string;

  @Column({ type: 'varchar', length: 120 })
  uploadedByName: string;

  @CreateDateColumn()
  createdAt: Date;
}
