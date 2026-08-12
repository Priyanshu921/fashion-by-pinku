import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Product } from './product.model';

@Table({ timestamps: true })
export class Category extends Model {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare name: string;

  @Column({ type: DataType.STRING, unique: true })
  declare slug: string;

  @Column({ type: DataType.STRING })
  declare image: string;

  @HasMany(() => Product)
  declare products: Product[];
}
