// import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// import { VinciInput, DataSource, Ajax } from "vincijs";
// import { ObserverMsg } from 'vincijs/dist/scripts/Patterns/Observerable';
// import { AssetService, OlMapService, DeviceService } from 'cloudy-location';
// interface Parameter {
//   Route: string
//   Points: Array<{ X: number, Y: number }>
// }
// @Component({
//   selector: 'app-device-list',
//   templateUrl: './device-list.component.html',
//   styleUrls: ['./device-list.component.css']
// })
// export class DeviceListComponent implements OnInit, AfterViewInit {
//   @ViewChild("div", { read: ElementRef }) Container: ElementRef
//   private VinciInput: VinciInput<any>
//   constructor(private AssetService: AssetService, private OlMapService: OlMapService, private DeviceService: DeviceService) {
//   }
//   ngAfterViewInit(): void {
//     this.VinciInput.SetDataSource(new DataSource({ Data: this.AssetService.GetAssets() }));
//   }
//   ngOnInit() {
//     let c = this.Container.nativeElement as HTMLDivElement;
//     let input = document.createElement("input");
//     let list = document.createElement("div");
//     list.style.height = "calc(100% - 40px)";
//     input.classList.add("form-control-sm")
//     // container.classList.add("");
//     c.appendChild(input);
//     c.appendChild(list);
//     this.VinciInput = new VinciInput(input, {
//       Type: "text", AutoParameters: {
//         TextField: "Title", ValueField: "Id_Type",
//         ItemsArea: list, DataSource: new DataSource({ Data: [] }),
//         Columns: [{ field: "Title", title: "名称" }, { title: "类型", field: "Type" }]
//       }
//     })
//     this.VinciInput.Bind(this.VinciInput.Events.Change, this.SearchChange.bind(this));

//     let t: HTMLTableElement = list.querySelector("table");
//     t.style.margin = "0";
//     let tb: HTMLTableSectionElement = t.querySelector("tbody");
//     tb.style.height = "calc(100% - 35px)";
//   }
//   /**
//  * 不会更改类型
//  * @param obj 
//  */

//   private SearchChange(e: ObserverMsg) {
//     this.OlMapService.GetVectorLayer('route').getSource().clear();
//     this.OlMapService.GetVectorLayer('range').getSource().clear();
//     let component = this.DeviceService.Find(o => `${o.Id}_${o.type}`.toLowerCase() == (e.Value as string))[0];
//     if (component) {
//       this.DeviceService.HighLight(component);
//       this.OlMapService.Focus(this.DeviceService.GetPosition(component.Id));
//       new Ajax({ url: "/TK/GetTaskLocationInfor", data: { uid: component.Id, type: component.type }, contentType: "json" }).done(d => {
//         if (d.IsSuccess && d.Data) {
//           let p: Parameter = d.Data;
//           this.OlMapService.DrawRange(p.Points);
//           this.OlMapService.DrawRoute(p.Route);
//         }
//       });
//       // this.sceneM.Render();
//     }
//   }
// }
