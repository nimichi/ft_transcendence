import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query('code') code): string {
	if (code === undefined)
		return 'fail';
	else
	{

	}
		return code;
    return this.appService.getHello();
  }
}
