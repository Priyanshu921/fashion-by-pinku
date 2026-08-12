import { Injectable, NotFoundException } from '@nestjs/common';
import { Address } from '../models/address.model';

@Injectable()
export class AddressesService {
  async create(data: any) {
    return await Address.create(data);
  }

  async findAllByUser(userId: number) {
    return await Address.findAll({ where: { userId } });
  }

  async remove(id: number) {
    const address = await Address.findByPk(id);
    if (!address) throw new NotFoundException('Address not found');
    await address.destroy();
    return { message: 'Address removed successfully' };
  }
}
