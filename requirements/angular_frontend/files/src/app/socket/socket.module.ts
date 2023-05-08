import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from './socket.service';



@NgModule({
  imports: [CommonModule],
  providers: [SocketService]
})
export class SocketModule {
	private socket: any;

	private callback: any = null;
	private eventName: any;


	constructor(private socketService: SocketService){

	}

	openSocket(code: string) {
		this.socket = this.socketService.openSocket(code);
		if (this.callback)
		{
			this.socket.on(this.eventName, this.callback);
			console.log('subscribed after init')
		}
	}

	socketSubscribe(eventName: string, callback: any){
		if (this.socketState())
		{
			this.socket.on(eventName, callback);
			console.log('subscribe immediately')
		}
		else
		{
			this.callback = callback;
			this.eventName = eventName;
		}
	}

	socketState(): boolean {
		return this.socketService.socketState();
	}

	requestEvent(eventName: string, payload: any, callback: any): boolean{
		return this.socketService.requestEvent(this.socket, eventName, payload, callback);
	}
}
