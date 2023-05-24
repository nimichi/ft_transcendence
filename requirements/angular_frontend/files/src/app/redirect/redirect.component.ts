import { Component } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SocketService } from '../socket/socket.service';


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
	public tfa: boolean =  false
	public callback: ((token: string) => void)|undefined
	private tfaSocket: Socket|undefined

    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute,
				private socket: SocketService, private router: Router){}


    ngOnInit(){

		//redirect to user if socket open
		if (this.socket.socketState()){
			this.router.navigate(['/user']);
		}

		this.activatedRoute.queryParams.subscribe(params => {
			// open socket if code param is provide
			if (params.code){
				this.socket.socketSubscribe('connect', () => this.connectedSocket());
				let tfaSocket = this.socket.openSocket(params.code, (err: any) => this.authFailed(err));
				tfaSocket.on('tfa', (callback: ((token: string) => void)) => this.requestTfa(callback));
			}
			// go to login page
			else{
				this.router.navigate(['']);
			}
		});
    }

	connectedSocket(){
		this.tfa = false;
		this.socket.isOpen = true;
		this.router.navigate(['/user']);
		console.log("Socket sconnected");
	}

	requestTfa(callback: ((token: string) => void)){
		console.log('Must provide Tfa Token');
		this.tfaToken = "";
		this.callback = callback;
		if(!this.tfa)
		{
			this.tfa = true;
		}
	}

	authFailed(err: any)
	{
		console.log('failed')
		this.showAlert = true
	}

	verifyTFA() {
		if (this.callback)
			this.callback(this.tfaToken)
	}

	ngOnDestroy(){
		this.socket.socketUnsubscribe('connect')
	}
}
