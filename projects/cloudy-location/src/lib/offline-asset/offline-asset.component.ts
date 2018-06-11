import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';


@Component({
  selector: 'cl-offline-asset',
  templateUrl: './offline-asset.component.html',
  styleUrls: ['./offline-asset.component.css']
})
export class OfflineAssetComponent implements OnInit {
  public displayedColumns = ['id', 'type', 'name', 'last-online-time']
  public Data: { dataSource: Array<{ Uid: string, Type: string, Title: string, LastTime: string }> }
  constructor(public ModalRef: MatDialogRef<OfflineAssetComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.Data = data;
  }

  ngOnInit() {
  }

}
