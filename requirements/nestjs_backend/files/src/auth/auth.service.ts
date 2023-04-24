import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { Observable, map, catchError, lastValueFrom } from 'rxjs'
import { PrismaService } from 'src/prisma/prisma.service';
// import * as jwt from 'jsonwebtoken'; // TODO: verify access token?!?

@Injectable()
export class AuthService {
	protected api_access: any;
	// .access_token
	// .token_type
	// .expires_in
	// .refresh_token
	// .scope
	// .created_at

	constructor(private readonly jwtService: JwtService,
				private readonly httpService: HttpService,
				private readonly prismaService: PrismaService) {}

	async initAuth(){

		const url = 'https://api.intra.42.fr/oauth/authorize?';
		var params = new URLSearchParams();
		params.append('client_id', process.env.API_UID);
		params.append('redirect_uri', process.env.API_REDIRECT);
		params.append('response_type', 'code');
		return url + params;
	}

	async successAuth(code: string) {
		if (code === undefined)
			return '<h1 style="color: red">FAIL</h1>';

		this.api_access = await this.getAccessToken(code);
		// console.log(this.api_access.access_token);

		const user_data = await this.requestUserData(this.api_access.access_token);

		// console.log(`Keys: ${Object.keys(user_data)}`);

		const user_tmp = {
			id: user_data.id,
			First_Name: user_data.first_name,
			Last_Name: user_data.last_name,
			User_Name: user_data.login,
			Email: user_data.email,
			Avatar: user_data.image.versions.medium,
			User_Pw: "default",
			User_Status: "default",
		}
		const user = await this.prismaService.findOrCreateUser(user_tmp);
		// await this.prismaService.updateUserName(user.id, "dncmon");
		// console.log("USER:");
		// console.log(JSON.stringify(user, null, 2));
		return (user);
	}

	async getAccessToken(code: string): Promise<any> {
		const http_header = {
			'grant_type': 'authorization_code',
			'client_id': process.env.API_UID,
			'client_secret' : process.env.API_SECRET,
			'code' : code,
			'redirect_uri' : process.env.API_REDIRECT
		};
		const response = await this.httpService.post(process.env.API_ACCESS_TOKEN_URL, http_header)
		.pipe(
			map(res => res.data)
		)
		.pipe(
			catchError(() => {
				throw new ForbiddenException(`Error: Fetching access token failed.`);
			}),
		);
		// NOTE: with the try catch method accessing .data does not work, why?

		return (await lastValueFrom(response));
	}
	async requestUserData(accessToken: string) {
		const http_header = {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};
		const url = "https://api.intra.42.fr/v2/me";
		const response = await this.httpService.get(url, http_header)
		.pipe(
			map(res => res.data)
		);

		console.log("Keys:");
		console.log(Object.keys(user));

		const service = new PrismaService();

		const user_data = {
			id: user.id,
			Email: user.email,
			First_Name: user.first_name,
			Last_Name: user.last_name,
			User_Name: user.login,
			Avatar: user.image.versions.medium,
			User_Pw: "default",
			User_Status: "default",
		}

		service.createUser(user_data);
		// console.log("USER DATA:");
		// console.log(user_data);
		service.updateUser(user_data.id, "dncmon");
		service.findUserById(user_data.id);

		return (user_data);
	}

}
