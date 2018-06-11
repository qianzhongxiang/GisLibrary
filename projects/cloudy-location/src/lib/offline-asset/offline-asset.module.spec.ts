import { OfflineAssetModule } from './offline-asset.module';

describe('OfflineAssetModule', () => {
  let offlineAssetModule: OfflineAssetModule;

  beforeEach(() => {
    offlineAssetModule = new OfflineAssetModule();
  });

  it('should create an instance', () => {
    expect(offlineAssetModule).toBeTruthy();
  });
});
