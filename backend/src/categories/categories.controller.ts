import { Controller, Get, Post, Delete, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categories')
export class CategoriesController {
  @Get()
  async findAll() {
    return await Category.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: { name: string; slug?: string; image?: string }) {
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Category with this name/slug already exists');
    }
    return await Category.create({ name: body.name, slug, image: body.image || '' });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const category = await Category.findByPk(parseInt(id, 10));
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Cascading Safety: Check if products are linked to this category before allowing deletion
    const linkedProductsCount = await Product.count({ where: { categoryId: category.id } });
    if (linkedProductsCount > 0) {
      throw new BadRequestException(`Cannot delete category. It currently has ${linkedProductsCount} product(s) associated with it.`);
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
}
