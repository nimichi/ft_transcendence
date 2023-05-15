import { Component } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ModalService } from '../services/modal.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
})

export class DisplayComponent {

  intraPic: string  = ""
	intraName: string  = ""
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
