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

	tooBig: boolean = false;
	isTfaEnabled = false;
	public user: User;

	@ViewChild('finderInput') finderInput!: ElementRef
	public newName: string = ""

	public tfaToken: string = ''
	public qrCode: string = ''
	public verified: boolean = true

	public showNameErrMsg: boolean = false
	public nameErrMsg: string = ""

	constructor(private activatedRoute: ActivatedRoute, private socket: SocketService, private router: Router,
		public modalService: ModalService, public chat: ChatService, private cd: ChangeDetectorRef) {
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

		this.modalService.register('chooseName');
		this.modalService.register('choosePicture');
		this.modalService.register('registerTFA');
		this.modalService.register('disableTFA');

		this.socket.requestEvent("userdata", null, (data: User) => this.callbackUserData(data));
		this.socket.requestEvent("getTfa", null, (res: boolean) => { this.isTfaEnabled = res; });
	}

	callbackUserData(userdata: User){
		this.user = userdata
	}

	ngOnDestroy(): void {
		this.modalService.unregister('chooseName');
		this.modalService.unregister('choosePicture');
		this.modalService.unregister('registerTFA');
		this.modalService.register('disableTFA');
	}

	enableTFA(){
		let qrCode: string;
		this.socket.requestEvent("initTFA", null, (res: string) => this.setQrCode(res))
		this.modalService.showModal('registerTFA');
	}

	disableTFA() {
		this.modalService.showModal('disableTFA');
	}

	setQrCode(qrCode: string){
		this.qrCode = qrCode
	}

	verifyTFA() {
		this.socket.requestEvent("verifyTFA", this.tfaToken, (res: boolean) => this.closeTFA(res))
	}

	removeTFA() {
		this.socket.requestEvent("removeTFA", null, (res: boolean) => {
			if (res)
				this.isTfaEnabled = false;
			this.closeDisableTfaModal();
		})
	}

	closeTFA(verified: boolean){
		if(verified){
			this.verified = true;
			this.modalService.hideModal('registerTFA');
			this.isTfaEnabled = true;
		}
		else{
			this.verified = false;
			this.tfaToken = "";
		}
	}

	closeDisableTfaModal() {
		this.modalService.hideModal('disableTFA');
	}

	openChat($event: Event){
		this.chat.toggleChat()
		console.log('open chat')

	}

	initChangeName($event: Event){
		this.newName = this.user.fullName;
		this.showNameErrMsg = false;
		this.modalService.showModal('chooseName')
	}

	submitName(){
		if (this.newName.length < 16){
			this.socket.requestEvent('updatefullname', this.newName, (response: {name: string, success: boolean}) => this.changeName(response));
			return;
		}
		else{
			console.log(this.newName.length)
			this.showNameErrMsg = true;
			this.nameErrMsg = 'name too long'
		}
	}

	changeName(response: {name: string, success: boolean}){
		if (response.success){
			this.showNameErrMsg = false;
			this.modalService.hideModal('chooseName')
			this.user.fullName = response.name;
		}
		else
			this.nameErrMsg = response.name;
			this.showNameErrMsg = true;
	}

	changePic($event: Event){
		this.tooBig = false
		this.modalService.showModal('choosePicture')
	}

	uploadPicture(e: Event) {
		const file = (event?.target as  HTMLInputElement).files?.[0]
		console.log("Size:", file?.size);
		if (file != undefined && file?.size > 1e6) {
			this.tooBig = true
			return;
		}
		if (file) {
			const reader = new FileReader()
			reader.onload = e => this.user.pic = reader.result
			reader.readAsDataURL(file)
			this.modalService.hideModal('choosePicture')
			console.log(file);
			const obj = {
				'file': file,
				'ext': file.type,
			};
			this.socket.emitEvent('uploadUserpic', obj);
		}
		this.tooBig = false
		return;
	}

	openFinder() {
		if (this.finderInput) {
			this.finderInput.nativeElement.click();
		}
	}

}
