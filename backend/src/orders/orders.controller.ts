import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    return await this.ordersService.getUserOrders(parseInt(userId, 10));
  }

  @Get('all')
  async getAllOrders() {
    return await this.ordersService.getAllOrders();
  }

  @Post()
  async createOrder(@Body() data: any) {
    return await this.ordersService.createOrder(data);
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() data: any) {
    return await this.ordersService.updateOrder(parseInt(id, 10), data);
  }

  @Post('razorpay')
  async createRazorpayOrder(@Body() data: any) {
    return await this.ordersService.createRazorpayOrder(data);
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(@Body() data: any) {
    return await this.ordersService.verifyRazorpayPayment(data);
  }
}
