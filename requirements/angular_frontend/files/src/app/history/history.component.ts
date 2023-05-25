import { Component } from '@angular/core';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {


	listData: any [ ] = []
	public intraPic: string | ArrayBuffer | null  = "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg"


	constructor(public chat: ChatService){

  }


  
  openChat($event: Event){
		this.chat.toggleChat()
	}

}
