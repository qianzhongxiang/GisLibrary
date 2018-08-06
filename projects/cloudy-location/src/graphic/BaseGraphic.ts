import { Graphic, IGraphic, IStyleOptions } from "./graphics";
import { Geometries } from "./geometries";
import { Materials } from "./materials";


export class BaseGraphic extends Graphic implements IGraphic {

    public constructor() {
        super();
        this.Options.color = "blue";
    }

    public Style(): ol.style.Style[] {
        return [...super.Style(), ...Materials.GetPoint(this.Options)];
    }

}