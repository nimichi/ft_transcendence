import { Component } from '@angular/core';
import { ChatService } from '../chat/chat.service';
import { SocketService } from '../socket/socket.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

type User = {
	pic:		string | ArrayBuffer | null;
	intra:		string;
	fullName:	string;
	wins:		number;
	losses:		number;
	level:		number;
}

type Match = {
    match_id: number;
    left_intra: string;
    right_intra: string;
    left_score: number;
    right_score: number;
    powerup: boolean;
    left_level: number;
    right_level: number;
}

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
})
export class DisplayComponent {

	public user: User;

	matches: Match[] = [];

	constructor(public chat: ChatService, private socketService: SocketService, private activatedRoute: ActivatedRoute, private router: Router){
		this.user = {
			pic: null,
			intra: "",
			fullName: "",
			wins: 0,
			losses: 0,
			level: 0
		}
	}

	ngOnInit(){
		if (!this.socketService.socketState()){
			this.router.navigate(['']);
			return;
		}

		this.activatedRoute.params.subscribe(params => {
			if (params.intra){
				const intra = params.intra;
				this.socketService.requestEvent('gethistory', intra, (data: Match[]) => this.recieveHistory(data));
				this.socketService.requestEvent('userdata', intra, (data: User) => this.callbackUserData(data));
			}
		});


	}

	recieveHistory(data: Match[]){
		if (data)
			this.matches = data
	}

	callbackUserData(userdata: User){
		this.user = userdata
	}

	openChat($event: Event){
		this.chat.toggleChat()
	}


}
