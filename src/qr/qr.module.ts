import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [PrismaModule, EventModule],
  controllers: [QrController],
  providers: [QrService],
})
export class QrModule {}
