import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './models/user.model';
import { Category } from './models/category.model';
import { Product } from './models/product.model';
import { Address } from './models/address.model';
import { Order } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { Review } from './models/review.model';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { AddressesModule } from './addresses/addresses.module';
import { KeepAliveService } from './keep-alive/keep-alive.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      uri: process.env.DATABASE_URL,
      models: [User, Category, Product, Address, Order, OrderItem, Review],
      autoLoadModels: true,
      synchronize: false,
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    AddressesModule,
  ],
  controllers: [HealthController],
  providers: [KeepAliveService],
})
export class AppModule {}
