
import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
export abstract class BaseMaterial {
    public static GetPointMaterial(color: string = 'black', title?: string) {
        let res = new Style({
            image: new Circle({
                radius: 5,
                snapToPixel: false,
                fill: new Fill({ color: color }),
                stroke: new Stroke({
                    color: 'white', width: 2
                })
            }), text: new Text({
                offsetY: -12,
                fill: new Fill({ color: color }),
                stroke: new Stroke({ color: "white", width: 3 }),
                font: "Normal 14px Arial",
            })
        });
        if (title) res.getText().setText(title);
        return res;
    }
}