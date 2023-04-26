import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {

	constructor(private activatedRoute: ActivatedRoute, private socket: SocketService) {

	}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(params => {
			console.log(params);
			if (!params.code){
				console.log('loaded without code');
				return;
			}
			if (this.socket.socketState() == false)
				this.socket.openSocket(params.code);
			console.log('loaded with code: ' + params.code);
		});

		this.socket.requestUserData();
	}

}
