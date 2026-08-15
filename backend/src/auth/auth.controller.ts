import { Controller, Post, Body, UnauthorizedException, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('register')
  async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { name, email, password } = body;
    const existingUsersCount = await User.count();
    const role = existingUsersCount === 0 ? 'ADMIN' : 'USER';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    
    const { accessToken, refreshToken } = await this.authService.generateTokens(user);
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: 'Registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: accessToken,
    };
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const { accessToken, refreshToken } = await this.authService.generateTokens(user);
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      token: accessToken
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    // Find the user whose hashed refresh token matches
    // Since we don't have the user ID from the cookie, we have to find by matching hash
    // A better approach is to store userId inside a JWT refresh token, but since we used a random string,
    // we need a way to look up the user. Let's fix this logic!
    
    // Actually, bcrypt.compare is slow and we can't query the DB by it directly.
    // I should change the refresh token to be a signed JWT or append the userId to the string.
    // Let's assume we append the user id to the token string: userId.randomString
    const parts = refreshToken.split('.');
    if (parts.length !== 2) throw new UnauthorizedException('Invalid refresh token format');
    
    const userId = parts[0];
    const user = await User.findByPk(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.authService.generateTokens(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { token: tokens.accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (refreshToken) {
      const parts = refreshToken.split('.');
      if (parts.length === 2) {
        const user = await User.findByPk(parts[0]);
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      }
    }
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  async logoutAll(@Body() body: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { password } = body;
    const refreshToken = req.cookies['refreshToken'];
    
    if (!refreshToken) throw new UnauthorizedException('Not authenticated');
    
    const parts = refreshToken.split('.');
    if (parts.length !== 2) throw new UnauthorizedException('Invalid session');
    
    const user = await User.findByPk(parts[0]);
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    user.refreshToken = null;
    await user.save();
    res.clearCookie('refreshToken');

    return { message: 'Logged out of all devices successfully' };
  }

  @Post('profile')
  async updateProfile(@Body() body: any) {
    const { userId, name, phone, password, currentPassword } = body;
    const user = await User.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found');

    if (password) {
      if (!currentPassword) {
        throw new UnauthorizedException('Current password is required to set a new password');
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) throw new UnauthorizedException('Incorrect current password');
      user.password = await bcrypt.hash(password, 10);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    return {
      message: 'Profile updated successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    };
  }
}
