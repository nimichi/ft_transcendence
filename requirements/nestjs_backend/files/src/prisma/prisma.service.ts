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

  async findOrCreateUser(data: User) {
	const existing_entry = await this.user.findFirst({
		where: { intra_name: data.intra_name, },
	});

	if (existing_entry) {
		console.log("User already exist - logging in...");
		return (existing_entry);
	}

	const new_entry = await this.user.create({ data });
	console.log("User did not exist - creating and signing up User...");
	return (new_entry);
  }

  async findUserByIntra(intra_name: string): Promise<User | null> {
	const user = await this.user.findUnique({ where: { intra_name } });
	return (user || null);
  }
  
  async updateFullname(intra_name: string, full_name: string) {
	if (this.findUserByIntra(intra_name) === null) {
		console.log("User not found.");
		return ;
	}
	const updatedUser = await this.user.update({
		where: { intra_name: intra_name},
		data: {full_name},
	});
	console.log("User entry updated.");
  }

  async updateTFA(intra_name: string, tfa_secret: string) {
	if (this.findUserByIntra(intra_name) === null) {
		console.log("User not found.");
		return ;
	}
	const updatedUser = await this.user.update({
		where: { intra_name: intra_name},
		data: {
			tfa: true,
			tfa_secret: tfa_secret
		},
	});
	console.log("added TFA verification.");
  }
}


//   async updateUserName(id: number, User_Name: string): Promise<void> {
// 	if (this.findUserById === null) {
// 		console.log("User not found.");
// 		return ;
// 	}
// 	const updatedUser = await this.user.update({
// 		where: { id: id },
// 		data: { User_Name },
// 	});

// 	console.log("User entry updated.");
//   }