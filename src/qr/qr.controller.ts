import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QrService } from './qr.service';
import {
  CreateEventDto,
  CreateQRDto,
  OptionalFilters,
  UpdateQRDto,
} from './dto/qr.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EventService } from 'src/event/event.service';

@Controller('qr')
export class QrController {
  constructor(
    private qrService: QrService,
    private eventService: EventService,
  ) {}

  @Get('my-codes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserQRCodes(@Req() req: Request) {
    return this.qrService.getUserQRCodes(req.user);
  }

  @Post('static')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateStaticQRCode(
    @Body() createQrDto: CreateQRDto,
    @Req() req: Request,
  ) {
    return this.qrService.generateStaticQRCode({
      ...createQrDto,
      user: req.user,
    });
  }

  @Post('dynamic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateDynamicQRCode(
    @Body() createQRDto: CreateQRDto,
    @Req() req: Request,
  ) {
    return this.qrService.generateDynamicQRCode({
      ...createQRDto,
      user: req.user,
    });
  }

  @Put(':id/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateDynamicQRCode(
    @Param('id') id: number,
    @Body() updateQRDto: UpdateQRDto,
    @Req() req: Request,
  ) {
    return this.qrService.updateDynamicQRCode(id, updateQRDto.newUrl, req.user);
  }

  @Get('redirect')
  async redirectQRtoURI(
    @Query('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const url = await this.qrService.redirectQRtoURI(id);

    const userIP =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
    const platform = this.qrService.detectPlatform(userAgent);

    await this.eventService.addEvent(id, {
      device: userAgent,
      location: userIP,
      platform,
    });

    return res.redirect(url);
  }

  @Post(':id/track')
  async trackQRCodeEvent(
    @Param('id') id: number,
    @Body()
    createEventDto: CreateEventDto,
    @Req() req: Request,
  ) {
    return this.eventService.addEvent(id, createEventDto);
  }

  @Get(':id/events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTrackedEvents(@Param('id') id: number) {
    return this.eventService.getTrackedEvents(id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getQRCodeAnalytics(
    @Param('id') id: number,
    @Query() filters: OptionalFilters,
  ) {
    return this.eventService.getQRCodeAnalytics(id, filters);
  }
}
