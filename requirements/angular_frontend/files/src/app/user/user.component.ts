import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {


	@ViewChild('finderInput') finderInput!: ElementRef
	public intraPic: string | ArrayBuffer | null  = ""
	public intraName: string  = ""
	public fullName: string = ""
	public newName: string = ""
	public wins: number = 0
	public losses: number = 0
	public level: number = 0
	public badges: number = 5
	public badgelevel: number = 100;
	public tfaToken: string = ''
	public qrCode: string = ''
	public verified: boolean = true
	// image = <HTMLInputElement>document.querySelector('finderInput')
	// finderInput = <HTMLInputElement>document.querySelector('finderInput')


	constructor(private activatedRoute: ActivatedRoute, private socket: SocketService, private router: Router,
		public nameModal: ModalService, public picModal: ModalService, public tfaModal: ModalService,
		public chat: ChatService,
		private cd: ChangeDetectorRef) {
	}

	ngOnInit() {
		if (!this.socket.socketState()){
			this.router.navigate([''])
		}

		this.nameModal.register('chooseName')
		this.picModal.register('choosePicture')
		this.tfaModal.register('registerTFA')

		//hier funcion die das modal aktiviert, wenn man auf den button klickt :)
		//function muss dann im template eingebaut werden

		this.socket.requestEvent("userdata", null, (data: string) => this.callbackUserData(data))
	}

	callbackUserData(userdata: any){
		this.intraPic = userdata.picture
		this.intraName = userdata.intra_name
		this.fullName = userdata.full_name
		this.wins = userdata.win
		this.losses = userdata.loss
		this.level = userdata.win - userdata.loss
		this.badges = this.level / 5

		console.log("This is: " + this.intraName)
	}

	ngOnDestroy(): void {
		this.nameModal.unregister('chooseName')
		this.picModal.unregister('choosePicture')
		this.tfaModal.unregister('registerTFA')

	}

	enableTFA(){
		let qrCode: string;
		this.socket.requestEvent("initTFA", null, (res: string) => this.setQrCode(res))

		//backend call
		//store qr code in varible

		this.tfaModal.toggleModal('registerTFA')
	}

	setQrCode(qrCode: string){
		this.qrCode = qrCode
	}

	verifyTFA() {
		this.socket.requestEvent("verifyTFA", this.tfaToken, (res: boolean) => this.closeTFA(res))
	}

	closeTFA(verified: boolean){
		if(verified){
			this.verified = true
			this.tfaModal.toggleModal('registerTFA')
		}
		else{
			this.verified = false
			this.tfaToken = ""
		}
	}

	openChat($event: Event){
		this.chat.toggleChat()
		console.log('open chat')

	}

	initChangeName($event: Event){
		this.newName = this.fullName;
		this.nameModal.toggleModal('chooseName')
	}

	submitName(){
		this.fullName = this.newName;
		this.socket.requestEvent('updatefullname', this.fullName, (name: string) => this.changeName(name));
	}

	changeName(name: string){
		this.nameModal.toggleModal('chooseName')
	}

	changePic($event: Event){
		this.picModal.toggleModal('choosePicture')

	}

	uploadPicture(e: Event){
		console.log(this.intraPic)
		const file = (event?.target as  HTMLInputElement).files?.[0]

		if (file){
			const reader = new FileReader()
			reader.onload = e => this.intraPic = reader.result
			reader.readAsDataURL(file)
			this.picModal.toggleModal('choosePicture')
			// this.intraPic = URL.createObjectURL(file)
			// console.log(this.intraPic)
			// this.cd.detectChanges()

		}
	}

	openFinder(){
		// this.image.click()
		if (this.finderInput) {
		  this.finderInput.nativeElement.click();

		}

	}

}
