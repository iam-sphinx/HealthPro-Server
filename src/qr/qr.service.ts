import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as QRCode from 'qrcode';
import { OptionalFilters } from './dto/qr.dto';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async getUserQRCodes(user: any) {
    const qrCodes = await this.prisma.qRCode.findMany({
      where: { ownerId: user?.id },
    });

    if (!qrCodes || qrCodes.length == 0) {
      throw new HttpException('no qr code found', HttpStatus.NOT_FOUND);
    }

    return qrCodes;
  }

  async generateStaticQRCode({
    url,
    metadata,
    user,
  }: {
    url: string;
    metadata?: object;
    user: any;
  }) {
    const createdQR = await this.prisma.qRCode.create({
      data: {
        url,
        isDynamic: false,
        metadata,
        ownerId: user.id,
      },
    });

    const redirectUri = `${process.env.BASE_URI}/qr/redirect?id=${createdQR.id}`;
    const qrCode = await QRCode.toDataURL(redirectUri);

    const newQrCode = await this.prisma.qRCode.update({
      where: { id: createdQR.id },
      data: { qrImage: qrCode },
    });

    return { qrCode: newQrCode.qrImage };
  }

  async generateDynamicQRCode({
    url,
    metadata,
    user,
  }: {
    url: string;
    metadata?: object;
    user: any;
  }) {
    const createdQR = await this.prisma.qRCode.create({
      data: {
        url,
        isDynamic: true,
        metadata,
        ownerId: user.id,
      },
    });

    const redirectUri = `${process.env.BASE_URI}/qr/redirect?id=${createdQR.id}`;
    const qrCode = await QRCode.toDataURL(redirectUri);

    const newQrCode = await this.prisma.qRCode.update({
      where: { id: createdQR.id },
      data: { qrImage: qrCode },
    });

    return { qrCode: newQrCode.qrImage, id: createdQR.id };
  }

  async updateDynamicQRCode(id: number, newUrl: string, user: any) {
    const qrCode = await this.prisma.qRCode.findUnique({
      where: { id, ownerId: user?.id },
    });

    if (!qrCode) {
      throw new HttpException('QR code does not exist', HttpStatus.NOT_FOUND);
    }

    if (!qrCode.isDynamic) {
      throw new HttpException('QR code is not dynamic', HttpStatus.BAD_REQUEST);
    }

    if (qrCode.url === newUrl) {
      throw new HttpException(
        'The new URL is the same as the current one',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [updatedQrCode] = await this.prisma.$transaction([
      this.prisma.urlHistory.create({
        data: {
          qrCodeId: id,
          previousUrl: qrCode.url,
          updatedUrl: newUrl,
        },
      }),
      this.prisma.qRCode.update({
        where: { id },
        data: { url: newUrl },
      }),
    ]);

    return updatedQrCode;
  }

  detectPlatform(userAgent: string): string {
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh/i.test(userAgent)) return 'Mac';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'Unknown Platform';
  }

  async redirectQRtoURI(id: number) {
    const qrInfo = await this.prisma.qRCode.findUnique({ where: { id } });
    if (!qrInfo) {
      throw new HttpException('qr code not found', HttpStatus.NOT_FOUND);
    }

    return qrInfo.url;
  }
}
