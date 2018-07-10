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
    fontIcon,
    circle
}


export abstract class Materials {
    public static GetPoint(options: IStyleOptions): ol.style.Style[] {
        let img = this.GetCircleImage(options)
        let res = new Style({
            image: img,
            zIndex: options.zIndex
        });
        res[STYLETYPE] = StyleType.point;
        return [res];
    }
    public static GetCircle(options: IStyleOptions, radius: number = 8): ol.style.Style[] {
        let img = this.GetCircleImage(options, radius)
        let res = new Style({
            image: img,
            zIndex: options.zIndex
        });
        res[STYLETYPE] = StyleType.circle;
        return [res];
    }

    public static GetCircleImage(options: IStyleOptions, radius: number = 5): ol.style.Circle {
        options = Object.assign({
            strokeWidth: 2,
            strokeColor: 'white',
            color: 'blue'
        }, options)
        return new Circle({
            radius: radius,
            fill: new Fill({ color: options.color }),
            stroke: new Stroke({
                color: options.strokeColor, width: options.strokeWidth
            })
        });
    }
    public static GetIconImg(options: IStyleOptions, source: HTMLImageElement | HTMLCanvasElement | string, type: "img" | "src" = "src", size?: [number, number]): ol.style.Style[] {
        let icon: ol.style.Icon
        if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) type = "img";
        switch (type) {
            case "src":
                icon = new Icon({
                    src: source as string,
                    color: options.color,
                    size: size,
                    scale: options.scale,
                    rotation: options.rotation,
                    offset: [options.offsetX || 0, options.offsetY || 0]
                })
                break;
            case "img":
                icon = new Icon({
                    img: source as (HTMLImageElement | HTMLCanvasElement),
                    color: options.color,
                    imgSize: size || [26, 26],
                    scale: options.scale,
                    rotation: options.rotation,
                    offset: [options.offsetX || 0, options.offsetY || 0]
                })
                break;
            default:
                break;
        }
        let res = new Style({
            image: icon,
            zIndex: options.zIndex
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
            }),
            zIndex: options.zIndex
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
            }),
            zIndex: options.zIndex
        })
        res[STYLETYPE] = StyleType.text;
        return [res];
    }
}