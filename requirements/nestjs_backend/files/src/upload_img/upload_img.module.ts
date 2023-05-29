import { Module } from '@nestjs/common';
import { UploadImgService } from './upload_img.service';
import { UploadImgGateway } from './upload_img.gateway';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	imports: [HttpModule, PrismaModule],
	providers: [UploadImgService, UploadImgGateway],
	exports: [UploadImgService]
})
export class UploadImgModule {}
