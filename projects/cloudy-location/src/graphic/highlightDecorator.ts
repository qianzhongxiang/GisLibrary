import { Decorator } from "./decorator";
import { StyleType } from "./materials";

export class HighlightDecorator extends Decorator {
    protected Decorate(style: ol.style.Style, styleType: StyleType, styleName: string): ol.style.Style {
        style = super.Decorate(style, styleType, styleName);
        style.setZIndex(99)
        switch (styleType) {
            case StyleType.text:
                let t = style.getText();
                t.getStroke().setColor('yellow')
                t.setFont("Normal bold 18px Arial");
                break;
            case StyleType.fontIcon:

                break;
            case StyleType.iconImg:

                break;
            case StyleType.point: {
                let c = style.getImage() as ol.style.Circle;
                let stroke = c.getStroke();
                stroke.setColor("yellow");
                stroke.setWidth(c.getStroke().getWidth() * 1.5)
            }
                break;
            default: {
                let stroke = style.getStroke();
                if (!stroke) break;
                stroke.setColor('yellow');
                stroke.setWidth(stroke.getWidth() * 1.5);
            }
                break;
        }

        return style;
    }
}