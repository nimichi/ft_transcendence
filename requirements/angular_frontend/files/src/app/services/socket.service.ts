import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';



// @Injectable({
//   providedIn: 'root'
// })
export class SocketService {
	private socket: any;

	constructor(private code: string) {
		this.socket = io('localhost:3000', {
			transports: ['websocket'],
			withCredentials: true,
			extraHeaders: {
				'Access-Control-Allow-Origin': 'localhost:3000',
				'Authorization': 'abc'
			  },
		  });
	}

	sendMessage(message: string): void {
	  this.socket.emit('chat', message);
	}
}
