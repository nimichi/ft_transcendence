import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SocketModule } from '../socket/socket.module';
import { TargetService } from '../services/target.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  template: `
  <button (click)="makeRequest()">Make Request</button>
`
})

export class LoginComponent {
  constructor(private http: HttpClient, private socket: SocketModule, private target: TargetService) {
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

  // intra_auth(): void {
  //     console.log('omg dis is wooorking')
  // // intra_auth(){
  // //   //call http://10.11.4.19:3000/login
  // }
  // makeRequest() {
  // this.http.get('https://localhost:3000/login', { headers: headers }).subscribe(response => {
  //   console.log(response);
  // });
  // }

  jsongetvalue: any



  makeRequest() {
    const header = new HttpHeaders({
      // 'contentType': 'application/json',
      'Access-Control-Allow-Origin': 'localhost:3000'
    });

	this.http.get('http://localhost:3000/auth/init', { headers: header, responseType: 'text' }).subscribe(url => {
		console.log(url);
		window.location.href = url;
	});


    };
    //query snippet abgreifen
    //neue get request an die api mit dem query strimg schicken


    //an jsongetvalue weiterleiten!:)
}
