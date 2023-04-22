import { ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

// import * as jwt from 'jsonwebtoken'; // TODO: verify access token?!?

@Injectable()
export class AuthService {
	constructor(private readonly httpService: HttpService) {}

	async initAuth(){

		const url = 'https://api.intra.42.fr/oauth/authorize?';
		var params = new URLSearchParams();
		params.append('client_id', process.env.API_UID);
		params.append('redirect_uri', process.env.API_REDIRECT);
		params.append('response_type', 'code');
		return url + params;
	}
}
