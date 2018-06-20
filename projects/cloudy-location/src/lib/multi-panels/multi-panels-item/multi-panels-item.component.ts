import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'cl-multi-panels-item',
  templateUrl: './multi-panels-item.component.html',
  styleUrls: ['./multi-panels-item.component.css']
})
export class MultiPanelsItemComponent implements OnInit {
  @Input("code")
  public code: string
  @Input("title")
  public title: string
  @Input("iconClass")
  public iconClass: string
  @HostBinding("class.show")
  public show: boolean
  constructor() { }

  ngOnInit() {
  }

}
