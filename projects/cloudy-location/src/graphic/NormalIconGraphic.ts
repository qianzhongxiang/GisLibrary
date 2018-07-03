import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";

export class NormalIconGraphic extends Graphic implements IGraphic {
    public constructor(private iconText: string, color: string = "blue", private iconSize: number = 18) {
        super();
        this.Options.color = color;
    }
    public GetGeom(position: [number, number], type: string = 'icon'): ol.Feature {
        return super.GetGeom(position, type);
    }

        public Style(): ol.style.Style[] {
        this.Options.content = this.iconText;
    this.Options.size = this.iconS ize;
return BaseMaterial.GetNomalIconMaterial(this.Options);
            
}