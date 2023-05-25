import { Module } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { TfaController } from './tfa.controller';
import { TfaGateway } from './tfa.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TfaService, TfaGateway],
  controllers: [TfaController],
  exports: [TfaService]
})
export class TfaModule {}
