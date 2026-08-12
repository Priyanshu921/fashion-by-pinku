import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const { name, email, password } = body;
    const existingUsersCount = await User.count();
    const role = existingUsersCount === 0 ? 'ADMIN' : 'USER'; // Make first user ADMIN
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    
    const payload = { email: user.email, sub: user.id };
    return {
      message: 'Registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: this.jwtService.sign(payload),
    };
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      token: this.jwtService.sign(payload)
    };
  }

  @Post('profile')
  async updateProfile(@Body() body: any) {
    const { userId, name, phone, password } = body;
    const user = await User.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    return {
      message: 'Profile updated successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    };
  }
}
