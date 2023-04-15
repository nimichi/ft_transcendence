import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get()
	async successAuth(@Query('code') code: string) {
		return this.authService.successAuth(code);
	}
}
