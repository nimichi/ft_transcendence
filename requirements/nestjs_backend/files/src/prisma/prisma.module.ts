// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';
import { PrismaGateway } from './prisma.gateway';

@Module({
  providers: [PrismaService, PrismaGateway],
  exports: [PrismaService],
})
export class PrismaModule {}
