import { IStyleOptions } from './Graphic';

import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
export abstract class BaseMaterial {
    public static GetPointMaterial(options: IStyleOptions): ol.style.Style[] {
        let img = this.GetCircleImage(options.color)
        let res = new Style({
            image: img,
            text: new Text({
                offsetY: -12,
                fill: new Fill({ color: options.color }),
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth }),
                font: options.font,
            })
        });
        if (options.title) res.getText().setText(options.title);
        return [res];
    }
    public static GetCircleImage(color: string = 'gray', radius: number = 5): ol.style.Circle {
        return new Circle({
            radius: radius,
            snapToPixel: false,
            fill: new Fill({ color: color }),
            stroke: new Stroke({
                color: 'white', width: 2
            })
        });
    }
    /**
     * require awesome front
     * @param color 
     * @param roation 
     * @param title 
     */
    public static GetArrowMaterial(options: IStyleOptions): ol.style.Style[] {
        var iconFont = 'FontAwesome';
        var iconFontText = "\uf176"; // equates to fa-trash icon
        var iconSize = options.iconSize || 22;
        let arrow = new Style({
            text: new Text({
                font: 'Normal ' + iconSize + 'px ' + iconFont,
                text: iconFontText,
                fill: new Fill({ color: options.color }),
                rotation: options.rotation,
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth })
            })
        });
        let text = new Style({
            text: new Text({
                offsetY: -18,
                fill: new Fill({ color: options.color }),
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth }),
                font: options.font,
            })
        });
        if (options.title) text.getText().setText(options.title);
        return [arrow, text];
    }
    /**
     * 
     * @param iconFontText likes '\uf041'; // equates to fa-trash icon
     * @param options 
     */
    public static GetNomalIconMaterial(options: IStyleOptions): ol.style.Style[] {
        var iconFont = 'FontAwesome';
        var iconFontText = options.iconFont; // equates to fa-trash icon
        var iconSize = options.iconSize;
        let arrow = new Style({
            text: new Text({
                font: 'Normal ' + iconSize + 'px ' + iconFont,
                text: iconFontText,
                fill: new Fill({ color: options.color }),
                rotation: options.rotation,
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth })
            })
        });
        let text = new Style({
            text: new Text({
                offsetY: -18,
                fill: new Fill({ color: options.color }),
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth }),
                font: options.font,
            })
        });
        if (options.title) text.getText().setText(options.title);
        return [arrow, text];
    }
}