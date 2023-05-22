import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent {
  canvasWidth = 800;
  canvasHeight = 400;
  barWidth: number = 16;
  barHeight: number= 80; 
  AbarWidth = this.barWidth / 2;
  AbarHeight = this.barHeight / 2;
  leftBarY: number = this.canvasHeight / 2 - this.AbarHeight;
  leftBarX: number = 40;
  rightBarY: number = this.canvasHeight / 2 - this.AbarHeight;
  rightBarX: number = this.canvasWidth - 40 - this.barWidth;
  ballX: number = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
  ballY: number = Math.floor(Math.random() * (350 - 50 + 1)) + 50;
  xVel: number = 1;
  yVel: number = 1;
  hitbox: number = 7;
  j: number = 0;
  speed: number = 4;
  score: number[] = [0,0];
  gameState: boolean = false;
  bool: boolean = true;
  dif: number;
  @ViewChild('myCanvas', { static: true })
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  private context!: CanvasRenderingContext2D;
  
  constructor() { 
  }

  public ngOnInit () {

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
    if (Math.round(this.ballX) == this.leftBarX + this.barWidth)
    {
      if (Math.round(this.ballY) >= (this.leftBarY - this.hitbox) && Math.round(this.ballY) <= (this.leftBarY + this.barHeight + this.hitbox))
      {
        this.dif = this.ballY - this.leftBarY;
        if (this.dif < 20)
        {
          this.xVel *= -1;
          this.yVel = ((-1 * Math.sin(-15)) * this.xVel) + (Math.cos(-15) * this.yVel);
          this.speed *= 1.1;
        }
        else if (this.dif < 40)
        {
          this.xVel *= -1;
          this.yVel = (-1 * Math.sin(-10)) * this.xVel + Math.cos(-10) * this.yVel;
          this.speed *= 0.9;
        }
        else if (this.dif < 60)
        {
          this.xVel *= -1;
          this.yVel = (-1 * Math.sin(10)) * this.xVel + Math.cos(10) * this.yVel;
          this.speed *= 0.9;
        }
        else
        {
          this.xVel *= -1;
          this.yVel = (-1 * Math.sin(15)) * this.xVel + Math.cos(15) * this.yVel;
          this.speed *= 1.1;
        }
      }
    }
    if (Math.round(this.ballX) == this.rightBarX)
    {
      if (Math.round(this.ballY) >= (this.rightBarY - this.hitbox) && Math.round(this.ballY) <= (this.rightBarY + this.barHeight + this.hitbox))
      {
        this.dif = this.ballY - this.rightBarY;
        if (this.dif < 20)
        {
          this.xVel *= -1;
          this.yVel = ((-1 * Math.sin(-15)) * this.xVel) + (Math.cos(-15) * this.yVel);
          this.speed *= 1.1;
        }
        else if (this.dif < 40)
        {
          this.xVel *= -1;
          this.yVel = (-1 * Math.sin(-10)) * this.xVel + Math.cos(-10) * this.yVel;
          this.speed *= 0.9;
        }
        else if (this.dif < 60)
        {
          this.xVel *= -1;
          this.yVel = (-1 * Math.sin(10)) * this.xVel + Math.cos(10) * this.yVel;
          this.speed *= 0.9;
        }
        else
        {
          this.xVel *= -1;
          this.yVel = (-1 * Math.sin(15)) * this.xVel + Math.cos(15) * this.yVel;
          this.speed *= 1.1;
        }
      }
    }
  }

  checkifHitWall() {
    if (this.ballY + this.yVel > this.canvasHeight)
      this.yVel *= -1;
    else if (this.ballY + this.yVel < 0)
      this.yVel *= -1;
    if (this.ballX + this.xVel + this.hitbox > this.canvasWidth)
    {
      this.score[0]++;
      console.log(this.score[0], " : ", this.score[1]);
      this.ballX = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
      this.ballY = Math.floor(Math.random() * (350 - 50 + 1)) + 50;
      this.xVel = -1;
      this.yVel = 1;
      this.speed = 4;
    }
    else if (this.ballX + this.xVel < 0)
    {
      this.score[1]++;
      console.log(this.score[0], " : ", this.score[1]);      
      this.ballX = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
      this.ballY = Math.floor(Math.random() * (350 - 50 + 1)) + 50;
      this.xVel = -1;
      this.yVel = 1;
      this.speed = 4;
    }
  }

  drawBall() {
    this.checkifHitPaddle();
    this.checkifHitWall();
    this.context.clearRect(this.ballX, this.ballY, 1 + this.hitbox, 1 + this.hitbox);
    this.ballX += this.xVel;
    this.ballY += this.yVel;
    this.context.fillStyle = 'red';
    this.context.fillRect(this.ballX, this.ballY, 1 + this.hitbox, 1 + this.hitbox);
  }

  drawBars() {
    this.context.fillStyle = 'white';
    this.context.fillRect(this.leftBarX, this.leftBarY, this.barWidth, this.barHeight);
    this.context.fillRect(this.rightBarX, this.rightBarY, this.barWidth, this.barHeight);
  }

  handleKeyPress(event: any) {
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
  }
}
