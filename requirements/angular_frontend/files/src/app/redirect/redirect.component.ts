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

	verified: boolean = true
	showAlert = false
	//muss noch an der richtigen Stelle aktiviert werden.
  	alertMsg = 'Your authentication was not successful!'
  	alertColor = 'red'

    constructor(private http: HttpClient, public tokenModal: ModalService, private activatedRoute: ActivatedRoute, private socket: SocketModule, private router: Router){}

	public tfaToken: string = ""

    ngOnInit(){

		//redirect to user if socket open
		if (this.socket.socketState()){
			this.router.navigate(['/user']);
		}

		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			// open socket if code param is provide
			if (params.code){
				this.socket.openSocket(params.code);
			}
			// go to login page
			else{
				this.router.navigate(['']);
			}
		});

		// this.tokenModal.register('loginTFA')
		// this.tokenModal.toggleModal('loginTFA')
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
    }
}
