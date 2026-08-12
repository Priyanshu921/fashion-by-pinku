import { Column, Model, Table, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Address } from './address.model';
import { OrderItem } from './order-item.model';

@Table({ timestamps: true })
export class Order extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Address)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare addressId: number;

  @BelongsTo(() => Address)
  declare address: Address;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare totalAmount: number;

  @Column({ type: DataType.STRING, defaultValue: 'PENDING' })
  declare status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare trackingNumber: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare courier: string;

  @HasMany(() => OrderItem)
  declare items: OrderItem[];
}
