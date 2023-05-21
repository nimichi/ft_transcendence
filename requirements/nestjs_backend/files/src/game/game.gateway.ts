import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  private games: {left: string, right: string, scoreleft: number, scoreright: number, serveleft: boolean}[] = []

  constructor(private GameService: GameService) {}

  @SubscribeMessage('barposition')
  tansmitBarPosition(client: any, payload: {y: number, id: number}) {
	const [intra] = client.rooms;
	if (this.games[payload.id].left == intra)
    	client.to(this.games[payload.id].right).emit('newbarposition', payload.y)
	else if (this.games[payload.id].right == intra)
    	client.to(this.games[payload.id].left).emit('newbarposition', payload.y)
  }

  @SubscribeMessage('ballposition')
  tansmitBallPosition(client: any, payload: {pos: {x: number, y: number, xv: number, xy: number}, id: number}) {
	const [intra] = client.rooms;
	if (this.games[payload.id].left == intra)
		client.to(this.games[payload.id].right).emit('newballposition', payload.pos)
	else if (this.games[payload.id].right == intra)
		client.to(this.games[payload.id].left).emit('newballposition', payload.pos)
  }

  @SubscribeMessage('initgame')
  initGame(client: any, payload: {x: number, y: number, xv: number, xy: number}) {
	const [intra] = client.rooms;
	if(this.games.length == 0){
		this.games.push({left: intra, right: "", scoreleft: 0, scoreright: 0, serveleft: true})
		return { gameid: 0, isleft: true };
	}
	else if(this.games[this.games.length - 1].right == ""){
		this.games[this.games.length - 1].right = intra;
		this.startBall(client, this.games.length - 1);
		return { gameid: this.games.length - 1, isleft: false };
	}
	else{
		this.games.push({left: intra, right: "", scoreleft: 0, scoreright: 0, serveleft: true})
		return { gameid: this.games.length - 1, isleft: true };
	}
  }

  @SubscribeMessage('scorepoint')
  scorePoint(client: any, gameid: number){
	const [intra] = client.rooms;
	if (this.games[gameid].left == intra)
	{
		this.games[gameid].serveleft = false;
		this.games[gameid].scoreright++;
	}
	else if (this.games[gameid].right == intra){
		this.games[gameid].serveleft = true;
		this.games[gameid].scoreleft++;
	}
	else{
		console.log('error')
		return
	}
	console.log('Left: ' + this.games[gameid].scoreleft + ' Right: ' + this.games[gameid].scoreright)
	this.startBall(client, gameid);
  }

  private startBall(client: any, gameid: number){
	const randX = Math.floor(Math.random() * 150)
	const Y = Math.floor(Math.random() * 100) + 150
	const randRad = Math.random() * 1.5708
	let start
	if (this.games[gameid].serveleft)
		start = {x: 400 + randX, y: Y, xv: -Math.sin(randRad + 0.7853), yv: Math.cos(randRad + 0.7853)}
	else
		start = {x: 400 - randX, y: Y, xv: Math.sin(randRad + 0.7853), yv: Math.cos(randRad + 0.7853)}
	client.emit('newballposition', start)
	console.log('Angle: ' + Math.asin(start.xv) * (180/Math.PI))
	client.to(this.games[gameid].left).emit('newballposition', start)
	client.to(this.games[gameid].right).emit('newballposition', start)
  }
}

