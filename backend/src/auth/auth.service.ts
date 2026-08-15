import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
    
    // Access token lives for 15 minutes
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Refresh token lives for 7 days. We prepend user.id to make lookup fast.
    const rawToken = crypto.randomBytes(64).toString('hex');
    const refreshToken = `${user.id}.${rawToken}`;
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    // Save hashed refresh token to user
    user.refreshToken = hashedRefreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }
}
