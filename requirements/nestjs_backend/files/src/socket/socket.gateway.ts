import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from './socket.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@WebSocketServer()
	public server: Server;
	private userStates: Map<string, 0 | 1 | 2 > = new Map<string, 0 | 1 | 2>()

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

	@SubscribeMessage('state')
	async getState(client: any, intra: string): Promise<{intra: string, state: 0 | 1 | 2 }> {
		let user = this.userStates.get(intra)
		if(user)
			return {intra: intra, state: user};
		else
			return {intra: intra, state: 0};
	}

	getServer(): Server{
		return this.server
	}

	async setUserState(intra: string, newState: 0 | 1 | 2){
		this.userStates.set(intra, newState);
		this.server.emit(intra + 'state', {intra: intra, state: newState});
		//to(intra + 'state')
	}

	async handleConnection(client: Socket, ...args: any[]) {
		let login;
		[login] = client.rooms;
		this.setUserState(client.data.username, 1);
		console.log(`Client connected! id: ${client.id} login: ${login}`);
	}

	async handleDisconnect(client: Socket) {
		this.setUserState(client.data.username, 0);
		console.log(`Client disconnected! id: ${client.id} name: ${client.data.username}`);
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
}
