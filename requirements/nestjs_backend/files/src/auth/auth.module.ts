import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	imports: [HttpModule, PrismaModule],
	controllers: [AuthController],
	providers: [AuthService]
})
export class AuthModule {}
