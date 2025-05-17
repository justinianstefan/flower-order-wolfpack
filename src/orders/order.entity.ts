import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderItem {
  @IsString()
  @IsNotEmpty()
  flowerId!: string;

  @IsString()
  @IsNotEmpty()
  flowerName!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @Column('simple-json')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  orderItems!: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @Column({ type: 'varchar', enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
