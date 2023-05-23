import { Component, ViewChild, ElementRef } from '@angular/core';

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
  canvasWidth = 800;
  canvasHeight = 400;
  // ballX: number = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
  PowerUp: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  RightBar: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  LeftBar: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  Ball: IObject = {x: 0, y: 0, yv: 0, xv: 0, width: 0, height: 0, speed: 0};
  
  score: number[] = [0,0];
  gameState: boolean = false;
  dif: number;
  cooldown: boolean = false;
  @ViewChild('myCanvas', { static: true })
  gameCanvas!: ElementRef<HTMLCanvasElement>;

  private context!: CanvasRenderingContext2D;
  
  constructor() { 
  }

  public ngOnInit () {
    this.initializeGameObjects();
  }

  initializeGameObjects() {
    this.Ball.x = 300;
    this.Ball.y = 300;
    this.Ball.xv = 1;
    this.Ball.yv = 1;
    this.Ball.width = 7;
    this.Ball.speed = 1;
    this.LeftBar.height = 80;
    this.LeftBar.width = 16;
    this.LeftBar.x = 40;
    this.LeftBar.y = this.canvasHeight / 2 - this.LeftBar.height / 2;
    this.RightBar.height = 80;
    this.RightBar.width = 16;
    this.RightBar.x = this.canvasWidth - 40 - this.RightBar.width;
    this.RightBar.y = this.canvasHeight / 2 - this.LeftBar.height / 2;
    this.PowerUp.height = 30;
    this.PowerUp.width = 30;
    // this.LeftBar.speed =
  }

  public ngAfterViewInit () {
    this.gameCanvas.nativeElement.focus();
    this.context = this.gameCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.animate();
    console.log(this.Ball.x);
  }

  animate() {
    this.drawBars();
    for (let i = 0; i < this.Ball.speed; i++)
      this.drawBall();
    requestAnimationFrame(() => this.animate());
    if (this.cooldown == false)
    {
      this.cooldown = true;
      setTimeout(() => this.rollPowerUp(), 5000);
    }
  }

  rollPowerUp()
  {
    this.cooldown = false;
    if (Math.floor(Math.random() * 5) == 0)
      this.SpawnPowerUp(Math.floor(Math.random() * (700 - 100 + 1)) + 100, Math.floor(Math.random() * (380 - 20 + 1)) + 20);
  }

  SpawnPowerUp(x: number, y: number)
  {
    this.PowerUp.x = x;
    this.PowerUp.y = y;
    this.cooldown = true;
    this.context.fillStyle = 'gold';
    this.context.fillRect(x, y, this.PowerUp.width, this.PowerUp.height);
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

  checkifHitPaddle()
  { 
    if (this.hitboxCollider(this.Ball, this.LeftBar) == true)
    {
      // this.dif = this.Ball.y - this.LeftBar.y;
      // if (this.dif < 20)
      // {
      //   this.Ball.xv *= -1;
      //   if (this.Ball.yv > 0)
      //     this.Ball.yv = ((-1 * this.radian(-15)) * this.Ball.xv) + (this.radian(-15) * this.Ball.yv);
      //   else
      //     this.Ball.yv = ((-1 * this.radian(15)) * this.Ball.xv) + (this.radian(15) * this.Ball.yv);
      //   this.Ball.speed *= 1.1;
      // }
      // else if (this.dif < 40)
      // {
      //   this.Ball.xv *= -1;
      //   if (this.Ball.yv > 0)
      //     this.Ball.yv = (-1 * this.radian(-10)) * this.Ball.xv + this.radian(-10) * this.Ball.yv;
      //   else
      //     this.Ball.yv = (-1 * this.radian(-10)) * this.Ball.xv + this.radian(-10) * this.Ball.yv;
      //   this.Ball.speed *= 0.9;
      // }
      // else if (this.dif < 60)
      // {
      //   this.Ball.xv *= -1;
      //   if (this.Ball.yv < 0)
      //     this.Ball.yv = (-1 * this.radian(10)) * this.Ball.xv + this.radian(10) * this.Ball.yv;
      //   else
      //     this.Ball.yv = (-1 * this.radian(-10)) * this.Ball.xv + this.radian(-10) * this.Ball.yv;
      //   this.Ball.speed *= 0.9;
      // }
      // else
      // {
      //   this.Ball.xv *= -1;
      //   if (this.Ball.yv < 0)
      //     this.Ball.yv = (-1 * this.radian(15)) * this.Ball.xv + this.radian(15) * this.Ball.yv;
      //   else
      //   this.Ball.yv = (-1 * this.radian(-15)) * this.Ball.xv + this.radian(-15) * this.Ball.yv;
      //   this.Ball.speed *= 1.1;
      // }
      this.Ball.xv *= -1;
    }
  }

  checkifHitWall() {
    if (this.Ball.y + this.Ball.yv > this.canvasHeight)
      this.Ball.yv *= -1;
    else if (this.Ball.y + this.Ball.yv < 0)
      this.Ball.yv *= -1;
    if (this.Ball.x + this.Ball.xv + this.Ball.width > this.canvasWidth)
    {
      this.score[0]++;
      console.log(this.score[0], " : ", this.score[1]);
      this.Ball.x = 400 - this.Ball.width / 2;
      this.Ball.y = 200 - this.Ball.width / 2;
      this.Ball.xv = -1;
      this.Ball.yv = 1;
      this.Ball.speed = 4;
    }
    else if (this.Ball.x + this.Ball.xv < 0)
    {
      this.score[1]++;
      console.log(this.score[0], " : ", this.score[1]);      
      this.Ball.x = 400 - this.Ball.width / 2;
      this.Ball.y = 200 - this.Ball.width / 2;
      this.Ball.xv = -1;
      this.Ball.yv = 1;
      this.Ball.speed = 4;
    }
  }

  changeHeight(type: string)
  {
    if (type == 'L')
    {
      this.context.clearRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
      this.LeftBar.height = 80;
    }
    if (type == 'R')
    {
      this.context.clearRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
      this.RightBar.height = 80;
    }
    this.cooldown = false;
  }

  checkifHitPowerUp()
  {
    if (this.hitboxCollider(this.Ball, this.PowerUp) == true)
    {
      if (this.Ball.xv > 0)
      {
        if (this.LeftBar.y - 80 > 0)
          this.LeftBar.y -= 80;
        this.LeftBar.height = 160;
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
    this.context.clearRect(this.Ball.x, this.Ball.y, 1 + this.Ball.width, 1 + this.Ball.width);
    this.Ball.x += this.Ball.xv;
    this.Ball.y += this.Ball.yv;
    this.context.fillStyle = 'red';
    this.context.fillRect(this.Ball.x, this.Ball.y, 1 + this.Ball.width, 1 + this.Ball.width);
  }

  drawBars() {
    this.context.fillStyle = 'white';
    this.context.fillRect(this.LeftBar.x, this.LeftBar.y, this.LeftBar.width, this.LeftBar.height);
    this.context.fillRect(this.RightBar.x, this.RightBar.y, this.RightBar.width, this.RightBar.height);
  }

  handleKeyPress(event: any) {
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
  }
}
