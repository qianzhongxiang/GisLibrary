import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";

export class NormalIconGraphic extends Graphic implements IGraphic {
    public constructor(private iconText: string, color: string = "blue", private iconSize: number = 18) {
        super();
        this.Color = color
        this.TypeCode = 2;
        let scale = 16;
        this.Long = 1;
        this.Height = 1;
        this.Width = 1;
    }
    public Buid(position: [number, number], type: string = 'Icon'): ol.Feature {
        return super.Buid(position, type);
    }
    public GetStyle(options?: IStyleOptions): ol.style.Style[] {
        options.iconFont = this.iconText;
        options.iconSize = this.iconSize;
        return super.Style('icon', options);
    }
}