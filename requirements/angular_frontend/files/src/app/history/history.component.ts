import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {


	listData: any [ ] = []

	constructor(public chat: ChatService){
    
  }

  openChat($event: Event){
		this.chat.toggleChat()
	}

}
