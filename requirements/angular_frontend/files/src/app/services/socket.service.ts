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

		this.socket.on('bla', (arg: any) => { this.recievedBla(arg) })
		this.socket.on('close', () => this.closeSocket())
	}

	closeSocket(){
		this.isOpen = false;
		console.log("Socket closed");
	}

	recievedBla(arg: any){
		console.log(arg);
	}

	recievedUserdata(name: string){
		console.log("The User Login is: " + name);
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

	requestEvent(eventName: string, payload: any, callback: any): boolean{
		if (this.isOpen)
		{
			this.socket.emit(eventName, payload, callback);
			return true;
		}
		return false;
	}
}
