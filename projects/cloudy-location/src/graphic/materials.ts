import { IStyleOptions } from './Graphic';

import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import Icon from 'ol/style/Icon'

export const STYLETYPE = 'styleType'
export enum StyleType {
    point,
    text,
    iconImg,
    fontIcon
}


export abstract class Materials {
    public static GetPoint(options: IStyleOptions): ol.style.Style[] {
        let img = this.GetCircleImage(options.color)
        let res = new Style({
            image: img
        });
        res[STYLETYPE] = StyleType.point;
        return [res];
    }

    public static GetCircleImage(color: string = 'gray', radius: number = 5): ol.style.Circle {
        return new Circle({
            radius: radius,
            fill: new Fill({ color: color }),
            stroke: new Stroke({
                color: 'white', width: 2
            })
        });
    }
    public static GetIconImg(source: HTMLCanvasElement | string, color: string, size?: [number, number]): ol.style.Style[] {
        let icon: ol.style.Icon
        if (typeof source === 'string') {
            icon = new Icon({
                src: source,
                color: color,
                size: size
            })
        }
        else if (source instanceof HTMLCanvasElement) {
            icon = new Icon({
                img: source,
                color: color,
                imgSize: size
            })
        }
        let res = new Style({
            image: icon,
        });
        res[STYLETYPE] = StyleType.iconImg;
        return [res];
    }
    /**
        * 
        * @param iconFontText likes '\uf041'; // equates to fa-trash icon
        * @param options 
        */
    public static GetFontIcon(options: IStyleOptions): ol.style.Style[] {
        let res = new Style({
            text: new Text({
                offsetY: options.offsetY,
                offsetX: options.offsetX,
                font: 'Normal ' + options.size + 'px FontAwesome',
                text: options.font,
                fill: new Fill({ color: options.color }),
                rotation: options.rotation,
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth })
            })
        });
        res[STYLETYPE] = StyleType.fontIcon;
        return [res];
    }
    public static GetText(options?: IStyleOptions): ol.style.Style[] {
        let res = new Style({
            text: new Text({
                offsetY: options.offsetY,
                offsetX: options.offsetX,
                fill: new Fill({ color: options.color }),
                stroke: new Stroke({ color: options.strokeColor, width: options.strokeWidth }),
                font: options.font,
                text: options.content
            })
        })
        res[STYLETYPE] = StyleType.text;
        return [res];
    }
}