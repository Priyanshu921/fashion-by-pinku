import { Controller, Get, Post, Delete, Body, UseInterceptors, UploadedFile, UseGuards, Param, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get('best-sellers')
  async findBestSellers() {
    return await this.productsService.findBestSellers();
  }

  @Get('new-arrivals')
  async findNewArrivals() {
    return await this.productsService.findNewArrivals();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    console.log('[DEBUG] Product upload received. File:', file ? { name: file.originalname, size: file.size, mime: file.mimetype, bufferLength: file.buffer?.length } : 'None');

    let imageUrl = body.imageSrc || '';

    let buffer: Buffer | null = file?.buffer || null;
    if (file && !buffer && (file as any).path) {
      try {
        buffer = fs.readFileSync((file as any).path);
        file.buffer = buffer;
      } catch (e) {
        console.error('Error reading uploaded file path:', e);
      }
    }

    if (file && buffer) {
      try {
        const result = await this.productsService.uploadImage(file);
        console.log('[DEBUG] Cloudinary upload result:', result);
        if (result && result.secure_url) {
          imageUrl = result.secure_url;
          console.log('[DEBUG] Using Cloudinary secure_url:', imageUrl);
        } else {
          const mime = file.mimetype || 'image/png';
          imageUrl = `data:${mime};base64,${buffer.toString('base64')}`;
          console.log('[DEBUG] Fallback to base64 Data URI length:', imageUrl.length);
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed, using Data URI of uploaded file:', uploadErr);
        const mime = file.mimetype || 'image/png';
        imageUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      }
    }

    if (!imageUrl) {
      imageUrl = 'https://via.placeholder.com/800x800?text=No+Image';
      console.log('[DEBUG] Using fallback Placeholder URL:', imageUrl);
    }

    console.log('[DEBUG] Final imageUrl being saved to database:', imageUrl.substring(0, 150));

    const data = {
      title: body.title,
      price: parseFloat(body.price) || 0,
      description: body.description || '',
      categoryId: parseInt(body.categoryId, 10) || null,
      isBestSeller: String(body.isBestSeller) === 'true',
      isNewArrival: String(body.isNewArrival) === 'true',
      imageSrc: imageUrl,
    };
    return await this.productsService.create(data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.productsService.deleteProduct(parseInt(id, 10));
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string) {
    return await this.productsService.getReviews(parseInt(id, 10));
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    const { rating, comment } = body;
    const userId = req.user.userId;
    return await this.productsService.createReview(parseInt(id, 10), userId, rating, comment);
  }
}
