import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SocketModule } from '../socket/socket.module';
import { TargetService } from '../services/target.service';
import { SocketService } from '../socket/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  template: `
  <button (click)="makeRequest()">Make Request</button>
`
})



export class LoginComponent {
  constructor(private http: HttpClient, private socket: SocketService, private target: TargetService) {
	console.log("Socket state is: " + this.socket.socketState());
	console.log(this.target.getTarget());
	if (this.target.getTarget() != "")
	{
		console.log(this.target.getTarget());
		if(!this.socket.socketState())
			this.makeRequest();
		else
			window.location.href = this.target.getTarget();
	}
  }

  ngOnInit(){

    if (this.socket.socketState())
		  window.location.href = "/user";
    console.log(this.socket.socketState());

  }

  jsongetvalue: any



  makeRequest() {
	const backendAdr: string = this.socket.getBackendAdr()

    const header = new HttpHeaders({
      // 'contentType': 'application/json',
      'Access-Control-Allow-Origin': backendAdr
    });

	this.http.get('http://' + backendAdr + '/auth/init', { headers: header, responseType: 'text' }).subscribe(url => {
		console.log(url);
		window.location.href = url;
	});


    };
    //query snippet abgreifen
    //neue get request an die api mit dem query strimg schicken


    //an jsongetvalue weiterleiten!:)
}
