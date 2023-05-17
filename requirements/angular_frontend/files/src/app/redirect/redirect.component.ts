import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ModalComponent } from '../shared/modal/modal.component';
import { ActivatedRoute } from '@angular/router';
import { SocketModule } from '../socket/socket.module';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent {

	public verified: boolean = true
	public showAlert: boolean  = false
  	public alertMsg = 'Your authentication was not successful!'
  	public alertColor = 'red'
	public tfaToken: string = ""

    constructor(private http: HttpClient,
		public tokenModal: ModalService, public authFailModal: ModalService,
		private activatedRoute: ActivatedRoute, private socket: SocketModule, private router: Router){}


    ngOnInit(){

		this.tokenModal.register('loginTFA')
		this.authFailModal.register('authFailModal')

		//redirect to user if socket open
		// if (this.socket.socketState()){
		// 	this.router.navigate(['/user']);
		// }

		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			// open socket if code param is provide
			if (params.code){
				this.socket.socketSubscribe('connect_error', () => this.authFailed());
				this.socket.openSocket(params.code);
			}
			// go to login page
			// else{
			// 	this.router.navigate(['']);
			// }
		});

		// this.tokenModal.register('loginTFA')
		// this.tokenModal.toggleModal('loginTFA')
    }

	authFailed()
	{
		console.log('failed')
		this.showAlert = true
		this.authFailModal.toggleModal('authFailModal')
	}

	verifyTFA() {
		if (this.tfaToken == "111"){
			this.closeTFA(false);
			return;
		}

		const backendAdr: string = this.socket.getBackendAdr()
    	const header = new HttpHeaders({
    	  'Access-Control-Allow-Origin': backendAdr
    	});

		this.http.get('http://' + backendAdr + '/auth/init', { headers: header, responseType: 'text' }).subscribe(url => {
			console.log(url);
			window.location.href = url;
		});
	}

	closeTFA(verified: boolean){
		if(verified){
			this.verified = true
			this.tokenModal.toggleModal('loginTFA')
		}
		else{
			this.verified = false
			this.tfaToken = "";
		}
	}

    ngOnDestroy(): void {
      this.tokenModal.unregister('loginTFA')
      this.tokenModal.unregister('authFailModal')

    }
}
