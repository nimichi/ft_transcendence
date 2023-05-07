import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketModule } from '../socket/socket.module';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

  // playing 1, offline 2, online 3
  listValues: {name: string, status: number, pic: string}[] = [];

	constructor(private socket: SocketModule, private router: Router){}

	ngOnInit() {
		if (!this.socket.socketState()){
			this.router.navigate(['']);
			return;
		}

		this.socket.requestEvent('friendlist', null, (data: {name: string, status: number, pic: string}[]) => this.getListCallback(data))
	}

	getListCallback(data: {name: string, status: number, pic: string}[]){
		this.listValues = data;
	}

}
