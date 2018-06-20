import { MultiPanelsComponent } from './multi-panels.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiPanelsItemComponent } from './multi-panels-item/multi-panels-item.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MultiPanelsComponent, MultiPanelsItemComponent],
  exports: [MultiPanelsComponent, MultiPanelsItemComponent]
})
export class MultiPanelsModule { }
