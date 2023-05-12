import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from './socket.service';


@NgModule({
  imports: [CommonModule],
  providers: [SocketService]
})
export class SocketModule {
	private socket: any;

	private callback: {eventName: string, function: any}[] = [];


	constructor(private socketService: SocketService){

	}

	openSocket(code: string) {
		this.socket = this.socketService.openSocket(code);
		this.callback.forEach((callback) => {
			this.socket.on(callback.eventName, callback.function);
		});
	}

	socketSubscribe(eventName: string, callback: any){
		if (this.socketState())
		{
			this.socket.on(eventName, callback);
			console.log('subscribe immediately')
		}
		else
		{
			this.callback.push({eventName: eventName, function: callback})
		}
	}

	socketState(): boolean {
		return this.socketService.socketState();
	}

	requestEvent(eventName: string, payload: any, callback: any): boolean{
		return this.socketService.requestEvent(this.socket, eventName, payload, callback);
	}

	getBackendAdr() : string {
		return this.socketService.getBackendAdr();
	}
}
