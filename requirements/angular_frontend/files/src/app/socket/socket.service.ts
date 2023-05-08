import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Router } from '@angular/router';
// import { Observable } from 'rxjs/Observable';
// import * as Rx from 'rxjs/Rx';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
	private isOpen: boolean;

	constructor(private router: Router) {
		this.isOpen = false;
	}

	getBackendAdr() : string {
		return 'localhost:3000'
	}

	openSocket(code: string) : any {
		let socket : any;
		const backendAdr: string = this.getBackendAdr();

		console.log('Backen is: ' + backendAdr + ':3000')

		socket = io( backendAdr, {
			transports: ['websocket'],
			withCredentials: true,
			extraHeaders: {
				'Access-Control-Allow-Origin': backendAdr,
			},
			auth: { token: code }
		});

		socket.on('bla', (arg: any) => { this.recievedBla(arg) })
		socket.on('disconnect', () => this.disconnectSocket())
		socket.on('connect', () => this.connectedSocket())
		return socket;
	}



	disconnectSocket(){
		this.isOpen = false;
		console.log("Socket disconnect");
		this.router.navigate(['/']);
	}

	connectedSocket(){
		this.isOpen = true;
		this.router.navigate(['/user']);
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
