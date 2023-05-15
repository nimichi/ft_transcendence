import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent {
  canvasWidth: number = 600;
  canvasHeight: number = 300;
  AcanvasWidth = this.canvasWidth / 2;
  AcanvasHeight = this.canvasHeight / 2;
  barWidth: number = 6;
  barHeight: number= 30; // need to make them change depending on the size of the window
  AbarWidth = this.barWidth / 2;
  AbarHeight = this.barHeight / 2;
  leftBarY: number = 120;
  rightBarY: number = this.AcanvasHeight / 2 - this.AbarHeight;
  ballX: number = this.AcanvasWidth / 2;
  ballY: number = this.AcanvasHeight / 2;
  xVel: number = 1;
  yVel: number = 0;
  animationFrameiD!: number;
  gameState: boolean = false;
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
    // this.context.fillRect(0, 0, this.AcanvasWidth, this.AcanvasHeight);
    // this.context.fillStyle = 'white';
    // this.context.fillRect(this.ballX - 1, this.ballY - 1, 3, 3);
    // this.context.fillRect(0, this.AcanvasHeight / 2 - (this.barHeight / 2), this.barWidth, this.barHeight);
    // this.context.fillRect(this.AcanvasWidth - this.barWidth, // where its placed x-axis
    //                       this.AcanvasHeight / 2 - (this.barHeight / 2), // y axis
    //                       this.barWidth, this.barHeight); // height and width
    // this.rightBarY = this.AcanvasHeight / 2 - (this.barHeight / 2);
    // this.leftBarY = this.rightBarY; 
    // this.gameState = true;
    this.animate();
  }

  animate() {
    this.checkifHit();
    this.context.clearRect(this.ballX, this.ballY, 5, 5);
    this.context.clearRect(0, this.leftBarY, this.barWidth, this.AbarHeight);
    this.drawBars();
    this.drawBall();
    this.animationFrameiD = requestAnimationFrame(() => this.animate());
  }

  checkifHit() {
    if (this.xVel > 0)
      if ((this.ballX + this.xVel) >= this.AcanvasWidth)
        this.xVel *= -1;
    if (this.xVel < 0)
      if ((this.ballX + this.xVel) <= this.AcanvasWidth)
        this.xVel *= -1;
  }

  drawBall() {
    console.log(this.ballX);
    console.log(this.xVel);
    this.ballX += this.xVel;
    this.ballY += this.yVel;
    this.context.fillStyle = 'red';
    this.context.fillRect(this.ballX, this.ballY, 5, 5);
  }

  drawBars() {
    this.context.fillStyle = 'white';
    this.context.fillRect(0, this.leftBarY, this.barWidth, this.barHeight);
  }

  handleKeyPress(event: any) {
    const step = 1;
    switch (event.key) {
      case 'w':
        this.context.clearRect(0, this.leftBarY, this.barWidth, this.barHeight);
        this.leftBarY -= 2;
        break ;
      case 's':
        this.context.clearRect(0, this.leftBarY, this.barWidth, this.barHeight);
        this.leftBarY += 2;
        break ;
    }
  }

  // moveLeftBar(step: number)
  // {
  //   if (step > 0)
  //     if (this.leftBarY + this.barHeight + step > this.AcanvasHeight)
  //       return ;
  //   if (step < 0)
  //     if (this.leftBarY + step < 0)
  //       return ;
  //   this.context = this.gameCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
  //   this.context.fillStyle = 'black';
  //   this.context.fillRect(0, this.leftBarY, this.barWidth, this.barHeight)
  //   this.context.fillStyle = 'white';
  //   this.leftBarY += step;
  //   this.context.fillRect(0, this.leftBarY, this.barWidth, this.barHeight)
  //   console.log(this.leftBarY);
  // }
}
