import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { ChatComponent } from '../chat/chat.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	intraPic: string  = "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg"
	intraName: string  = "Rschleic"
	realName: string = "Romy Schleicher"
	wins: number = 0
	losses: number = 0
	level: number = 0
	intraBadgeLevel: number = 5
	versus: string = "mnies"
	result:string = "WIN"
	laddderLevel: number = 100
	listData: any [ ] = [{versus: "romy", result: "win", level: 3},{versus: "michi", result: "loss", level: 4}]
	//die liste kommt vom backend

	userName: string = String();

	constructor(private activatedRoute: ActivatedRoute, private socket: SocketService, 
		public nameModal: ModalService, public picModal: ModalService) {
	}

	ngOnInit() {
		this.nameModal.register('chooseName')
		this.picModal.register('choosePicture')

		//hier funcion die das modal aktiviert, wenn man auf den button klickt :)
		//function muss dann im template eingebaut werden
		
		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			if (!params.code){
				console.log('loaded without code');
				return;
			}
			if (this.socket.socketState() == false)
				this.socket.openSocket(params.code);
			console.log('loaded with code: ' + params.code);
		});

		this.socket.requestEvent("userdata", null, (data: string) => this.callbackUserData(data));
	}



	callbackUserData(userName: string){
		this.userName = userName;
		console.log("This is: " + this.userName);
	}

	ngOnDestroy(): void {
		this.nameModal.unregister('chooseName')
		this.picModal.unregister('choosePicture')

	  }

	enableTFA(){
		
	}
}
