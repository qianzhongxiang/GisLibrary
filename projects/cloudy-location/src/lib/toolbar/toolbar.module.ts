import { MatDialogModule } from '@angular/material/dialog';
import { ToolbarComponent } from './toolbar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    NoopAnimationsModule
  ],
  exports: [ToolbarComponent],
  declarations: [ToolbarComponent]
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
