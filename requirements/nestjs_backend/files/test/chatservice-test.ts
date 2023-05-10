import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../src/chat/chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addMessage', () => {
    it('should add a new message to the messages array', () => {
      const message = 'Hello, world!';
      service.addMessage(message);
      expect(service.getMessages()).toContain(message);
    });
  });
});