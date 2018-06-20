import { Component, OnInit } from '@angular/core';
export interface CateItem { class: string, title: string, code: string, disable?: boolean }

export interface MultiPanelsConfig {
  items: Array<{
    class: string,
    title: string,
    code: string,
    disable: boolean
  }>,
  taskListSource: {
    url: string
  }
}

@Component({
  selector: 'app-multi-panels',
  templateUrl: './multi-panels.component.html',
  styleUrls: ['./multi-panels.component.css']
})

export class MultiPanelsComponent implements OnInit {
  Items: Array<CateItem>
  SelectedItem: CateItem
  private Config: MultiPanelsConfig
  constructor() { }
  Init(config: MultiPanelsConfig) {
    this.Config = config;
  }
  ngOnInit() {
    this.Items = this.Config.items;
  }
  Select(item: CateItem) {
    if (this.SelectedItem == item) {
      this.SelectedItem = undefined;
    } else
      this.SelectedItem = item;
  }
}
