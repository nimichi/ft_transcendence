import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, lastValueFrom } from 'rxjs'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `
    <button (click)="makeRequest()">Make Request</button>
  `
})

export class AppComponent {

  constructor(private http: HttpClient) {}

  makeRequest() {
    const headers = new HttpHeaders().set('Access-Control-Allow-Origin', 'localhost:3000');

	this.http.get('http://localhost:3000/auth/init', { headers: headers, responseType: 'text' }).subscribe(url => {
		console.log(url);
		window.location.href = url;
	});
  }
}