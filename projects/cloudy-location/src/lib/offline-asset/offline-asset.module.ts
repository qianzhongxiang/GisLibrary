import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineAssetComponent } from './offline-asset.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table'

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule
  ],
  declarations: [OfflineAssetComponent]
})
export class OfflineAssetModule { }
