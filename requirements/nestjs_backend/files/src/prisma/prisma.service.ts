import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient, User, Match } from '@prisma/client';
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
		return ({ type: 'existing', value: existing_entry });
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

  async updateFullName(intra_name: string, fullName: string) {
	if (this.findUserByIntra(intra_name) === null) {
		console.log("User not found.");
		return ;
	}
	const updatedUser = await this.user.update({
		where: { intra_name: intra_name},
		data: {
			full_name: fullName
		},
	});
	console.log("User full name updated to: " + fullName);
  }

  async getTfaSecret(intra_name: string): Promise<string> {
	const user = await this.findUserByIntra(intra_name);
	return (user.tfa_secret);
  }

  async getUserLevel(inrta: string){
	return 0;
  }

  async addMatchResult(data: any){
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