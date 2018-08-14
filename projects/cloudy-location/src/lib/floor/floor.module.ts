import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorComponent } from './floor.component';
import { FloorService } from '../../index';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FloorComponent],
  providers: [FloorService]
})
export class FloorModule { }
