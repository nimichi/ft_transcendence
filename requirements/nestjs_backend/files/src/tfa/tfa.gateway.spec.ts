import { Test, TestingModule } from '@nestjs/testing';
import { TfaGateway } from './tfa.gateway';

describe('TfaGateway', () => {
  let gateway: TfaGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TfaGateway],
    }).compile();

    gateway = module.get<TfaGateway>(TfaGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
