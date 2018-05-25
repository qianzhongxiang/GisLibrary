import { Graphic } from "./Graphic";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";

export class IncarGraphic extends Graphic {
    public constructor() {
        super();
        this.TypeCode = 2;
        let scale = 16;
        this.Long = 1;
        this.Height = 1;
        this.Width = 1;
    }
    public Buid(position: [number, number], type: string = 'incar') {
        return super.Buid(position, type);
    }
    public GetStyle(color: string = 'blue', title?: string, visable: boolean = true) {
        return super.GetStyle(color, title, visable);
    }
    public OnMoved(o3d: any, target: [number, number]) {
        super.OnMoved(o3d, target)
    }
}