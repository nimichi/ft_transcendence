import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketModule } from '../socket/socket.module';
import { ChatComponent } from '../chat/chat.component';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	intraPic: string  = ""
	intraName: string  = ""
	realName: string = ""
	wins: number = 0
	losses: number = 0
	level: number = 0
	intraBadgeLevel: number = 0;
	listData: any

	constructor(private activatedRoute: ActivatedRoute, private socket: SocketModule) {
	}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			if (!params.code){
				console.log('loaded without code');
				this.socket.requestEvent("userdata", null, (data: any) => this.callbackUserData(data));
			}
			else{
				this.socket.openSocket(params.code);
			}
		});
	}

	callbackUserData(userdata: any){
		this.intraPic = userdata.picture;
		this.intraName = userdata.login;
		this.realName = userdata.name;
		this.wins = userdata.win;
		this.losses = userdata.los;
		this.level = userdata.level;
		this.intraBadgeLevel = userdata.badge;
		this.listData = userdata.list;

		console.log("This is: " + this.intraName);
	}
}
