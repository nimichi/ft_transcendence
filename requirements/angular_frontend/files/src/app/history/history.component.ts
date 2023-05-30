import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { SocketService } from '../socket/socket.service';

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
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {


	matches: Match[] = []
	public intraPic: string | ArrayBuffer | null  = "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg"

	constructor(private socketService: SocketService, private router: Router, public chat: ChatService){}

	ngOnInit() {
		if (!this.socketService.socketState()){
			this.router.navigate(['']);
			return;
		}
		this.socketService.requestEvent('gethistory', null, (data: Match[]) => this.receiveHistory(data))
		this.socketService.requestEvent('fetchUserpic', null, (data: any) => this.receivePicture(data))
	}

	receiveHistory(data: Match[]){
		if (data)
			this.matches = data
	}

	receivePicture(picture: any) {
		this.intraPic = picture;
	}

	openChat($event: Event){
		this.chat.toggleChat()
	}
}
