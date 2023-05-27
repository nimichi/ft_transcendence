import { Module } from '@nestjs/common';
import { UploadImgService } from './upload_img.service';
import { UploadImgGateway } from './upload_img.gateway';

@Module({
  providers: [UploadImgService, UploadImgGateway]
})
export class UploadImgModule {}
