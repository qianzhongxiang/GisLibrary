import { LogHelper } from 'vincijs';
import { MessageService } from './message.service';
import { WarningEntity } from './../../utilities/entities';
import { AssetService } from './../asset-service/asset.service';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

@Component({
  selector: 'cl-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    this.MessageService.Run(item => {
      try {
        // let i = this.AssetService.Get(item.Task_Assets.UniqueidGPSTerminal, d.Task_Assets.TerminalType.Description)
        // this.Msgs.push({ msg: `${d.WarningType.Name}:${i.Title}--${new Date().toLocaleTimeString()}`, data: d })
      }
      catch (e) {
        LogHelper.Log(e);
      }
      return true;
    })
  }
  constructor(private AssetService: AssetService, public MessageService: MessageService) { }

  ngOnInit() {

  }


}
