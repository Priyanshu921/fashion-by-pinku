import { Column, Model, Table, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Category } from './category.model';
import { OrderItem } from './order-item.model';
import { Review } from './review.model';

@Table({ timestamps: true })
export class Product extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: number;

  @Column({ type: DataType.TEXT })
  declare imageSrc: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isBestSeller: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isNewArrival: boolean;

  @Column({ type: DataType.JSONB })
  declare sizes: any;

  @HasMany(() => OrderItem)
  declare orderItems: OrderItem[];

  @HasMany(() => Review)
  declare reviews: Review[];
}
