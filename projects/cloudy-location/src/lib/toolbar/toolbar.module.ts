import { OfflineAssetComponent } from './../offline-asset/offline-asset.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table'
import { ToolbarComponent, FilterDialogComponent, SettingDialogComponent } from './toolbar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule
  ],
  exports: [ToolbarComponent, FilterDialogComponent, SettingDialogComponent, OfflineAssetComponent],
  declarations: [ToolbarComponent, FilterDialogComponent, SettingDialogComponent, OfflineAssetComponent],
  entryComponents: [FilterDialogComponent, SettingDialogComponent, OfflineAssetComponent]
})
export class ToolbarModule {
  // static forRoot(ToolbarConfig: ToolbarConfig, assetProfileUrl: string, mapConfig: MapConifg): ModuleWithProviders {
  //   return {
  //     ngModule: ToolbarModule,
  //     providers: [{ provider: AssetService, useFactory: () => new AssetService(assetProfileUrl) },
  //     { provider: DeviceService, useFactory: () => new DeviceService(mapConfig) }]
  //   }
  // }
}
