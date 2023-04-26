import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';



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

		this.socket.on('bla', (arg: string) => { this.recievedBla(arg) })
	}

	recievedBla(arg: string){
		console.log(arg);
	}

	socketState(): boolean {
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
			const res = this.socket.emit('userdata', null);
		}
		else
			console.log('bla');
	}
}
