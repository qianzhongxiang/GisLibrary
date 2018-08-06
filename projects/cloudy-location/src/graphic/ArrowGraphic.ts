import { Graphic, IGraphic, IStyleOptions } from "./graphics";
import { Geometries } from "./geometries";
import { Materials } from "./materials";

export class ArrowGraphic extends Graphic implements IGraphic {
    public constructor() {
        super();
        this.Options.color = "blue";
    }
    public GetGeom(position: [number, number], type: string = 'arrow'): ol.Feature {
        return super.GetGeom(position, type);
    }

    public Style(): ol.style.Style[] {
        this.Options.content = '\uf176';
        return [...super.Style(), ...Materials.GetFontIcon(this.Options)];
    }
}