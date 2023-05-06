import { Module } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { TfaController } from './tfa.controller';

@Module({
  providers: [TfaService],
  controllers: [TfaController]
})
export class TfaModule {}
