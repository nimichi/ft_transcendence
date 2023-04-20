import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `
    <button (click)="makeRequest()">Make Request</button>
  `
})

export class AppComponent {

	constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {}

	ngOnInit() {
		let code: string | null;
		code = this.activatedRoute.snapshot.paramMap.get('code');
		if (!code){
			console.log('without code: ' + code);
			return;
		}
		let socketService = new SocketService(code);
		console.log('with code: ' + code);
		socketService.sendMessage('Hello');
	}

	makeRequest() {
		const headers = new HttpHeaders().set('Access-Control-Allow-Origin', 'localhost:3000');

		this.http.get('http://localhost:3000/auth/init', { headers: headers, responseType: 'text' }).subscribe(url => {
			console.log(url);
			window.location.href = url;
		});
	}
}