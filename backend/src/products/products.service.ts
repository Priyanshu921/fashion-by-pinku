import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Product } from '../models/product.model';
import { Review } from '../models/review.model';
import { OrderItem } from '../models/order-item.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';

@Injectable()
export class ProductsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
    });
  }

  uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer || !Buffer.isBuffer(file.buffer)) {
        return resolve(null);
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'fashion-by-pinku', resource_type: 'auto' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary API Error Details:', error);
            return reject(error);
          }
          resolve(result);
        },
      );
      uploadStream.on('error', (err) => {
        console.error('Cloudinary Stream Error Details:', err);
        reject(err);
      });
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async create(data: any) {
    return await Product.create(data);
  }

  async findAll() {
    return await Product.findAll({ include: [Category] });
  }

  async findOne(id: number) {
    return await Product.findByPk(id, { include: [Category] });
  }

  async deleteProduct(id: number) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error('Product not found');
    await product.destroy();
    return { message: 'Product deleted successfully' };
  }

  async findBestSellers() {
    return await Product.findAll({
      where: { isBestSeller: true },
      include: [Category],
    });
  }

  async findNewArrivals() {
    return await Product.findAll({
      where: { isNewArrival: true },
      include: [Category],
      order: [['createdAt', 'DESC']],
    });
  }

  async createReview(productId: number, userId: number, rating: number, comment: string) {
    return await Review.create({ productId, userId, rating, comment });
  }

  async getReviews(productId: number) {
    const reviews = await Review.findAll({
      where: { productId },
      include: [
        { model: User, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const reviewsWithVerifiedStatus = await Promise.all(reviews.map(async (review) => {
      // Check if user is a verified buyer of this product
      const orderItem = await OrderItem.findOne({
        where: { productId: review.productId },
        include: [{
          model: Order,
          where: { userId: review.userId, status: 'PAID' }
        }]
      });
      
      const plainReview = review.get({ plain: true });
      return {
        ...plainReview,
        userName: plainReview.User?.name || 'Anonymous',
        isVerifiedBuyer: !!orderItem
      };
    }));

    return reviewsWithVerifiedStatus;
  }
}
