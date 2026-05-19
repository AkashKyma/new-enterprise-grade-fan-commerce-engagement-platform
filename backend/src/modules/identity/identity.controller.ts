import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserFromToken } from '../auth/user.decorator';

@Controller('identity')
export class IdentityController {
  constructor(private readonly svc: IdentityService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@UserFromToken() user: any) {
    return this.svc.getProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/link')
  async link(@Param('id') id: string, @Body() body: any) {
    return this.svc.linkProvider(id, body.provider, body.providerId, body.meta || {});
  }
}
