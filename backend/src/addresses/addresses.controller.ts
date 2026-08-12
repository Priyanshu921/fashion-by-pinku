import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Body() data: any) {
    return this.addressesService.create(data);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: number) {
    return this.addressesService.findAllByUser(userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.addressesService.remove(id);
  }
}
