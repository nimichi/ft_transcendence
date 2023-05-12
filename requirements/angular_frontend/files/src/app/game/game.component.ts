import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent {
  canvasWidth: number = 600;
  canvasHeight: number = 300;
  AcanvasWidth = 300;
  AcanvasHeight = 150;
  leftBarY: number = 0;
  rightBarY: number = 0;
  barWidth: number = 6;
  barHeight: number= 30; // need to make them change depending on the size of the window
  @ViewChild('myCanvas', { static: true })
  gameCanvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D;
  
  constructor() { 
  }

  public ngOnInit () {

  }

  
  public ngAfterViewInit () {
    this.gameCanvas.nativeElement.focus();
    this.context = this.gameCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.context.fillRect(0, 0, this.AcanvasWidth, this.AcanvasHeight);
    this.context.fillStyle = 'white';
    this.context.fillRect(0, this.AcanvasHeight / 2 - (this.barHeight / 2), this.barWidth, this.barHeight);
    this.context.fillRect(this.AcanvasWidth - this.barWidth, // where its placed x-axis
                          this.AcanvasHeight / 2 - (this.barHeight / 2), // y axis
                          this.barWidth, this.barHeight); // height and width
    this.rightBarY = this.AcanvasHeight / 2 - (this.barHeight / 2);
    this.leftBarY = this.rightBarY; 
  }

  handleKeyPress(event: any) {
    const step = 1;
    switch (event.key) {
      case 'w':
        this.moveLeftBar(-step);
        this.moveLeftBar(-step);
        break ;
      case 's':
        this.moveLeftBar(+step);
        this.moveLeftBar(+step);
        break ;
    }
  }

  moveLeftBar(step: number)
  {
    if (step > 0)
      if (this.leftBarY + this.barHeight + step > this.AcanvasHeight)
        return ;
    if (step < 0)
      if (this.leftBarY + step < 0)
        return ;
    this.context = this.gameCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.context.fillStyle = 'black';
    this.context.fillRect(0, this.leftBarY, this.barWidth, this.barHeight)
    this.context.fillStyle = 'white';
    this.leftBarY += step;
    this.context.fillRect(0, this.leftBarY, this.barWidth, this.barHeight)
    console.log(this.leftBarY);
  }
}
