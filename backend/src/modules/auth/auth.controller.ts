import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { email?: string; phone?: string; password: string; role?: 'customer'|'operator'|'admin' }) {
    return this.auth.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: { email?: string; phone?: string; password: string }) {
    return this.auth.signin(body);
  }
}
