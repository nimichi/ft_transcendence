import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { Observable, map, catchError, lastValueFrom } from 'rxjs'
// import * as jwt from 'jsonwebtoken'; // TODO: verify access token?!?

@Injectable()
export class AuthService {
	// protected api_access: Promise<any>;

	constructor(private readonly jwtService: JwtService, private readonly httpService: HttpService) {}

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

		const data = {
			'grant_type': 'authorization_code',
			'client_id': process.env.API_UID,
			'client_secret' : process.env.API_SECRET,
			'code' : code,
			'redirect_uri' : process.env.API_REDIRECT
		};

		const request = this.httpService.post('https://api.intra.42.fr/oauth/token', data)
			.pipe(
				map(response => response.data)
			)
			.pipe(
				catchError(() => {
					throw new ForbiddenException('Authorization failed.');
				}),
			);

		const res = await lastValueFrom(request);
		console.log("Promise:");
		console.log(res);

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

		console.log("Keys:");
		console.log(Object.keys(user));

		const user_data = {
			id: user.id,
			email: user.email,
			firstname: user.first_name,
			lastname: user.last_name,
			username: user.login,
			image: user.image.versions.medium,
		}
		console.log("USER DATA:");
		console.log(user_data);

		// const img_tag = '<img src="'+ user_data.image + '" alt="Profile Image">';

		return (user_data);
	}
}
