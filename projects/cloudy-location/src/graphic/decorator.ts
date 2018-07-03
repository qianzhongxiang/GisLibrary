import { Graphic, IGraphic, IStyleOptions } from "./Graphic";
import { Geometries } from "./geometries";
import { Materials, StyleType, STYLETYPE } from "./materials";
export const CONSTNAME = "styleName"
export class Decorator extends Graphic implements IGraphic {
    /**
     * to set text content; color; 
     * @param options 
     */
    public SetOptions(options: IStyleOptions) {
        this.Options = options;
    }
    protected Decorate(style: ol.style.Style, styleType: StyleType, styleName: string): ol.style.Style {
        switch (styleType) {
            case StyleType.text:
                let t = style.getText();
                t.getStroke().setColor(this.Options.color)
                t.setText(this.Options.content)
                break;
            case StyleType.fontIcon:

                break;
            case StyleType.iconImg:

                break;
            case StyleType.point: {
                let c = style.getImage() as ol.style.Circle;
                c.getFill().setColor(this.Options.color);
            }
                break;
            default: {

            }
                break;
        }
        return style;
    }
    public Style(): ol.style.Style[] {
        let styles = super.Style();
        styles.forEach(s => this.Decorate(s, s[STYLETYPE] as any, s[CONSTNAME]))
        return styles;
    }
}
