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
		this.server.of('/tfa').use((socket, next) => {
			socket.join(socket.handshake.auth.token);
			next();
		});
		this.server.use(async (socket, next) => {
			const authorized = await this.socketService.doAuth(socket, this.server);
			if (authorized == 0) {
				next();
			}
			else if(authorized == 2){
				next(new Error('Tfa Timeout'));
			}
			else{
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
		console.log(`Client disconnected! id: ${client.id}`);
	}

	@SubscribeMessage('friendlist')
	async handleMessage(client: any, payload: any): Promise<{name: string, intra: string, status: number, pic: string}[]> {
		const [name] = client.rooms;
		let listValues: {name: string, intra: string, status: number, pic: string}[] = []

		const users = await this.prismaService.getAllUsers()

		users.forEach(user => {
			// TODO implement status check
			listValues.push({name: user.full_name, intra: user.intra_name, status: 3, pic: user.picture})
		})

		return listValues;
	}

	@SubscribeMessage('userdata')
	async handleUserDataMessage(client: any, payload: any) {

		const [name] = client.rooms;
		let user_data = await this.prismaService.findUserByIntra(name);

		return user_data;
	}
}
