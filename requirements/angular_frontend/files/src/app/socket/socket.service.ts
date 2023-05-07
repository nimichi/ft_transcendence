import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
// import { Observable } from 'rxjs/Observable';
// import * as Rx from 'rxjs/Rx';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
	private isOpen: boolean;

	constructor() {
		this.isOpen = false;
	}

	openSocket(code: string) : any {
		let socket : any;
		socket = io('localhost:3000', {
			transports: ['websocket'],
			withCredentials: true,
			extraHeaders: {
				'Access-Control-Allow-Origin': 'localhost:3000',
			},
			auth: { token: code }
		});

		socket.on('bla', (arg: any) => { this.recievedBla(arg) })
		socket.on('close', () => this.closedSocket())
		socket.on('connect', () => this.connectedSocket())
		return socket;
	}

	closedSocket(){
		this.isOpen = false;
		console.log("Socket closed");
	}

	connectedSocket(){
		this.isOpen = true;
		console.log("Socket connected");
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

	sendMessage(socket: any, message: string): void {
		console.log(this.isOpen);
		if (this.isOpen)
			socket.emit('chat', message);
	}

	requestEvent(socket: any, eventName: string, payload: any, callback: any): boolean{
		if (this.isOpen)
		{
			socket.emit(eventName, payload, callback);
			return true;
		}
		return false;
	}
}
