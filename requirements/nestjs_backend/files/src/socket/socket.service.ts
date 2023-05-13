import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { throwError, map, catchError, lastValueFrom } from 'rxjs'
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocketService {


	constructor(private readonly httpService: HttpService, private readonly prismaService: PrismaService) {}

	async doAuth(socket: Socket, server: Server) {
		try{
			const access = await this.getAccessToken(socket.handshake.auth.token);

			const user_data = await this.requestUserData(access.access_token);

			const user_tmp = {
				intra_name: user_data.login,
				full_name: user_data.displayname,
				picture: user_data.image.versions.medium,
				tfa: false,
				tfa_secret: null,
				win: 0,
				loss: 0
			}

			let user = await this.prismaService.findOrCreateUser(user_tmp);
			// await this.prismaService.updateUserName(user.id, "dncmon");
			// console.log("USER:");
			if(user.type == 'new'){
				socket.emit('newfriend', {name: user.value.full_name, intra: user.value.intra_name, status: 3, pic: user.value.picture})
			}
			else{
				socket.emit('status', {name: user.value.intra_name , status: 3})
			}

			//disconnect old connection for this intra
			const clients = server.sockets.adapter.rooms.get(user_data.login);
			if (clients){
				clients.forEach((client) => {
					server.sockets.sockets.get(client).disconnect();
				});
			}

			//join new connection to room
			socket.join(user_data.login);
			socket.data.username = user_data.login;
			return (true);
		}
		catch
		{
			console.log('Socket authentication failed')
			return false;
		}
	}

	async getAccessToken(code: string): Promise<any> {
		let status: Boolean;

		status = true;
		const http_header = {
			'grant_type': 'authorization_code',
			'client_id': process.env.API_UID,
			'client_secret' : process.env.API_SECRET,
			'code' : code,
			'redirect_uri' : process.env.API_REDIRECT
		};
		const response = await this.httpService.post(process.env.API_ACCESS_TOKEN_URL, http_header)
		.pipe(
			map(res => res.data),
			catchError(() => { return throwError(() => new Error('access token request failed')) })
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
			map(res => res.data),
			catchError(() => { return throwError(() => new Error('user data request failed')) })
		);

		return (await lastValueFrom(response));
	}
}

