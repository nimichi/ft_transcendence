import { Component, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent {
  private gamehost: string = "";
  canvasWidth = 800;
  canvasHeight = 400;
  barWidth: number = 16;
  barHeight: number = 80;
  AbarWidth = this.barWidth / 2;
  AbarHeight = this.barHeight / 2;
  leftBarY: number = this.canvasHeight / 2 - this.AbarHeight;
  leftBarX: number = 40;
  rightBarY: number = this.canvasHeight / 2 - this.AbarHeight;
  rightBarX: number = this.canvasWidth - 40 - this.barWidth;
  ballX: number = -10;
  ballY: number = -10;
  xVel: number = 0;
  yVel: number = 0;
  hitbox: number = 7;
  j: number = 0;
  speed: number = 4;
  gameState: boolean = false;
  bool: boolean = true;
  @ViewChild('myCanvas', { static: true })
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  isLeftPlayer: boolean = false
  player: string = "https://cdn.intra.42.fr/users/439ae812911986ad4e2b01a32ef73ea4/rschleic.jpg"
  opponent: string = "https://cdn.intra.42.fr/users/f39c95b440a7892a13fd0815fdc4ed78/mnies.jpg"
  playerScore: number = 1
  opponentScore: number = 0
  value: number = 24
  showButton: boolean = true

  // @ViewChild('countdownValue', { static: true })
  // countdownValue!: ElementRef<HTMLSpanElement>;

  // startCountdown() {
  //   let value = 24;
  //   const countdownElement = this.countdownValue.nativeElement;

  //   const countdownInterval = setInterval(() => {
  //     countdownElement.style.setProperty('--value', String(value));

  //     if (value === 0) {
  //       clearInterval(countdownInterval);
  //     } else {
  //       value--;
  //     }
  //   }, 1000);
  // }

  private context!: CanvasRenderingContext2D;

  constructor(private socketService: SocketService, public chat: ChatService) {
	socketService.socketSubscribe('newbarposition', (y: number) => this.newBarPosition(y))
	socketService.socketSubscribe('newballposition', (pos: {x: number, y: number, xv: number, yv: number}) => this.newBallPosition(pos))
	socketService.socketSubscribe('gameinteruption', () => this.gameInteruption())
  }

  public ngOnInit () {
	this.socketService.requestEvent("initgame", null, (payload: { gamehost: string, isleft: boolean }) => this.prepareGame(payload))
  }

  prepareGame(payload: { gamehost: string, isleft: boolean }){
	this.isLeftPlayer = payload.isleft;
	this.gamehost = payload.gamehost;
  }

  newBallPosition(pos: {x: number, y: number, xv: number, yv: number}){
	this.context.clearRect(this.ballX - 1 , this.ballY - 1, 3 + this.hitbox, 3 + this.hitbox);
	this.ballX = pos.x;
	this.ballY = pos.y;
	this.xVel = pos.xv;
	this.yVel = pos.yv;
  }

  newBarPosition(y: number){
	if (!this.isLeftPlayer){
		this.context.clearRect(this.leftBarX, this.leftBarY, this.barWidth, this.barHeight);
		this.leftBarY = y;
	}
	else{
		this.context.clearRect(this.rightBarX, this.rightBarY, this.barWidth, this.barHeight);
		console.log(this.rightBarY)
		this.rightBarY = y;
	}
  }

  public ngAfterViewInit () {
    this.gameCanvas.nativeElement.focus();
    this.context = this.gameCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.animate();
  }

  animate() {
    this.drawBars();
    for (let i = 0; i < this.speed; i++)
      this.drawBall();
    requestAnimationFrame(() => this.animate());
  }

  checkifHitPaddle()
  {
	if (this.gamehost == "")
		return;
    if (this.isLeftPlayer && (Math.round(this.ballX) <= this.leftBarX + this.barWidth && Math.round(this.ballX) >= this.leftBarX))
    {
      if (Math.round(this.ballY) <= this.leftBarY + this.barHeight && Math.round(this.ballY) >= this.leftBarY)
      {
        if (this.ballY - this.leftBarY > 30)
          if (this.yVel < 0)
            this.yVel *= -1;
        else
          if (this.yVel > 0)
            this.yVel *= -1;
        this.xVel *= -1; // rechne aus wo das paddle von paddle aus gehittet wird, änder yvel und xvel accordingly und mach irgendwie speed höher
		this.socketService.emitEvent('ballposition', {pos: {x: this.ballX, y: this.ballY, xv: this.xVel, yv: this.yVel}, host: this.gamehost});
	  }
    }
    if (!this.isLeftPlayer && (Math.round(this.ballX + this.hitbox) >= this.rightBarX && Math.round(this.ballX + 7) <= this.rightBarX + this.barWidth))
    {
      if (Math.round(this.ballY) > this.rightBarY && Math.round(this.ballY) < this.rightBarY + this.barHeight)
	  {
		  this.xVel *= -1; // right paddle hit algorithm
		  this.socketService.emitEvent('ballposition', {pos: {x: this.ballX, y: this.ballY, xv: this.xVel, yv: this.yVel}, host: this.gamehost});
	  }
    }
  }

  checkifHitWall() {
	if (this.gamehost == "")
		return;
    if (this.ballY + this.yVel > this.canvasHeight)
      this.yVel *= -1;
    else if (this.ballY + this.yVel < 0)
      this.yVel *= -1;
    if (!this.isLeftPlayer && this.ballX + this.xVel + this.hitbox > this.canvasWidth + 10)
    {
		console.log('right')
		this.xVel = 0;
		this.yVel = 0;
		this.ballX = -4;
		this.socketService.emitEvent('scorepoint', this.gamehost)
    }
    else if (this.isLeftPlayer && this.ballX + this.xVel < 0 - 10)
    {
		console.log('left')
		this.xVel = 0;
		this.yVel = 0;
		this.ballX = -4;
		this.socketService.emitEvent('scorepoint', this.gamehost)
    }
  }

  drawBall() {
    this.checkifHitPaddle();
    this.checkifHitWall();
    this.context.clearRect(this.ballX - 1 , this.ballY - 1, 3 + this.hitbox, 3 + this.hitbox);
    this.ballX += this.xVel;
    this.ballY += this.yVel;
    this.context.fillStyle = 'white';
    this.context.fillRect(this.ballX, this.ballY, 1 + this.hitbox, 1 + this.hitbox);
  }

  drawBars() {
    this.context.fillStyle = 'white';
    this.context.fillRect(this.leftBarX, this.leftBarY, this.barWidth, this.barHeight);
    this.context.fillRect(this.rightBarX, this.rightBarY, this.barWidth, this.barHeight);
  }

  handleKeyPress(event: any) {
	if (this.isLeftPlayer){
		switch (event.key) {
		case 'w':
			if (this.leftBarY > 0)
			{
			this.context.clearRect(this.leftBarX, this.leftBarY, this.barWidth, this.barHeight);
			this.leftBarY -= 10;
			}
			break ;
		case 's':
			if (this.leftBarY + this.barHeight < this.canvasHeight)
			{
			this.context.clearRect(this.leftBarX, this.leftBarY, this.barWidth, this.barHeight);
			this.leftBarY += 10;
			}
			break ;
		}
		if (this.gamehost != "")
			this.socketService.emitEvent('barposition', {y: this.leftBarY, host: this.gamehost});
	}
	else{
		switch (event.key) {
		case 'w':
			if (this.rightBarY > 0)
			{
			this.context.clearRect(this.rightBarX, this.rightBarY, this.barWidth, this.barHeight);
			this.rightBarY -= 10;
			}
			break ;
		case 's':
			if (this.rightBarY + this.barHeight < this.canvasHeight)
			{
			this.context.clearRect(this.rightBarX, this.rightBarY, this.barWidth, this.barHeight);
			this.rightBarY += 10;
			}
			break ;
		}
		if (this.gamehost != "")
			this.socketService.emitEvent('barposition', {y: this.rightBarY, host: this.gamehost});
	}
  }

  openChat($event: Event){
	this.chat.toggleChat()
  }


  waitForGame(){
    this.showButton = false
  }

  gameInteruption(){
	this.xVel = 0;
	this.yVel = 0;
	this.ballX = -8;
	this.gamehost = ""
	console.log("game interruption")
	//TODO game interuption
  }

  ngOnDestroy(){
	if (this.gamehost != "")
		this.socketService.emitEvent('interuptgame', this.gamehost)
  }
}
