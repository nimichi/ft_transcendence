import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [HttpModule],
	controllers: [AuthController],
	providers: [AuthService, JwtService, PrismaModule]
})
export class AuthModule {}
