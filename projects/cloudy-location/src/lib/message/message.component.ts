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
      item.AssetName = this.AssetService.Get(item.Uid, item.DevType).Title;
      return this.MessageService.MsgFormat(item.Title, item.AssetName)
    }
    )
  }
  constructor(private AssetService: AssetService, public MessageService: MessageService) { }

  ngOnInit() {

  }


}
