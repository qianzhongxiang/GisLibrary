import { MessageModule } from './message.module';

describe('MessageComponentModule', () => {
  let messageModule: MessageModule;

  beforeEach(() => {
    messageModule = new MessageModule();
  });

  it('should create an instance', () => {
    expect(messageModule).toBeTruthy();
  });
});
