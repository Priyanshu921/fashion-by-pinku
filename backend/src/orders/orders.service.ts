import { Injectable, BadRequestException } from '@nestjs/common';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');

@Injectable()
export class OrdersService {
  private razorpay: any;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_abc123',
    });
  }

  async getUserOrders(userId: number) {
    return await Order.findAll({
      where: { userId },
      include: [
        { model: OrderItem, include: [Product] },
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Address }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async getAllOrders() {
    return await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem, include: [Product] },
        { model: Address }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async createOrder(data: any) {
    try {
      const { userId, addressId, total, items, status = 'PENDING' } = data;
      const order = await Order.create({
        userId,
        addressId,
        totalAmount: total,
        status
      });

      for (const item of items) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        });
      }
      return order;
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Error creating order');
    }
  }

  async createRazorpayOrder(data: any) {
    const { amount } = data; // amount in INR
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };
    try {
      const order = await this.razorpay.orders.create(options);
      return { order_id: order.id };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Could not create Razorpay order');
    }
  }

  async verifyRazorpayPayment(data: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = data;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_abc123';

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is successful, create the order in DB with PAID status
      const order = await this.createOrder({ ...orderData, status: 'PAID' });
      return { success: true, order };
    } else {
      throw new BadRequestException('Payment verification failed');
    }
  }
}
