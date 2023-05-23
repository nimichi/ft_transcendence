import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GameService } from './game.service';
import { PrismaService } from 'src/prisma/prisma.service';
type Game = {left: string, right: string, scoreleft: number, scoreright: number, serveleft: boolean};

@WebSocketGateway()
export class GameGateway {

  private games: Map<string, Game> = new Map<string, Game>()
  constructor(private GameService: GameService, private prismaService: PrismaService) {}

  @SubscribeMessage('barposition')
  private async tansmitBarPosition(client: any, payload: {y: number, host: string}){
	const [intra] = client.rooms;
	if (!this.games.get(payload.host)){
		client.emit('gameinteruption');
		return;
	}
	if (this.games.get(payload.host).left == intra)
    	client.to(this.games.get(payload.host).right).emit('newbarposition', payload.y)
	else if (this.games.get(payload.host).right == intra)
    	client.to(this.games.get(payload.host).left).emit('newbarposition', payload.y)
  }

  @SubscribeMessage('ballposition')
  private async tansmitBallPosition(client: any, payload: {pos: {x: number, y: number, xv: number, xy: number}, host: string}){
	const [intra] = client.rooms;
	if (!this.games.get(payload.host)){
		client.emit('gameinteruption');
		return;
	}
	if (this.games.get(payload.host).left == intra)
		client.to(this.games.get(payload.host).right).emit('newballposition', payload.pos)
	else if (this.games.get(payload.host).right == intra)
		client.to(this.games.get(payload.host).left).emit('newballposition', payload.pos)
  }

  @SubscribeMessage('initgame')
  private async initGame(client: any){
	const [intra] = client.rooms;
	for(let game of this.games) {
		if(game[0] == intra || game[1].right == intra){
			client.to(game[1].right).emit('gameinteruption');
			client.to(game[1].left).emit('gameinteruption');
			this.games.delete(game[0]);
			console.log('Close old game');
		}
		if (game[1].right == ""){
			game[1].right = intra;
			client.emit('countdown', {left: game[1].left, right: game[1].right});
			client.to(game[1].left).emit('countdown', {left: game[1].left, right: game[1].right});
			await new Promise(r => setTimeout(r, 3100));
			this.startBall(client, game[0]);
			return { gamehost: game[0], isleft: false };
		}
	}
	this.games.set(intra, {left: intra, right: "", scoreleft: 0, scoreright: 0, serveleft: true})
	return { gamehost: intra, isleft: true };
  }

  @SubscribeMessage('scorepoint')
  private async scorePoint(client: any, gamehost: string): Promise<boolean>{
	const [intra] = client.rooms;
	if (gamehost == "")
		return;
	let game = this.games.get(gamehost);
	if (!game){
		client.emit('gameinteruption');
		return;
	}
	if (game.left == intra)
	{
		game.serveleft = false;
		game.scoreright++;
	}
	else if (game.right == intra){
		game.serveleft = true;
		game.scoreleft++;
	}
	else{
		console.log('error')
		return
	}
	if (game.scoreleft >= 11 && game.scoreleft > game.scoreright + 1)
		this.finishGame(client, game, game.left)
	if (game.scoreright >= 11 && game.scoreright > game.scoreleft + 1)
		this.finishGame(client, game, game.right)
	const score = {left: game.scoreleft, right: game.scoreright};
	client.emit('score', score)
	client.to(game.left).emit('score', score)
	client.to(game.right).emit('score', score)
	this.startBall(client, gamehost);
  }

  private async finishGame(client: any, game: any, intra: string){
	  const name = (await this.prismaService.findUserByIntra(intra)).full_name
	  client.emit('gameresult', name)
	  client.to(game.left).emit('gameresult', name)
	  client.to(game.right).emit('gameresult', name)
	  this.games.delete(game.left);
  }

  private async startBall(client: any, gamehost: string){
	const randX = Math.floor(Math.random() * 150)
	const Y = Math.floor(Math.random() * 100) + 150
	const randRad = Math.random() * 1.5708
	let start
	if (!this.games.get(gamehost)){
		client.emit('gameinteruption');
		return;
	}
	if (this.games.get(gamehost).serveleft)
		start = {x: 400 + randX, y: Y, xv: -Math.sin(randRad + 0.7853), yv: Math.cos(randRad + 0.7853)}
	else
		start = {x: 400 - randX, y: Y, xv: Math.sin(randRad + 0.7853), yv: Math.cos(randRad + 0.7853)}
	client.emit('newballposition', start)
	client.to(this.games.get(gamehost).left).emit('newballposition', start)
	client.to(this.games.get(gamehost).right).emit('newballposition', start)
  }

  @SubscribeMessage('interuptgame')
  private async interuptGame(client: any, gamehost: string){
	const [intra] = client.rooms;
	for(let game of this.games) {
		if (intra == game[1].left){
			client.to(game[1].right).emit('gameinteruption');
			this.games.delete(gamehost);
		}
		else if (intra == game[1].right){
			client.to(game[1].left).emit('gameinteruption');
			this.games.delete(gamehost);
		}
	}
  }
}

