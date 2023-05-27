import { Module } from '@nestjs/common';
import { UploadImgService } from './upload_img.service';
import { UploadImgGateway } from './upload_img.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [HttpModule],
	providers: [UploadImgService, UploadImgGateway],
	exports: [UploadImgService]
})
export class UploadImgModule {}
