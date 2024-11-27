import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { PrismaModule } from './prisma/prisma.module';
import { QrModule } from './qr/qr.module';

import { EventService } from './event/event.service';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    BcryptModule,
    PrismaModule,
    QrModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, UserService, EventService],
})
export class AppModule {}
