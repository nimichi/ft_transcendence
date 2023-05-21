import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
	private socket: Socket|undefined
	private tfaSocket: Socket|undefined
	public isOpen: boolean;
	private callback: {eventName: string, function: any}[] = [];

	constructor(private router: Router) {
		console.log('SocketService loaded.');
		this.isOpen = false;
	}

	getBackendAdr() : string {
		return 'localhost:3000'
	}

	openSocket(code: string, failCallback: (err: any) => void) {
		const backendAdr: string = this.getBackendAdr();
		const subtoken: string = code.substring(0,20);

		console.log('open tfa socket')
		this.tfaSocket = io( backendAdr + '/tfa', {
			transports: ['websocket'],
			withCredentials: true,
			extraHeaders: {
				'Access-Control-Allow-Origin': backendAdr,
			},
			auth: { token: subtoken }
		})
		// this.tfaSocket.on('connect', () => this.continueOpenSocket(code, failCallback));
		this.tfaSocket.on('connect', () => this.continueOpenSocket(code, failCallback));
		this.tfaSocket.on('connect_error', (err: any) => failCallback(err));
		return this.tfaSocket
	}

	continueOpenSocket(code: string, failCallback: (err: any) => void){
		const backendAdr: string = this.getBackendAdr();

		this.socket = io( backendAdr, {
			transports: ['websocket'],
			withCredentials: true,
			extraHeaders: {
				'Access-Control-Allow-Origin': backendAdr,
			},
			auth: { token: code }
		});
		this.socket.on('disconnect', () => this.disconnectSocket());
		this.socket.on('connect_error', (err: any) => failCallback(err));
		this.callback.forEach((callback) => {
			if (this.socket)
				this.socket.on(callback.eventName, callback.function);
		});
	}

	disconnectSocket(){
		this.isOpen = false;
		console.log("Socket disconnect");
		this.router.navigate(['/']);
	}

	socketState(): boolean {
		return this.isOpen;
	}

	requestEvent(eventName: string, payload: any, callback: any): boolean{
		if (this.isOpen && this.socket)
		{
			this.socket.emit(eventName, payload, callback);
			return true;
		}
		return false;
	}

	emitEvent(eventName: string, payload: any){
		if (this.isOpen && this.socket)
		{
			this.socket.emit(eventName, payload);
			return true;
		}
		return false;
	}

	socketSubscribe(eventName: string, callback: any){
		if (this.socketState() && this.socket)
		{
			this.socket.on(eventName, callback);
		}
		else
		{
			this.callback.push({eventName: eventName, function: callback})
		}
	}
}
