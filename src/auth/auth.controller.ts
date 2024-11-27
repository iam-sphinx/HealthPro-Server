import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserDetails(@Req() req: Request & { user: any }) {
    const result = await this.userService.findUserById(req.user?.id);
    return result;
  }

  @Post('/signup')
  async signup(@Body() body: AuthDto) {
    const result = await this.authService.signup(body);
    return result;
  }

  @Post('/signin')
  async signin(@Body() body: AuthDto) {
    const result = await this.authService.signin(body);
    return result;
  }
}
