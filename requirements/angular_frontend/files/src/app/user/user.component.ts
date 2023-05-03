import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	userName: string = String();

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

		this.socket.requestEvent("userdata", null, (data: string) => this.callbackUserData(data));
	}

	callbackUserData(userName: string){
		this.userName = userName;
		console.log("This is: " + this.userName);
	}
}
