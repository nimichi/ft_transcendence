import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  searchControl = new FormControl ('')
  
  sendMessage(){
    console.log('send message works')
  }


  enterMessage(){
    console.log('enter key works')
  }
  
}


  
