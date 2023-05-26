// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaGateway } from './prisma.gateway';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService, PrismaGateway],
  exports: [PrismaService],
})
export class PrismaModule {}
