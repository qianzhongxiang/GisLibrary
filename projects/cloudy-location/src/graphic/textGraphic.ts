import { Graphic, IGraphic } from './graphics';
import { Materials } from './materials';

export class TextGraphic extends Graphic implements IGraphic {
    public constructor() {
        super();
        this.Options.color = 'white';
        this.Options.strokeColor = 'black';
        this.Options.offsetY = -16;
    }

    public Style(): ol.style.Style[] {
        return [...super.Style(), ...Materials.GetText(this.Options)];
    }
}
