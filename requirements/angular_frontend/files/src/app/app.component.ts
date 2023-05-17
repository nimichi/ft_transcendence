import { Component } from '@angular/core';
import { SocketService } from './socket/socket.service';
// import { HttpClient } from '@angular/common/http';
// import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})

export class AppComponent {
  constructor(public socketService: SocketService){
  }
}