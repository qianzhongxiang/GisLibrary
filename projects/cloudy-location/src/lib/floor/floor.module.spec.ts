import { FloorModule } from './floor.module';

describe('FloorModule', () => {
  let floorModule: FloorModule;

  beforeEach(() => {
    floorModule = new FloorModule();
  });

  it('should create an instance', () => {
    expect(floorModule).toBeTruthy();
  });
});
