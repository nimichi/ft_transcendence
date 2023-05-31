import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient, User, Match } from '@prisma/client';

type MatchInput = {
    left_intra: string,
    right_intra: string,
    left_score: number,
    right_score: number,
    powerup: boolean,
    left_level: number,
    right_level: number,
}

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
      await app.close();
  }

  async blockUser(blockedIntra: string, blokingIntra: string){
	if (this.findUserByIntra(blokingIntra) === null) {
		console.log("User not found.");
		return ;
	}
	const blocked = await this.getBlockedUsers(blokingIntra);
	for (let user of blocked){
		if (user === blockedIntra)
			return;
	}
	await this.user.update({
		data: {
			blocked: {
				push: blockedIntra
			},
		},
		where: { intra_name: blokingIntra },
	})
  }

  async getBlockedUsers(intra: string): Promise<string[]>{
	const user = await this.user.findUnique({
		where: {
		  intra_name: intra,
		},
	  })
	return user.blocked;
  }

  async unblockUser(unblockIntra: string, unblockingIntra: string){
	const user = await this.user.findUnique({
		where: {
		  intra_name: unblockingIntra,
		},
	  })
	if (!user)
	  return;
	let newBlockedList: string[] = []
	for (const blocked in user.blocked){
		if (blocked !== unblockIntra)
			newBlockedList.push(blocked)
	}
	await this.user.update({
		where: { intra_name: unblockingIntra},
		data: {
			blocked: newBlockedList
		},
	});

  }

  async findOrCreateUser(data: User) {
	const existing_entry = await this.user.findFirst({
		where: { intra_name: data.intra_name, },
	});

	if (existing_entry) {
		console.log("User already exist - logging in...");
		return ({ type: 'existing', value: existing_entry });
	}

	let i: number = 1;
	const fullname = data.full_name
	while(await this.checkIfFullnameExists(data.full_name)){
		data.full_name = fullname + i.toString();
		i++;
	}

	const new_entry = await this.user.create({ data });

	console.log("User did not exist - creating and signing up User...");
	return ({ type: 'new', value: new_entry });
  }

  async getAllUsers(){
	return await this.user.findMany();
  }

  async findUserByIntra(intra_name: string): Promise<User | null> {
	const user = await this.user.findUnique({ where: { intra_name } });
	return (user || null);
  }

  async checkIfFullnameExists(full_name: string): Promise<boolean> {
	const user = await this.user.findUnique({ where: { full_name } });
	if (user)
		return true;
	else
		return false;
  }

  async addFriendToDb(user_intra: string, friend_intra: string) {
	const user = await this.findUserByIntraWithFriends(user_intra);
	const friend = await this.findUserByIntra(friend_intra);

	if (!user || !friend) {
		console.log("Error adding friend: User or Friend doesn't exist.");
		return (false);
	}

	const is_friend_already_added = user['friends'].some(friend => friend.intra_name === friend_intra);
	if (is_friend_already_added) {
		console.log("Error adding friend: Friend already exist.");
		return (false);
	}
	const updatedUser = await this.user.update({
		where: { intra_name: user_intra },
		data: {
			friends: {
				connect: { intra_name: friend_intra },
			},
		},
		include: { friends: true },
	});
	return (true);
  }

  async findUserByIntraWithFriends(intra_name: string): Promise<User | null> {
  	const user = await this.user.findUnique({
  		where: { intra_name },
  		include: { friends: true }
  	});
  	return (user || null);
  }

  async getFriends(intra: string){
	let friends: {name: string, intra: string, status: number, pic: string}[] = []
	const user: any = await this.findUserByIntraWithFriends(intra);
	if (user)
	{
		for(let friend of user.friends){
			friends.push({name: friend.full_name, intra: friend.intra_name, status: 0, pic: friend.picture})
		}
		return friends;
	}
	else
		return null;
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

  async removeTFA(intra_name: string) {
	if (this.findUserByIntra(intra_name) === null) {
		console.log("User not found.");
		return ;
	}
	const updatedUser = await this.user.update({
		where: { intra_name: intra_name},
		data: {
			tfa: false,
			tfa_secret: null
		},
	});
	console.log("removed TFA verification.");
  }

  async updateFullName(intra_name: string, fullName: string) {
	if (this.findUserByIntra(intra_name) === null) {
		console.log("User not found.");
		return false;
	}
	const updatedUser = await this.user.update({
		where: { intra_name: intra_name},
		data: {
			full_name: fullName
		},
	});
	console.log("User full name updated to: " + fullName);
}

	async updatePicture(intra_name: string, picture: string) {
		if (this.findUserByIntra(intra_name) === null) {
			console.log("User not found.");
			return ;
		}
		const updatedUser = await this.user.update({
			where: { intra_name: intra_name},
			data: {
				picture: picture
			},
		});
		console.log("Image path updated to: " + picture);
	}

  async getTfaSecret(intra_name: string): Promise<string> {
	const user = await this.findUserByIntra(intra_name);
	return (user.tfa_secret);
  }

  async getPicture(intra_name: string): Promise<string> {
	const user = await this.findUserByIntra(intra_name);
	return (user.picture);
  }

  async getUserLevel(intra: string){
	return (await this.getUserdata(intra)).level;
  }

  async addMatchResult(data: MatchInput){
	await this.match.create({ data });
	this.findMatchesByIntra("mnies");
  }

  async findMatchesByIntra(intra_name: string){
	const user = await this.user.findUnique({ include: { matches_left: true, matches_right: true }, where: { intra_name } });
	console.log(user)
  }

  async getFullNameByIntra(intra: string): Promise<string>{
	const user = await this.user.findUnique({ where: { intra_name: intra } });
	if (user)
		return user.full_name;
	else
		return intra;
  }

  async getHistory(intra: string){
	const user = await this.user.findUnique({ include: { matches_left: true, matches_right: true }, where: { intra_name: intra } });

	if (!user)
		return;

	let matches: Match[] = [];

	if (!user.matches_left.length)
		return user.matches_right;
	if (!user.matches_right.length)
		return user.matches_left;

	let i = 0;
	let	j = 0;

	while (matches.length < (user.matches_left.length + user.matches_right.length)) {
		if (!(user.matches_right.length > j) || (user.matches_left.length > i && user.matches_left[i].match_id < user.matches_right[j].match_id)) {
			matches.push(user.matches_left[i]);
			i++;
		} else {
			matches.push(user.matches_right[j]);
			j++;
		}
	}

	return (matches)
  }

  async getUserdata(intra: string){
	const user_data = await this.user.findUnique({ include: { matches_left: true, matches_right: true }, where: { intra_name: intra } });

	if (!user_data)
		return;

	let win: number = 0;
	let loss: number = 0;
	let lvl: number = 0;
	for(let match of user_data.matches_left){
		if (match.left_score > match.right_score){
			win++;
			lvl++;
		}
		else{
			loss++;
			lvl = lvl + 0.5;
		}
	}

	for(let match of user_data.matches_right){
		if (match.left_score < match.right_score){
			win++;
			lvl++;
		}
		else{
			loss++;
			lvl = lvl + 0.5;
		}
	}

	const user = {
		pic:		user_data.picture,
		intra:		user_data.intra_name,
		fullName:	user_data.full_name,
		wins:		win,
		losses:		loss,
		level:		lvl
	}
	return user;
  }
}
