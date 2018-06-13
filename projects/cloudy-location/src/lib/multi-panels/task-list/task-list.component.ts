// import { ObserverMsg } from 'vincijs/dist/scripts/Patterns/Observerable';
// import { VinciInput, DataSource, Ajax } from 'vincijs';
// import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
// import { environment } from '../../../environments/environment';
// import { AppConfigService } from '../../app-config.service';
// import { OlMapService, DeviceService } from 'cloudy-location';
// interface TaskEntity {
//   Name: string
//   Assets: Array<{ Type: string, UId: string }>
// }
// interface Parameter {
//   Route: string
//   Points: Array<{ X: number, Y: number }>
// }
// @Component({
//   selector: 'app-task-list',
//   templateUrl: './task-list.component.html',
//   styleUrls: ['./task-list.component.css'],
//   styles: ['tbody {background-color: #f1f4f6;}']
// })
// export class TaskListComponent implements OnInit, AfterViewInit {
//   private VinciInput: VinciInput<{}>
//   private DataLoaded: boolean = false;
//   @ViewChild("div", { read: ElementRef }) Container: ElementRef
//   constructor(private OlMapService: OlMapService, private DeviceService: DeviceService, private appConfigService: AppConfigService) { }
//   ngAfterViewInit(): void {
//     if (this.DataLoaded) {
//       // this.VinciInput.Read()
//     }
//     this.VinciInput.SetDataSource(new DataSource({
//       Read: (p) => {
//         new Ajax({ url: this.appConfigService.Data.multiPanelConfiguration.taskListSource.url }).done(d => {
//           if (!d) return;
//           p.Success(environment.responseData(d))
//         })
//       }
//     }))
//     this.DataLoaded = true;
//   }
//   ngOnInit() {
//     let c = this.Container.nativeElement as HTMLDivElement;
//     let input = document.createElement("input");
//     let list = document.createElement("div");
//     list.style.height = "calc(100% - 40px)";
//     input.classList.add("form-control-sm");
//     // container.classList.add("");
//     c.appendChild(input);
//     c.appendChild(list);
//     this.VinciInput = new VinciInput(input, {
//       Type: "text", AutoParameters: {
//         TextField: "Name", ValueField: "Name",
//         ItemsArea: list, DataSource: new DataSource({ Data: [] }),
//         Columns: [{ field: "Name", title: "名称" }]
//       }
//     });
//     this.VinciInput.Bind(this.VinciInput.Events.Change, this.SearchChange.bind(this))
//     let t: HTMLTableElement = list.querySelector("table");
//     t.style.margin = "0";
//     let tb: HTMLTableSectionElement = t.querySelector("tbody");
//     tb.style.height = "calc(100% - 35px)";
//   }
//   private SearchChange(e: ObserverMsg) {
//     this.OlMapService.GetVectorLayer('route').getSource().clear();
//     this.OlMapService.GetVectorLayer('range').getSource().clear();
//     let sender = e.Sender as VinciInput<any>,
//       task: TaskEntity = sender.GetCurrentItems()[0]
//     if (!task) return;
//     task.Assets.forEach(i => {
//       let l = `${i.Type}_${i.UId}`.toLowerCase();
//       let component = this.DeviceService.Find(o => `${o.type}_${o.Id}`.toLowerCase() == l)[0];
//       if (component) {
//         // this.OlMapService.Focus(this.DeviceService.GetPosition(component.Id));
//         new Ajax({ url: "/TK/GetTaskLocationInfor", async: false, data: { uid: component.Id, type: component.type }, contentType: "json" }).done(d => {
//           if (d.IsSuccess && d.Data) {
//             let p: Parameter = d.Data;
//             this.OlMapService.DrawRange(p.Points);
//             this.OlMapService.DrawRoute(p.Route);
//           }
//         });
//         // this.sceneM.Render();
//       }
//     })

//   }
// }
