import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
// import { Observable } from 'rxjs/Observable';
// import * as Rx from 'rxjs/Rx';


// @Injectable({
//   providedIn: 'root'
// })
export class SocketService {
	private socket: any;
	private isOpen: boolean;

	constructor() {
		this.isOpen = false;
	}

	openSocket(code: string) {
		this.socket = io('localhost:3000', {
			transports: ['websocket'],
			withCredentials: true,
			extraHeaders: {
				'Access-Control-Allow-Origin': 'localhost:3000',
			},
			auth: { token: code }
		  });
		this.isOpen = true;
	}

	socketState(): boolean {
		//auf die Login Seite redirecten
		return this.isOpen;
	}

	sendMessage(message: string): void {
		console.log(this.isOpen);
		if (this.isOpen)
			this.socket.emit('chat', message);
	}

	requestUserData(){
		if (this.isOpen)
		{
			console.log('1st');
			this.socket.emit('userdata', null);
		}
		else
			console.log('bla');
	}
}
