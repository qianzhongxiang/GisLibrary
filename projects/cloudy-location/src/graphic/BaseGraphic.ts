import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";


export class BaseGraphic extends Graphic implements IGraphic {

    public constructor(color: string = "blue") {
        super();
        this.Color = color;
        this.TypeCode = 1;
        let scale = 16;
        this.Long = 1;
        this.Height = 1;
        this.Width = 1;
    }

    public GetStyle(options?: IStyleOptions): ol.style.Style[] {
        return super.Style("circle", options);
    }

}