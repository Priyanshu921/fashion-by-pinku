import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Address } from './address.model';
import { Order } from './order.model';
import { Review } from './review.model';

@Table({ timestamps: true })
export class User extends Model {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING })
  declare phone: string;

  @Column({ type: DataType.STRING, defaultValue: 'USER' })
  declare role: string;

  @HasMany(() => Address)
  declare addresses: Address[];

  @HasMany(() => Order)
  declare orders: Order[];

  @HasMany(() => Review)
  declare reviews: Review[];
}
