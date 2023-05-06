import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from './socket.service';
// import { SocketService } from './socket.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@WebSocketServer()
	public server: Server;

	constructor(private socketService: SocketService){}

	afterInit(server: Server) {
		this.server.use(async (socket, next) => {
			const authorized = await this.socketService.doAuth(socket);
			if (authorized) {
				console.log('authorized');
				next();
			} else {
				next(new Error('Not authorized'));
			}
		});
	}

	handleConnection(client: Socket, ...args: any[]) {
		let login;
		[login] = client.rooms;
		console.log(`Client connected! id: ${client.id} login: ${login}`);
	}

	handleDisconnect(client: Socket) {
		let login;
		[login] = client.rooms;
		console.log(`Client disconnected! id: ${client.id} login: ${login}`);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}

	@SubscribeMessage('userdata')
	handleUserDataMessage(client: any, payload: any) {

		const [name] = client.rooms;

		return name;
	}
}
