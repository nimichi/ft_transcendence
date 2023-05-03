import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	intraPic: string  = "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg"
	intraName: string  = "Rschleic"
	realName: string = "Romy Schleicher"
	wins: number = 0
	losses: number = 0
	level: number = 0
	intraBadgeLevel: number = 2
	versus: string = "mnies"
	result:string = "WIN"
	laddderLevel: number = 100
	listData: any [ ] = [{versus: "romy", result: "win", level: 3},{versus: "michi", result: "loss", level: 4}]
	//die liste kommt vom backend
	
	constructor(private activatedRoute: ActivatedRoute, private socket: SocketService) {
	}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			if (!params.code){
				console.log('loaded without code');
				return;
			}
			if (this.socket.socketState() == false)
				this.socket.openSocket(params.code);
			console.log('loaded with code: ' + params.code);
		});

		console.log(this.socket.requestUserData());
		//entpacken
		//speicher in vars
		
	}

}
