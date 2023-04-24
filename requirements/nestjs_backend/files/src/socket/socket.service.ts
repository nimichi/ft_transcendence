import { ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError, lastValueFrom } from 'rxjs'
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocketService {


	constructor(private readonly httpService: HttpService, private readonly prismaService: PrismaService) {}

	async doAuth(socket: Socket) {

		console.log('request token');
		const access = await this.getAccessToken(socket.handshake.auth.token);
		console.log('recieved access token');
		console.log(access);

		const user_data = await this.requestUserData(access.access_token);
		console.log(user_data.login + ' authorized');

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

		socket.join(user_data.login);
		return (true);
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

		return (await lastValueFrom(response));
	}
}

