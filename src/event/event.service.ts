import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { timestamp } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto, OptionalFilters } from 'src/qr/dto/qr.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getTrackedEvents(qrCodeId: number) {
    const trackedEvents = await this.prisma.event.findMany({
      where: { qrCodeId },
    });

    return trackedEvents;
  }

  async addEvent(id: number, data: CreateEventDto) {
    const qrCode = await this.prisma.qRCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      throw new HttpException(
        'either QR code does not belong to you or does not exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.event.create({
      data: {
        qrCodeId: id,
        ...data,
      },
    });

    return { message: 'successfully created an event' };
  }

  async getTotalScans(qrCodeId: number) {
    return this.prisma.event.count({ where: { qrCodeId } });
  }

  async getUniqueUsers(qrCodeId: number) {
    return this.prisma.event
      .groupBy({
        by: ['device'],
        where: { qrCodeId },
        _count: true,
      })
      .then((groups) => groups.length);
  }

  async getTimeBasedTrends(queryFilter: any) {
    return this.prisma.event.groupBy({
      by: ['timestamp'],
      where: queryFilter,
      _count: { timestamp: true },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getGeographicDistribution(queryFilter: any) {
    return this.prisma.event.groupBy({
      by: ['location'],
      where: queryFilter,
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
    });
  }

  async getDeviceAnalysis(queryFilter: any) {
    return this.prisma.event.groupBy({
      by: ['device'],
      where: queryFilter,
      _count: { device: true },
    });
  }
  async getPlatformAnalysis(queryFilter: any) {
    return this.prisma.event.groupBy({
      by: ['platform'],
      where: queryFilter,
      _count: { platform: true },
      orderBy: { _count: { platform: 'desc' } },
    });
  }

  async getQRCodeAnalytics(qrCodeId: number, filters: OptionalFilters) {
    const queryFilters: any = { qrCodeId };

    if (filters?.date) {
      const startDay = new Date(filters.date);
      startDay.setHours(0, 0, 0, 0);

      const endDay = new Date(startDay);
      endDay.setHours(23, 59, 59, 999);

      queryFilters.timestamp = {
        gte: startDay,
        lte: endDay,
      };
    }

    if (filters?.range && filters.range.length === 2) {
      const [startDate, endDate] = filters.range;
      const startTimeStamp = new Date(startDate);
      const endTimeStamp = new Date(endDate);

      if (isNaN(startTimeStamp.getTime()) || isNaN(endTimeStamp.getTime())) {
        throw new Error('Invalid date range');
      }

      queryFilters.timestamp = {
        gte: startTimeStamp,
        lte: endTimeStamp,
      };
    }

    const [
      totalScans,
      uniqueUsers,
      timeTrends,
      geoDistributions,
      deviceAnalytics,
      platformAnalytics,
    ] = await Promise.all([
      this.getTotalScans(qrCodeId),
      this.getUniqueUsers(qrCodeId),
      this.getTimeBasedTrends(queryFilters),
      this.getGeographicDistribution(queryFilters),
      this.getDeviceAnalysis(queryFilters),
      this.getPlatformAnalysis(queryFilters),
    ]);

    return {
      totalScans,
      uniqueUsers,
      timeTrends,
      geoDistributions,
      deviceAnalytics,
      platformAnalytics,
    };
  }
}
