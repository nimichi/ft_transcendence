import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GameService } from './game.service';
import { Socket, Server } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
type Game = {left: string, right: string, scoreleft: number, scoreright: number, serveleft: boolean, powup: boolean};

@WebSocketGateway()
export class GameGateway {
  private queue: Socket|null = null;
  private powupqueue: Socket|null = null;
  private games: Map<string, Game> = new Map<string, Game>()
  private gamecounter: number = 0;
  constructor(private GameService: GameService, private prismaService: PrismaService, private socketGateway: SocketGateway) {
  }

  private async startGame(left: Socket, right: Socket, powup: boolean){
	this.gamecounter++;
	while (this.games.get('!game' + this.gamecounter.toString())){
		this.gamecounter++;
	}
	const gameid: string = '!game' + this.gamecounter.toString();
	left.join(gameid);
	right.join(gameid);
	this.socketGateway.setUserState(left.data.username, 1);
	this.socketGateway.setUserState(right.data.username, 1);
	this.games.set(gameid, {left: left.data.username, right: right.data.username, scoreleft: 0, scoreright: 0, serveleft: true, powup: powup})
	this.socketGateway.getServer().in(gameid).emit('countdown', {left: left.data.username, right: right.data.username, gameid: gameid });
	await new Promise(r => setTimeout(r, 3100));
	this.startBall(left, gameid);
	if (powup)
 		this.placePowerUps(gameid);
  }

  private async placePowerUps(gameid: string){
	while (this.games.get(gameid)){
		const timeout = 10000 + 10000 * Math.random() // delay zwischen 10 und 20 sek
		await new Promise(r => setTimeout(r, timeout));
		const x = Math.floor(Math.random() * (700 - 100 + 1)) + 100;
		const y = Math.floor(Math.random() * (380 - 20 + 1)) + 20;
		this.socketGateway.getServer().in(gameid).emit('spawnpowerup', {x: x, y: y});
	}
  }

  private async stopGame(gameid: string){
	const game = this.games.get(gameid)
	if (!game){
		return;
	}
	this.socketGateway.getServer().socketsLeave(gameid);
	this.socketGateway.setUserState(game.left, 1);
	this.socketGateway.setUserState(game.right, 1);
	this.games.delete(gameid)
  }

  @SubscribeMessage('barposition')
  private async tansmitBarPosition(client: any, payload: {y: number, gameid: string}){
	const [intra] = client.rooms;
	if (!this.games.get(payload.gameid)){
		client.emit('gameinteruption');
		client.leave(payload.gameid);
		return;
	}
	client.to(payload.gameid).emit('newbarposition', payload.y)
  }

  @SubscribeMessage('ballposition')
  private async tansmitBallPosition(client: any, payload: {pos: {x: number, y: number, xv: number, xy: number}, gameid: string}){
	const [intra] = client.rooms;
	if (!this.games.get(payload.gameid)){
		client.emit('gameinteruption');
		client.leave(payload.gameid);
		return;
	}
	client.to(payload.gameid).emit('newballposition', payload.pos)
  }

  @SubscribeMessage('initgame')
  private async initGame(client: any, powup: boolean): Promise<boolean>{
	if (powup && !this.powupqueue){
		this.powupqueue = client;
		return true;
	}
	else if (powup){
		this.startGame(this.powupqueue, client, true);
		this.powupqueue = null;
		return false;
	}
	else if (!powup && !this.queue){
		this.queue = client;
		return true;
	}
	else{
		this.startGame(this.queue, client, true);
		this.queue = null;
		return false;
	}
  }

  @SubscribeMessage('scorepoint')
  private async scorePoint(client: any, gameid: string): Promise<boolean>{
	let game = this.games.get(gameid);
	if (!this.games.get(gameid)){
		client.emit('gameinteruption');
		client.leave(gameid);
		return;
	}
	if (game.left == client.data.username)
	{
		game.serveleft = false;
		game.scoreright++;
	}
	else{
		game.serveleft = true;
		game.scoreleft++;
	}
	const score = {left: game.scoreleft, right: game.scoreright};
	this.socketGateway.getServer().in(gameid).emit('score', score)
	if (game.scoreleft >= 4 && game.scoreleft > game.scoreright + 1){
		this.finishGame(gameid, game.left)
		return;
	}
	if (game.scoreright >= 4 && game.scoreright > game.scoreleft + 1){
		this.finishGame(gameid, game.right)
		return;
	}
	this.startBall(client, gameid);
  }

  private async finishGame(gameid: string, intra: string){
	  const name = (await this.prismaService.findUserByIntra(intra)).full_name
	  this.socketGateway.getServer().in(gameid).emit('gameresult', name)
	  this.stopGame(gameid)
  }

  private async startBall(client: any, gameid: string){
	if (!this.games.get(gameid)){
		client.emit('gameinteruption');
		client.leave(gameid);
		return;
	}
	const randX = Math.floor(Math.random() * 150)
	const Y = Math.floor(Math.random() * 100) + 150
	const randRad = Math.random() * 1.5708
	let start
	if (this.games.get(gameid).serveleft)
		start = {x: 400 + randX, y: Y, xv: -Math.sin(randRad + 0.7853), yv: Math.cos(randRad + 0.7853)}
	else
		start = {x: 400 - randX, y: Y, xv: Math.sin(randRad + 0.7853), yv: Math.cos(randRad + 0.7853)}
	this.socketGateway.getServer().in(gameid).emit('newballposition', start)
  }

  @SubscribeMessage('leftgamepage')
  private async interuptGame(client: any, gameid: string){
	if (gameid != ""){
		client.in(gameid).emit('gameinteruption');
		this.stopGame(gameid);
	}
	else if(this.queue == client){
		this.queue = null;
	}
	else if(this.powupqueue == client){
		this.powupqueue = null;
	}
  }
}

