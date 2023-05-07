import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from './socket.service';
import { PrismaService } from 'src/prisma/prisma.service';
// import { SocketService } from './socket.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@WebSocketServer()
	public server: Server;

	constructor(private socketService: SocketService, private prismaService: PrismaService){}

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

	@SubscribeMessage('friendlist')
	handleMessage(client: any, payload: any): {name: string, status: number, pic: string}[] {
		const [name] = client.rooms;

		const listValues: {name: string, status: number, pic: string}[] = [
			{name: 'mnies', status: 2, pic: 'https://cdn.intra.42.fr/users/f39c95b440a7892a13fd0815fdc4ed78/mnies.jpg'},
			{name: 'dmontema', status: 3, pic: 'https://cdn.intra.42.fr/users/90e5daf132867874fda0b6d5c6227f08/dmontema.jpg'},
			{name: 'lrosch', status: 1, pic: 'https://cdn.intra.42.fr/users/cd93c8ee7920347eedfeafb9f8b7b294/lrosch.jpg'},
			{name: 'mjeyavat', status: 1, pic: 'https://cdn.intra.42.fr/users/70fdc8bacb35cb5b1f666383b0eee5ff/mjeyavat.JPG'}
		];

		return listValues;
	}

	@SubscribeMessage('userdata')
	async handleUserDataMessage(client: any, payload: any) {
		// const userdata = {picture: "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg",
		// 					name: "Romy Schleicher", login: "rschleic", win: 21, los: 15, level: 6, badge: 2,
		// 					list: [{versus: "romy", result: "win", level: 3},{versus: "michi", result: "loss", level: 4}]};

		const [name] = client.rooms;
		let user_data = await this.prismaService.findUserByIntra(name);

		return user_data;
	}
}
