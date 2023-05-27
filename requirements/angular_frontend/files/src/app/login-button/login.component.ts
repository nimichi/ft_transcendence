import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
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
  constructor(private http: HttpClient, private socket: SocketService) {
  }

  ngOnInit(){
    if (this.socket.socketState())
		  window.location.href = "/user";
    console.log(this.socket.socketState());
  }

  makeRequest(){
	const backendAdr: string = this.socket.getBackendAdr()

    const header = new HttpHeaders({
      // 'contentType': 'application/json',
      'Access-Control-Allow-Origin': backendAdr
    });

	this.http.get('http://' + backendAdr + '/auth/init', { headers: header, responseType: 'text' }).subscribe(url => {
		console.log(url);
		window.location.href = url;
	});


  }
}
