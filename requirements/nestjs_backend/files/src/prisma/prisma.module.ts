import { Module } from '@nestjs/common';
import { PrismaGateway } from './prisma.gateway';
import { PrismaService } from './prisma.service';
import { UploadImgService } from './services/upload_img.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [PrismaService, PrismaGateway, UploadImgService],
  imports: [HttpModule],
  exports: [PrismaService, UploadImgService, PrismaGateway],
})
export class PrismaModule {}
