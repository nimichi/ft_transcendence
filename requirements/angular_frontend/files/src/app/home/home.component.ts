import { Component } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(public chat: ChatService){
    
  }
  
	openChat($event: Event){
		this.chat.toggleChat()
	}

}
