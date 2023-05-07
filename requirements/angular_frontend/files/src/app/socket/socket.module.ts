import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from './socket.service';



@NgModule({
  imports: [CommonModule],
  providers: [SocketService]
})
export class SocketModule {
	private socket: any;


	constructor(private socketService: SocketService){

	}

	openSocket(code: string) {
		this.socket = this.socketService.openSocket(code);
	}


	socketState(): boolean {
		return this.socketService.socketState();
	}

	requestEvent(eventName: string, payload: any, callback: any): boolean{
		return this.socketService.requestEvent(this.socket, eventName, payload, callback);
	}
}
