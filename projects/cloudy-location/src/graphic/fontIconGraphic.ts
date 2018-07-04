import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { Geometries } from "./Geometries";
import { Materials } from "./Materials";

export class FontIconGraphic extends Graphic implements IGraphic {
    public constructor() {
        super();
        this.Options.color = "blue";
        this.Options.content = "\uf1b9";//car icon
        this.Options.size = 18;
    }
    public GetGeom(position: [number, number], type: string = 'icon'): ol.Feature {
        return super.GetGeom(position, type);
    }

    public Style(): ol.style.Style[] {
        return [...super.Style(), ...Materials.GetFontIcon(this.Options)];
    }
}