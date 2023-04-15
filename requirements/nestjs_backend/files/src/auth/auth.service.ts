import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {

	successAuth(code: string) {
		if (code === undefined)
			return '<h1 style="color: red">FAIL</h1>';
			
		const accessToken = code;
		return "<p>SUCCESFUL MY FRIEND!! :DD</p>" + accessToken;
	}
}
