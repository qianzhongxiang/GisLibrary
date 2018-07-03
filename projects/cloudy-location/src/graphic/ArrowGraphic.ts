import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { Geometries } from "./geometries";
import { Materials } from "./materials";

export class ArrowGraphic extends Graphic implements IGraphic {
    public constructor(color: string = "blue") {
        super();
        this.Options.color = color;
    }
    public GetGeom(position: [number, number], type: string = 'arrow'): ol.Feature {
        return super.GetGeom(position, type);
    }

    public Style(): ol.style.Style[] {
        this.Options.content = '\uf176';
        return Materials.GetFontIcon(this.Options);
    }
}