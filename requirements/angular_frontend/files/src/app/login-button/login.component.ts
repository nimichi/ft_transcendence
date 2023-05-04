import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  template: `
  <button (click)="makeRequest()">Make Request</button>
`
})



export class LoginComponent {
  constructor(private http: HttpClient, private socket: SocketService) {}

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


  ngOnInit(){

    if (this.socket.socketState())
		  window.location.href = "/user";
    console.log(this.socket.socketState());

  }

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
