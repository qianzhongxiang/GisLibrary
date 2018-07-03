import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { Geometries } from "./geometries";
import { Materials } from "./materials";

export class TitleGraphic extends Graphic implements IGraphic {
    public constructor(color: string = "blue") {
        super();
        this.Options.color = color;
    }

    public Style(): ol.style.Style[] {
        this.Options.offsetY = -16;
        return Materials.GetText(this.Options);
    }
}