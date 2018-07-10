import { MultiPanelsItemComponent } from './multi-panels-item/multi-panels-item.component';
import { ICate } from './../../utilities/entities';
import { Component, OnInit, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';

@Component({
    selector: 'cl-multi-panels',
    templateUrl: './multi-panels.component.html',
    styleUrls: ['./multi-panels.component.css']
})

export class MultiPanelsComponent implements OnInit, AfterContentInit {
    ngAfterContentInit(): void {
        // this.Items = this.panels.map(p => { return { iconClass: p.iconClass, title: p.title, code: p.code } })
    }
    // Items: Array<ICate>
    @ContentChildren(MultiPanelsItemComponent)
    public panels: QueryList<MultiPanelsItemComponent>

    @Input("selected-index")
    public SelectedIndex: number

    public SelectedItem: MultiPanelsItemComponent
    constructor() {

    }

    ngOnInit() {
        if (!Number.isNaN(this.SelectedIndex)) {
            this.SelectedItem = this.panels[this.SelectedIndex];
        }
    }

    Select(item: MultiPanelsItemComponent) {
        if (this.SelectedItem == item) {
            this.SelectedItem = undefined;
        } else
            this.SelectedItem = item;
        this.SetShow();
    }
    private SetShow() {
        this.panels.forEach(p => p.show = false);
        if (this.SelectedItem) this.SelectedItem.show = true;
    }
}
