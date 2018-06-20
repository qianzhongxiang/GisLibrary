import { MultiPanelsModule } from './multi-panels.module';

describe('MultiPanelsModule', () => {
  let multiPanelsModule: MultiPanelsModule;

  beforeEach(() => {
    multiPanelsModule = new MultiPanelsModule();
  });

  it('should create an instance', () => {
    expect(multiPanelsModule).toBeTruthy();
  });
});
