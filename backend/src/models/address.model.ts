import { Column, Model, Table, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ timestamps: true })
export class Address extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({ type: DataType.STRING, allowNull: false })
  declare street: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare city: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare state: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare zipCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare country: string;
}
