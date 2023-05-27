import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { SocketService } from '../socket/socket.service';

type User = {
	pic:		string | ArrayBuffer | null;
	intra:		string;
	fullName:	string;
	wins:		number;
	losses:		number;
	level:		number;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	public user: User

	@ViewChild('finderInput') finderInput!: ElementRef
	public newName: string = ""

	public tfaToken: string = ''
	public qrCode: string = ''
	public verified: boolean = true

	constructor(private activatedRoute: ActivatedRoute, private socket: SocketService, private router: Router,
		public nameModal: ModalService, public picModal: ModalService, public tfaModal: ModalService,
		public chat: ChatService, private cd: ChangeDetectorRef) {
		this.user = {
			pic: null,
			intra: "",
			fullName: "",
			wins: 0,
			losses: 0,
			level: 0
		}
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

		this.socket.requestEvent("userdata", null, (data: User) => this.callbackUserData(data))
	}

	callbackUserData(userdata: User){
		this.user = userdata
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
		this.newName = this.user.fullName;
		this.nameModal.toggleModal('chooseName')
	}

	submitName(){
		this.user.fullName = this.newName;
		this.socket.requestEvent('updatefullname', this.user.fullName, (name: string) => this.changeName(name));
	}

	changeName(name: string){
		this.nameModal.toggleModal('chooseName')
	}

	changePic($event: Event){
		this.picModal.toggleModal('choosePicture')

	}

	uploadPicture(e: Event) {
		const file = (event?.target as  HTMLInputElement).files?.[0]

		if (file) {
			const reader = new FileReader()
			reader.onload = e => this.user.pic = reader.result
			reader.readAsDataURL(file)
			this.picModal.toggleModal('choosePicture')
			console.log(file);
			const obj = {
				'file': file,
				'ext': file.type,
			};
			this.socket.requestEvent('userpic', obj, () => {});

			// this.intraPic = URL.createObjectURL(file)
			// console.log(this.intraPic)
			// this.cd.detectChanges()
		}
	}

	openFinder() {
		if (this.finderInput) {
			this.finderInput.nativeElement.click();
		}
	}

}
