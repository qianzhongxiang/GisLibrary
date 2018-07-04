import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { Geometries } from "./geometries";
import { Materials } from "./materials";

export class TextGraphic extends Graphic implements IGraphic {
    public constructor() {
        super();
        this.Options.color = "blue";
    }

    public Style(): ol.style.Style[] {
        this.Options.offsetY = -16;
        return [...super.Style(), ...Materials.GetText(this.Options)];
    }
}