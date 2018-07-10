import { Decorator } from "./decorator";
import { StyleType, Materials } from "./materials";

export class OfflineDecorator extends Decorator {
    protected Decorate(style: ol.style.Style, styleType: StyleType, styleName: string): ol.style.Style {
        // style = super.Decorate(style, styleType, styleName);
        // style.setZIndex(99)
        switch (styleType) {
            case StyleType.text:
                break;
            case StyleType.fontIcon:

                break;
            case StyleType.iconImg:

                break;
            case StyleType.point: {
                style.setImage(Materials.GetCircleImage({ color: "gray" }));
            }
                break;
            default: {
                let fill = style.getFill();
                if (!fill) break;
                fill.setColor('gray');
            }
                break;
        }

        return style;
    }
}