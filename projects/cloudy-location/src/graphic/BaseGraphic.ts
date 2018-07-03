import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";


export class BaseGraphic extends Graphic implements IGraphic {

    public constructor(color: string = "blue") {
        super();
        this.Options.color = color;
    }

    public Style(): ol.style.Style[] {
        return BaseMaterial.GetPoint(this.Options);
    }

}