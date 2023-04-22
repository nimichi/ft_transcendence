import { ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError, lastValueFrom } from 'rxjs'
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {


	constructor(private readonly httpService: HttpService) {}

	async doAuth(socket: Socket) {

		const data = {
			'grant_type': 'authorization_code',
			'client_id': process.env.API_UID,
			'client_secret' : process.env.API_SECRET,
			'code' : socket.handshake.auth.token,
			'redirect_uri' : process.env.API_REDIRECT
		};

		const request = this.httpService.post('https://api.intra.42.fr/oauth/token', data)
			.pipe(
				map(response => response.data)
			)
			.pipe(
				catchError(() => {
					console.log('err');
					throw new ForbiddenException('Authorization failed.');
				}),
			);

		const res = await lastValueFrom(request);
		console.log('recieved access token');

		// console.log("Access token: " + res.access_token);
		// console.log("Token type: " + res.token_type);
		// console.log("Expires in: " + res.expires_in);
		// console.log("Refresh token: " + res.refresh_token);
		// console.log("Scope: " + res.scope);
		// console.log("Created at: " + res.created_at);

		const options = {
			headers: {
				Authorization: 'Bearer ' + res.access_token,
			},
		};
		const url = "https://api.intra.42.fr/v2/me";
		const response = await this.httpService.get(url, options)
		.pipe(
			map(response => response.data)
		);
		const user = await lastValueFrom(response);

		console.log(user.login + ' authorized');
		socket.join(user.login);
		return (true);

		// console.log("Keys:");
		// console.log(Object.keys(user));

		// const user_data = {
		// 	email: user.email,
		// 	firstname: user.first_name,
		// 	lastname: user.last_name,
		// 	username: user.login,
		// 	image: user.image.versions.medium,
		// }
		// console.log("USER DATA:");
		// console.log(user_data);

		// return (user_data.image);
	}
}

