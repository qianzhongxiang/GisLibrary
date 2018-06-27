import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'cl-offline-asset',
  templateUrl: './offline-asset.component.html',
  styleUrls: ['./offline-asset.component.css']
})
export class OfflineAssetComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
  }
  public displayedColumns = ['id', 'category', 'name', 'last-online-time']
  public Data: { dataSource: Array<{ Uid: string, Type: string, Title: string, LastTime: string }> }
  constructor(public ModalRef: MatDialogRef<OfflineAssetComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.Data = data;
  }

  ngOnInit() {
  }

}
