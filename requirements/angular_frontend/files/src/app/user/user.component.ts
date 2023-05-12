import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketModule } from '../socket/socket.module';
import { ChatComponent } from '../chat/chat.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	intraPic: string  = ""
	intraName: string  = ""
	realName: string = ""
	wins: number = 0
	losses: number = 0
	level: number = 0
	intraBadgeLevel: number = 5
	versus: string = "mnies"
	result:string = "WIN"
	laddderLevel: number = 100
	listData: any [ ] = []
	//die liste kommt vom backend

	userName: string = String();
	public tfaToken: string = ''
	public qrCode: string = ''

	constructor(private activatedRoute: ActivatedRoute, private socket: SocketModule, private router: Router,
		public nameModal: ModalService, public picModal: ModalService, public tfaModal: ModalService) {
	}

	ngOnInit() {
		if (!this.socket.socketState()){
			this.router.navigate(['']);
		}


		this.nameModal.register('chooseName')
		this.picModal.register('choosePicture')
		this.tfaModal.register('registerTFA')


		//hier funcion die das modal aktiviert, wenn man auf den button klickt :)
		//function muss dann im template eingebaut werden

		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			if (!params.code){
				console.log('loaded without code');
				this.socket.requestEvent("userdata", null, (data: any) => this.callbackUserData(data));
			}
			else{
				this.socket.openSocket(params.code);
			}
		});

		this.socket.requestEvent("userdata", null, (data: string) => this.callbackUserData(data));
	}

	callbackUserData(userdata: any){
		this.intraPic = userdata.picture;
		this.intraName = userdata.intra_name;
		this.realName = userdata.displayname;
		this.wins = userdata.win;
		this.losses = userdata.loss;
		this.level = userdata.win - userdata.loss;
		this.intraBadgeLevel = this.level / 5;
		this.listData = [{versus: "romy", result: "win", level: 3},{versus: "michi", result: "loss", level: 4}];

		console.log("This is: " + this.intraName);
	}

	ngOnDestroy(): void {
		this.nameModal.unregister('chooseName')
		this.picModal.unregister('choosePicture')
		this.tfaModal.unregister('registerTFA')

	}

	enableTFA(){
		let qrCode: string;
		this.socket.requestEvent("initTFA", null, (res: string) => this.setQrCode(res));

		//backend call
		//store qr code in varible

		this.tfaModal.toggleModal('registerTFA')
	}

	setQrCode(qrCode: string){
		this.qrCode = qrCode;
	}

	verifyTFA() {
		this.socket.requestEvent("verifyTFA", this.tfaToken, (res: boolean) => this.closeTFA(res));
	}

	closeTFA(verified: boolean){
		if(verified){
			this.tfaModal.toggleModal('registerTFA')
		}
		else{
			this.tfaToken = "";
		}
	}

}
