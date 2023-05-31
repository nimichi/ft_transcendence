import { Component, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { ChatService } from '../chat/chat.service';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

interface IObject{
	x: number,
	y: number,
	xv: number,
	yv: number,
	width: number,
	height: number,
	speed: number,
  };

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent {
  private gameid: string = "";
  canvasWidth = 800;
  canvasHeight = 400;
  // Ball.x: number = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
  PowerUp: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  RightBar: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  LeftBar: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  Ball: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};

  gameState: boolean = false;
  cooldown: boolean = false;
  @ViewChild('myCanvas', { static: true })
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  isLeftPlayer: boolean = false
  leftPic: string = ""
  rightPic: string = ""
  leftScore: number = 0
  rightScore: number = 0
  showButton: boolean = true
  showCountdown: boolean = false
  showPowerUps: boolean = false
  countdownValue: number  = 4
  message: string = "Game ended unexpectedly"
  waiting: boolean = false

  public showPrompt: boolean = false;

  private context!: CanvasRenderingContext2D;

  constructor(private socketService: SocketService, private router: Router, public chat: ChatService, private activatedRoute: ActivatedRoute) {
    socketService.socketSubscribe('newbarposition', (y: number) => this.newBarPosition(y))
	socketService.socketSubscribe('newballposition', (pos: {x: number, y: number, xv: number, yv: number}) => this.newBallPosition(pos))
	socketService.socketSubscribe('score', (score: {left: number, right: number}) => this.updateScore(score))
	socketService.socketSubscribe('countdown', (data: {left: string, right: string, gameid: string}) => this.startCountdown(data))
	socketService.socketSubscribe('gameresult', (name: string) => this.getResult(name))
  }

  public ngOnInit () {
	this.initializeGameObjects();
	if (!this.socketService.socketState()){
		return;
	}


	this.activatedRoute.params.subscribe((params: any) => {
		if (params.gameid && params.powup){
			if (params.powup === 'true')
				this.waitForPrivateGame(params.gameid, true);
			else
				this.waitForPrivateGame(params.gameid, false);
			console.log('privgame');
		}
	});
  }

  initializeGameObjects() {
	  this.Ball.x = -8;
    this.Ball.width = 7;
    this.LeftBar.height = 80;
    this.LeftBar.width = 16;
	  this.Ball.speed = 4;
    this.LeftBar.x = 40;
    this.LeftBar.y = this.canvasHeight / 2 - this.LeftBar.height / 2;
    this.RightBar.height = 80;
    this.RightBar.width = 16;
    this.RightBar.x = this.canvasWidth - 40 - this.RightBar.width;
    this.RightBar.y = this.canvasHeight / 2 - this.LeftBar.height / 2;
    this.PowerUp.height = 30;
    this.PowerUp.width = 30;
	  this.PowerUp.x = -100;
    // this.LeftBar.speed =
  }

  updateScore(score: {left: number, right: number}){
	this.leftScore = score.left;
	this.rightScore = score.right;
  }

  startCountdown(data: {left: string, right: string, gameid: string}) {
	this.resetField()
	this.waiting = false;
	this.gameid = data.gameid
	this.socketService.socketSubscribe('gameinteruption', () => this.gameInteruption())
	this.socketService.requestEvent('fetchUserpic', data.left, (pic: string) => this.setLeftPic(pic));
	this.socketService.requestEvent('fetchUserpic', data.right, (pic: string) => this.setRightPic(pic));
	this.countdown();
  }

  countdown(){
    this.showButton = false
    this.showCountdown = true
    this.countdownValue--
    if (this.countdownValue > 0){
      setTimeout(this.countdown.bind(this), 1000)
    }
    else{
      this.showCountdown = false
      this.countdownValue = 4
	  if (this.showPowerUps)
	  	this.socketService.socketSubscribe('spawnpowerup', (pos: {x: number, y: number}) => this.spawnPowerUp(pos))
    }
  }

  private setLeftPic(pic: string){
	this.leftPic = pic;
  }

  private setRightPic(pic: string){
	this.rightPic = pic;
  }

  newBallPosition(pos: {x: number, y: number, xv: number, yv: number}){
	  this.context.clearRect(this.Ball.x - 1 , this.Ball.y - 1, 3 + this.Ball.width, 3 + this.Ball.width);
	  this.Ball.x = pos.x;
	  this.Ball.y = pos.y;
	  this.Ball.xv = pos.xv;
	  this.Ball.yv = pos.yv;
	  console.log('new ball')
  }

  newBarPosition(y: number){
	if (!this.isLeftPlayer){
		this.context.clearRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
		this.LeftBar.y = y;
	}
	else{
		this.context.clearRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
		console.log(this.RightBar.y)
		this.RightBar.y = y;
	}
  }

  public ngAfterViewInit () {
    this.gameCanvas.nativeElement.focus();
    this.context = this.gameCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.animate();
  }

  animate() {
    this.drawBars();
    for (let i = 0; i < this.Ball.speed; i++)
      this.drawBall();
    requestAnimationFrame(() => this.animate());
    // if (this.cooldown == false)
    // {
    //   this.cooldown = true;
    //   setTimeout(() => this.rollPowerUp(), 5000);
    // }
  }

//   rollPowerUp()
//   {
//     this.cooldown = false;
//     if (Math.floor(Math.random() * 5) == 0)
//       this.SpawnPowerUp(Math.floor(Math.random() * (700 - 100 + 1)) + 100, Math.floor(Math.random() * (380 - 20 + 1)) + 20);
//   }

  spawnPowerUp(pos: {x: number, y: number})
  {
	  this.context.clearRect(this.PowerUp.x, this.PowerUp.y, this.PowerUp.width, this.PowerUp.height);
    this.PowerUp.x = pos.x;
    this.PowerUp.y = pos.y;
    this.cooldown = true;
    this.context.fillStyle = 'gold';
    this.context.fillRect(pos.x, pos.y, this.PowerUp.width, this.PowerUp.height);
  }

  hitboxCollider(ball: IObject, object: IObject)
  {
    if (ball.x < object.x + object.width &&
      ball.x + ball.width > object.x &&
      ball.y < object.y + object.height &&
      ball.y + ball.width > object.y) {
      return true;
    }
    else {
      return false;
    }
  }

  radian(angle: number)
  {
    var radian = (angle * Math.PI) / 180;
    return (radian);
  }

  changeBallDirection(Bar: IObject)
  {
    let relativeIntersectY = (Bar.y + Bar.height / 2) - this.Ball.y;
    let normalizedIntersectY = (relativeIntersectY / Bar.height / 2 );
    let bounceAngle = normalizedIntersectY * this.radian(60);
    this.Ball.xv = Math.cos(bounceAngle);
    this.Ball.yv = Math.sin(bounceAngle) * -1;
	if(!this.isLeftPlayer)
		this.Ball.xv = this.Ball.xv * -1;
  }

  collisionDetection(Bar:IObject)
  {
    if (this.Ball.xv > 0 && this.Ball.yv >= 0) // nach rechts unten
    {
      if (this.Ball.y + this.Ball.width == Bar.y)
        this.Ball.yv *= -1;
      else
        this.changeBallDirection(Bar);
    }
    else if (this.Ball.xv > 0 && this.Ball.yv <= 0) // nach rechts oben
    {
      if (this.Ball.y == Bar.y + Bar.height)
        this.Ball.yv *= -1;
      else
        this.changeBallDirection(Bar);
    }
    else if (this.Ball.xv < 0 && this.Ball.yv >= 0) // nach links unten
    {
      if (this.Ball.y + this.Ball.width == Bar.y)
        this.Ball.yv *= -1;
      else
        this.changeBallDirection(Bar);
    }
    else if (this.Ball.xv < 0 && this.Ball.yv <= 0) // nach links oben
    {
      if (this.Ball.y == Bar.y + Bar.height)
        this.Ball.yv *= -1;
      else
        this.changeBallDirection(Bar);
    }
  }

  checkifHitPaddle()
  {
	  if (this.gameid == "")
		  return;
    if (this.hitboxCollider(this.Ball, this.LeftBar) == true)
    {
      this.collisionDetection(this.LeftBar);
      if (this.isLeftPlayer)
		    this.socketService.emitEvent('ballposition', {pos: {x: this.Ball.x, y: this.Ball.y, xv: this.Ball.xv, yv: this.Ball.yv}, gameid: this.gameid});
	  }
    if (this.hitboxCollider(this.Ball, this.RightBar) == true)
    {
		  this.collisionDetection(this.RightBar);
      if (!this.isLeftPlayer)
		    this.socketService.emitEvent('ballposition', {pos: {x: this.Ball.x, y: this.Ball.y, xv: this.Ball.xv, yv: this.Ball.yv}, gameid: this.gameid});
    }
  }

  checkifHitWall() {
	if (this.gameid == "")
		return;
    if (this.Ball.y + this.Ball.yv > this.canvasHeight)
      this.Ball.yv *= -1;
    else if (this.Ball.y + this.Ball.yv < 0)
      this.Ball.yv *= -1;
    if (!this.isLeftPlayer && this.Ball.x + this.Ball.width > this.canvasWidth + 15)
    {
		  this.Ball.xv = 0;
		  this.Ball.yv = 0;
		  this.Ball.x = -4;
		  console.log('score right' + Math.random())
		  this.socketService.emitEvent('scorepoint', this.gameid)
    }
    else if (this.isLeftPlayer && this.Ball.x < 0 - 15)
    {
		  this.Ball.xv = 0;
		  this.Ball.yv = 0;
		  this.Ball.x = -4;
		  console.log('score left' + Math.random())
		  this.socketService.emitEvent('scorepoint', this.gameid)
    }
  }

  changeHeight(type: string)
  {
    if (type == 'L')
    {
      this.context.clearRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
      if (this.LeftBar.y == 0)
      this.LeftBar.height = 80;
    else if (this.LeftBar.y == this.canvasHeight - 160)
    {
      this.LeftBar.height = 80;
      this.LeftBar.y += 80
    }
    else
    {
      this.LeftBar.height = 80;
      this.LeftBar.y += 40;
    }
    }
    if (type == 'R')
    {
      this.context.clearRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
      if (this.RightBar.y == 0)
        this.RightBar.height = 80;
      else if (this.RightBar.y == this.canvasHeight - 160)
      {
        this.RightBar.height = 80;
        this.RightBar.y += 80
      }
      else
      {
        this.RightBar.height = 80;
        this.RightBar.y += 40;
      }
    }
    this.cooldown = false;
  }

  checkifHitPowerUp()
  {
    if (this.hitboxCollider(this.Ball, this.PowerUp) == true)
    {
      if (this.Ball.xv > 0)
      {
        if (this.LeftBar.y >= 40 && this.LeftBar.y <= this.canvasWidth - 40)
        {
          this.LeftBar.y -= 40;
          this.LeftBar.height = 160;
        }
        else if (this.LeftBar.y < 40)
        {
          this.LeftBar.y = 0;
          this.LeftBar.height = 160;
        }
        else if (this.LeftBar.y > this.canvasWidth - 40)
        {
          this.LeftBar.y = this.canvasWidth - 160;
          this.LeftBar.height = 160;
        }
        setTimeout(() => this.changeHeight('L'), 15000);
      }
      else
      {
        if (this.RightBar.y - 80 > 0)
          this.RightBar.y -= 80;
        this.RightBar.height = 160;
        setTimeout(() => this.changeHeight('R'), 15000);
      }
      this.context.clearRect(this.PowerUp.x, this.PowerUp.y, this.PowerUp.width, this.PowerUp.height);
      this.PowerUp.x = this.canvasWidth + 1;
      this.PowerUp.y = this.canvasHeight + 1;
      this.cooldown = true;
    }
  }

  drawBall() {
    this.checkifHitPaddle();
    this.checkifHitWall();
    this.checkifHitPowerUp();
    this.context.clearRect(this.Ball.x - 1, this.Ball.y - 1 , 3 + this.Ball.width, 3 + this.Ball.width);
    this.Ball.x += this.Ball.xv;
    this.Ball.y += this.Ball.yv;
    this.context.fillStyle = 'white';
    this.context.fillRect(this.Ball.x, this.Ball.y, 1 + this.Ball.width, 1 + this.Ball.width);
  }

  drawBars() {
    this.context.fillStyle = 'white';
    this.context.fillRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
    this.context.fillRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
  }

  handleKeyPress(event: any) {
	if (this.gameid == "")
		return;
	if (this.isLeftPlayer){
		switch (event.key) {
		case 'w':
			if (this.LeftBar.y > 0)
			{
			this.context.clearRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
			this.LeftBar.y -= 10;
			}
			break ;
		case 's':
			if (this.LeftBar.y + this.LeftBar.height < this.canvasHeight)
			{
			this.context.clearRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
			this.LeftBar.y += 10;
			}
			break ;
		}
		if (this.gameid != "")
			this.socketService.emitEvent('barposition', {y: this.LeftBar.y, gameid: this.gameid});
	}
	else{
		switch (event.key) {
		case 'w':
			if (this.RightBar.y > 0)
			{
			this.context.clearRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
			this.RightBar.y -= 10;
			}
			break ;
		case 's':
			if (this.RightBar.y + this.RightBar.height < this.canvasHeight)
			{
			this.context.clearRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
			this.RightBar.y += 10;
			}
			break ;
		}
		if (this.gameid != "")
			this.socketService.emitEvent('barposition', {y: this.RightBar.y, gameid: this.gameid});
	}
  }

  openChat($event: Event){
	this.chat.toggleChat()
  }


  waitForGame(){
	console.log('emit initgame ' + Math.random() )
	this.socketService.requestEvent("initgame", false, (isLeft: boolean) => this.setIsLeft(isLeft))
    this.showButton = false
	this.waiting = true
  }

  waitForPowupGame(){
	this.socketService.requestEvent("initgame", true, (isLeft: boolean) => this.setIsLeft(isLeft))
	console.log('emit initgame w powup ' + Math.random() )
    this.showButton = false
	this.showPowerUps = true
	this.waiting = true
  }

  waitForPrivateGame(gameid: string, powup: boolean){
	this.socketService.requestEvent("initprivgame", {gameid: gameid, powup: powup}, (isLeft: boolean) => this.setIsLeft(isLeft))
  }

  setIsLeft(isLeft: boolean){
	console.log('set is left: ' + isLeft)
	this.isLeftPlayer = isLeft;
  }

  gameInteruption(){
	this.message = "connection lost";
	this.showPrompt = true;
	this.socketService.socketUnsubscribe('gameinteruption');
	this.resetField();
	console.log("gameInteruption called")
  }

  getResult(name: string){
	this.socketService.socketUnsubscribe('gameinteruption');
	this.message = name + ' won!'
	this.showPrompt = true;
  }

  resetField(){
	this.context.clearRect(this.PowerUp.x, this.PowerUp.y, this.PowerUp.width, this.PowerUp.height);
	this.socketService.socketUnsubscribe('spawnpowerup')
	this.context.clearRect(this.Ball.x - 1 , this.Ball.y - 1, 3 + this.Ball.width, 3 + this.Ball.width);
	this.Ball.xv = 0;
	this.Ball.yv = 0;
	this.Ball.x = -8;
	this.gameid = ""
	this.leftPic = ""
	this.rightPic = ""
	this.leftScore = 0
	this.rightScore = 0
	this.context.clearRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
	this.context.clearRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
	this.LeftBar.y = this.canvasHeight / 2 - this.LeftBar.height / 2;
	this.RightBar.y = this.canvasHeight / 2 - this.RightBar.height / 2;
	this.showButton = true;
	this.showPowerUps = false;
  }

  endGame(){
	this.showPrompt = false;
	this.resetField();
	this.router.navigate(['/game']);
  }

  ngOnDestroy(){
	this.socketService.emitEvent('leftgamepage', this.gameid);
	this.resetField()
	this.socketService.socketUnsubscribe('gameinteruption');
	this.socketService.socketUnsubscribe('newbarposition')
	this.socketService.socketUnsubscribe('newballposition')
	this.socketService.socketUnsubscribe('score')
	this.socketService.socketUnsubscribe('countdown')
	this.socketService.socketUnsubscribe('gameresult')
  }
}
