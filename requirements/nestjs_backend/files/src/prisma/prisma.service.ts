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

	/* ------------------------------ METHODS: USER ----------------------------- */
	async findOrCreateUser(data: User) {
		const existing_entry = await this.user.findFirst({
			where: { intra_name: data.intra_name, },
		});

		if (existing_entry) {
			console.log("User already exist - logging in...");
			return ({ type: 'existing', value: existing_entry });
		}

		const new_entry = await this.user.create({ data });
		console.log("User did not exist - creating and signing up User...");
		return ({ type: 'new', value: new_entry });
	}

	async addFriend(user_intra: string, friend_intra: string) {
		const user = await this.prisma.user.findUnique({ where: { intra_name: user_intra }, include: { friends: true } });
		const friend = this.findUserByIntra(friend_intra);

		if (!user || !friend) {
			console.log("Error adding friend: User or Friend doesn't exist.");
			return (false);
		}
		const is_friend_already_added = user.friends.some(friend => friend.intra_name === friend_intra);
		if (is_friend_already_added) {
			console.log("Error adding friend: Friend already exist.");
			return (false);
		}
		const updatedUser = await this.prisma.user.update({
      where: { intra_name: user_intra },
      data: {
        friends: {
          connect: { intra_name: friend_intra },
        },
      },
      include: { friends: true },
    });
		console.log(`${user_intra} succesfully added ${friend_intra} as friend.`);
		return (true);
	}
	
	/* ----------------------- FETCH/GETTER METHODS: USER ----------------------- */
	async getAllUsers() {
		return await (this.user.findMany());
	}
	
	async findUserByIntra(intra_name: string): Promise<User | null> {
		const user = await this.user.findUnique({
			where: { intra_name }
		});
		return (user || null);
	}

	async findUserByIntraWithFriends(intra_name: string): Promise<User | null> {
		const user = await this.user.findUnique({
			where: { intra_name },
			include: { friends: true }
		});
		return (user || null);
	}

	async findUserByIntraWithMatchHistory(intra_name: string): Promise<User | null> {
		const user = await this.user.findUnique({
			where: { intra_name },
			include: { match_history: true }
		});
		return (user || null);
	}

	async findUserByIntraWithAll(intra_name: string): Promise<User | null> {
		const user = await this.user.findUnique({
			where: { intra_name },
			include: {
				match_history: true,
				friends: true }
		});
		return (user || null);
	}

	async getPicture(intra_name: string): Promise<string> {
		const user = await this.findUserByIntra(intra_name);
		return (user.picture);
	}

	async getTfa(intra_name: string): Promise<boolean> {
		const user = await this.findUserByIntra(intra_name);
		return (user.tfa);
	}

	async getTfaSecret(intra_name: string): Promise<string> {
		const user = await this.findUserByIntra(intra_name);
		return (user.tfa_secret);
	}

	async getWinCount(intra_name: string): Promise<number> {
		const user = await this.findUserByIntra(intra_name);
		return (user.win);
	}

	async getLossCount(intra_name: string): Promise<number> {
		const user = await this.findUserByIntra(intra_name);
		return (user.loss);
	}

	async getMatchHistory(intra_name: string): {
		const user = await this.findUserByIntraWithMatchHistory(intra_name);
		return (user.match_history);
	}
	async getMatchHistoryCount(intra_name: string): {
		const user = await this.findUserByIntraWithMatchHistory(intra_name);
		return (user.match_history.length);
	}

	async getFriends(intra_name: string): {
		const user = await this.findUserByIntraWithFriends(intra_name);
		return (user.friends);
	}
	async getFriendsCount(intra_name: string): {
		const user = await this.findUserByIntraWithFriends(intra_name);
		return (user.friends.length);
	}

	/* ----------------------- UPDATE/SETTER METHODS: USER ---------------------- */
	// async updateIntraName(intra_name: string, new_intra_name: string) { // NOTE: first check if new_intra_name doesn't exist yet!!
	// 	if (this.findUserByIntra(intra_name) === null) {
	// 		console.log("User not found.");
	// 		return ;
	// 	}
	// 	const updatedUser = await this.user.update({
	// 		where: { intra_name: intra_name},
	// 		data: {
	// 			intra_name: new_intra_name
	// 		},
	// 	});
	// 	console.log("User full name updated to: " + new_intra_name);
	// }

	async updateFullName(intra_name: string, full_name: string) {
		if (this.findUserByIntra(intra_name) === null) {
			console.log("User not found.");
			return ;
		}
		const updatedUser = await this.user.update({
			where: { intra_name: intra_name},
			data: {
				full_name: full_name
			},
		});
		console.log("User full name updated to: " + full_name);
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
	
	async incrementWin(intra_name: string) {
		if (this.findUserByIntra(intra_name) === null) {
			console.log("User not found.");
			return ;
		}
		const updatedUser = await this.user.update({
			where: { intra_name: intra_name},
			data: {
				win: { increment: 1}
			},
		});
		console.log(`Win incremented for ${intra_name}!`);
	}

	async incrementLoss(intra_name: string) {
		if (this.findUserByIntra(intra_name) === null) {
			console.log("User not found.");
			return ;
		}
		const updatedUser = await this.user.update({
			where: { intra_name: intra_name},
			data: {
				loss: { increment: 1}
			},
		});
		console.log(`Win incremented for ${intra_name}!`);
	}
}
