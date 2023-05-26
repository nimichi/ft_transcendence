import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { throwError, map, catchError, lastValueFrom } from 'rxjs'
import { Socket, Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { TfaService } from '../tfa/tfa.service';

@Injectable()
export class SocketService {

	constructor(private readonly httpService: HttpService,private tfaService: TfaService, private readonly prismaService: PrismaService) {}

	async doAuth(socket: Socket, server: Server) {
		try{
			let user_tmp: any
			if (socket.handshake.auth.token.length != 8 ){
				const access = await this.getAccessToken(socket.handshake.auth.token);

				const user_data = await this.requestUserData(access.access_token);

				user_tmp = {
					intra_name: user_data.login,
					full_name: user_data.displayname,
					picture: user_data.image.versions.medium,
					tfa: false,
					tfa_secret: null
				}
			}
			else{
				user_tmp = {
					intra_name: socket.handshake.auth.token,
					full_name: socket.handshake.auth.token + " fullname",
					picture: "https://cataas.com/cat",
					tfa: false,
					tfa_secret: null
				}
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
			const clients = server.sockets.adapter.rooms.get(user_tmp.intra_name);
			if (clients){
				clients.forEach((client) => {
					server.sockets.sockets.get(client).disconnect();
				});
			}

			if (user.value.tfa == true){
				const subtoken: string = socket.handshake.auth.token.substring(0,20);
				const secret = await this.prismaService.getTfaSecret(user_tmp.intra_name);
				let response: string|undefined
				while (1){
					console.log('tfa loop')
					try {
						const responses = await server.of('/tfa').in(subtoken).timeout(60000).emitWithAck('tfa')
						if(responses.length == 0)
						{
							console.log('length')
							return 2;
						}
						[response] = responses
					} catch (e) {
						console.log('tfa error: ' + e.message);
						return (2) //tfa timeout
					}
					console.log('try tfa token: ' + response)
					if (this.tfaService.verifyTFA(secret, response))
					{
						break;
					}
				}
			}

			//join new connection to room
			socket.join(user_tmp.intra_name);
			socket.data.username = user_tmp.intra_name;
			return (0);
		}
		catch
		{
			console.log('Socket authentication failed')
			return 1;
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

