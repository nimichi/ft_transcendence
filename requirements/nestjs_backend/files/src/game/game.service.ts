import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    CanvasY: number= 300;
    CanvasX: number = 600;
    BallX: number = this.CanvasX / 2;
    BallY: number = this.CanvasY / 2;
    LeftPaddle: number = this.CanvasY / 2;
    RightPaddle: number = this.CanvasY / 2;
}
