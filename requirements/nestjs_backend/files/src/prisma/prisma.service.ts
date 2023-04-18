// src/prisma/prisma.service.ts

import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators';

@Injectable()
export class PrismaService extends PrismaClient {
	async onModuleInit() {
		await this.$connect();
	  }

	async enableShutdownHooks(app: INestApplication) {
		this.$on('beforeExit', async () => {
		  await app.close();
		});
	}

	async createUser(data: User): Promise<User> {
		const user = await this.user.create({ data });
		return user;
	  }
}
