import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private visible = false

  constructor() { }

  isChatVisible(){
    return this.visible
  }

  toggleChat(){
    this.visible = !this.visible
    console.log('toggle chat')
  }

  
}
