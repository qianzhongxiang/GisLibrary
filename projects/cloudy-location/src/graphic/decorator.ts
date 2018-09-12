import { Graphic, IGraphic, IStyleOptions } from "./graphics";
import { Materials, StyleType, STYLETYPE } from "./materials";
export const STYLENAME = "styleName"

export class Decorator extends Graphic implements IGraphic {
    public SetOptions(options: IStyleOptions) {
        this.Options = options;
    }
    protected Decorate(style: ol.style.Style, styleType: StyleType, _styleName: string): ol.style.Style {
        switch (styleType) {
            case StyleType.text:
                let t = style.getText();
                t.getFill().setColor(this.Options.color);
                t.setText(this.Options.content)
                break;
            case StyleType.fontIcon:

                break;
            case StyleType.iconImg:

                break;
            case StyleType.point:
                style.setImage(Materials.GetCircleImage(this.Options));
                break;
            case StyleType.circle:
                break;
            default: {

            }
                break;
        }
        return style;
    }
    public Style(): ol.style.Style[] {
        let styles = super.Style();
        styles.forEach(s => this.Decorate(s, s[STYLETYPE] as any, s[STYLENAME]))
        return styles;
    }
}
