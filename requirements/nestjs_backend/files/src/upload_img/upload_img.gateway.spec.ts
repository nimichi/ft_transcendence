import { Test, TestingModule } from '@nestjs/testing';
import { UploadImgGateway } from './upload_img.gateway';

describe('UploadImgGateway', () => {
  let gateway: UploadImgGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadImgGateway],
    }).compile();

    gateway = module.get<UploadImgGateway>(UploadImgGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
