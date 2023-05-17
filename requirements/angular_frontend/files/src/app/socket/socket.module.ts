import { NgModule } from '@angular/core';
import { SocketService } from './socket.service';


@NgModule({
  providers: [SocketService]
})
export class SocketModule {
	constructor(private socketService: SocketService){
		console.log('SocketModule loaded.');
	}
}
