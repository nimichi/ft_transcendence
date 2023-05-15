import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway {
  constructor(private GameService: GameService) {}

  @SubscribeMessage('updatePaddle')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }


}
