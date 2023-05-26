import { Component } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ModalService } from '../services/modal.service';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
})

export class DisplayComponent {

  intraPic: string  = "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg"
	intraName: string  = ""
  fullName: string = "Romy Schleicher"
  intraBadgeLevel: number = 5
  wins: number = 0
	losses: number = 0
	level: number = 0
  listData: any [ ] = []

  constructor(public chat: ChatService){

  }

	openChat($event: Event){
		this.chat.toggleChat()
	}


}
