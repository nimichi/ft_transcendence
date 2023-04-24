// src/prisma/prisma.service.ts

import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
      await app.close();
  }

  async createUser(data: User): Promise<User> {
	const check = await this.user.findUnique({
		where: {
			id: data.id,
		}
	});
	if (!check)
	{
		const user = await this.user.create({ data });
		console.log(await this.user.findMany());
		return user;
	}
	console.log("found");
	console.log(check);
  }

  async findUserById(id: number) {
    return await this.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async updateUser(id: number, User_Name: string) {
    return await this.user.update({
      where: {
        id: id,

      },
	  data: {
		User_Name
	  }
    });
  }
}