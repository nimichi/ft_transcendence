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
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async findOrCreateUser(data: User) {
	const existing_entry = await this.user.findFirst({
		where: { id: data.id, },
	});

	if (existing_entry) {
		console.log("User already exist - logging in...");
		return (existing_entry);
	}

	const new_entry = await this.user.create({ data });
	console.log("User did not exist - creating and signing up User...");
	return (new_entry);
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