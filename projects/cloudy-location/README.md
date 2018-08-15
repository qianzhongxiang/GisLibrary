# Cloudy-location

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.
## Migration
### 0.0.2=>0.0.3:
### 0.1.1=>0.1.2:
fill out asset configuration likes
``` 
ConfigurationService.AssetConfig=AssetConfig
```
AssetConfig
``` ts
export interface AssetConfig {
    assetProfileUrl: string
    /**
     * 正序，目前不支持使用排序方法
     */
    sort?: boolean
}
```

## Options
### Custom Resolutions
``` ts
//在geoserver中 设定自定gridset
//以下两个选项是必须的
resolutions:number[]
extent:[number,number,number,number]//可以从geoserver中获取
```

## Style Components
### `graphic --base class`
properties：
protected Options --对于继承的类 需要自定义options

`methods:`

public AssignOption(options: IStyleOptions): IStyleOptions

public Style(): ol.style.Style[]  --可重载（需要返回super.Style()） 通过 Material 去生成

`默认提供：`

BaseGraphic extends Graphic

TextGraphic extends Graphic

ArrowGraphic extends Graphic

FontIconGraphic extends Graphic


### `Decorator --base class  extend graphic`

`methods:`

protected Decorate(style: ol.style.Style, styleType: StyleType, styleName: string): ol.style.Style //默认对所有文字、点使用同样颜色 可被重载


`默认提供：`

RepairingDecorator extends Decorator

HighlightDecorator extends Decorator

OfflineDecorator extends Decorator 


### `Materials --base class`
static GetPoint(options: IStyleOptions): ol.style.Style[]

static GetCircle(options: IStyleOptions, radius: number = 8): ol.style.Style[] 

/*
*source 可以是source url
*/
static GetIconImg(options: IStyleOptions, source: HTMLImageElement | HTMLCanvasElement | string, type: "img" | "src" = "src", size?: [number, number]): ol.style.Style[]

static GetFontIcon(options: IStyleOptions): ol.style.Style[]

static GetText(options?: IStyleOptions): ol.style.Style[]

### Example customText
``` ts
let TextOffsetY=-8
class customText extends TextGraphic {
    public constructor() {
        super();
        this.Options.offsetX = 0
        this.Options.offsetY = TextOffsetY
        this.Options.zIndex = 999;
        this.Options.font = "400 .8rem 微软雅黑,宋体 "
    }
    public Style() {
        this.Options.offsetY = TextOffsetY * times
        let ss = super.Style();
        return ss;
    }
}
let textGraphy = new customText();
export class SpeedMeterGraphic extends Graphic {
    private img: HTMLImageElement
    private arrowSVG = `<svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg" class="svg-inline--fa fa-location-arrow fa-w-16">
    <polygon transform="rotate(180 13.999999999999998,18) " id="svg_1" points="0 0,14 36,28 0,14 10" fill="{{svgColor}}"/>
  </svg>`
    public constructor() {
        super();
        this.Options.color = "#00FF00";
        this.Add(textGraphy);
    }
    public SetRotation(number: number) {
        this.Options.rotation = number;
    }
    public GetGeom(position: [number, number], type: string = 'speed'): ol.Feature {
        return super.GetGeom(position, type);
    }

    public Style(): ol.style.Style[] {
        return [...super.Style(), ...Materials.GetIconImg(this.Options, 'data:image/svg+xml,' + escape(this.arrowSVG.replace("{{svgColor}}", this.Options.color)))];
    }
}
class CameraGraphic extends ScaleableGraphic {
    protected OriginScale: number = .75;
    public constructor() {
        super();
        this.Options.color = "white";
        this.Options.scale = this.OriginScale;
        this.Add(textGraphy)
    }
    public GetGeom(position: [number, number], type: string = 'camera'): ol.Feature {
        return super.GetGeom(position, type);
    }

    public Style(): ol.style.Style[] {
        return [...super.Style(), ...Materials.GetIconImg(this.Options, environment.camera)];
    }
}
class CustomOfflineDecorator extends Decorator {
    private h = -6;
    private w = -16;
    private s = 46;
    private size = 15;
    constructor() {
        super();
        this.Options.color = "white"
        this.Options.offsetX = this.w;
        this.Options.offsetY = this.h;
    }
    Decorate(style: ol.style.Style, type: StyleType, name: string) {
        return style
    }
    private svg = `<svg width="{{size}}" height="{{size}}" viewBox="0 0 15 15"  xmlns="http://www.w3.org/2000/svg" class="svg-inline--fa fa-location-arrow fa-w-16">
    <polygon points="0 15,7.5 0,15 15" fill="red" stroke="black" stroke-width="2" />
    <line x1="7.5" y1="4" x2="7.5" y2="12" stroke="yellow" stroke-width="2" />
   </svg>`
    public Style() {
        let ss = this.s * times;
        let ssize = this.size * times;
        this.Options.offsetX = this.w * times;
        this.Options.offsetY = this.h * times;
        return [...super.Style(), ...Materials.GetIconImg(this.Options, `data:image/svg+xml,${escape(this.svg.replace('{{size}}', ssize.toString()))}`, "src", [ss, ss])]
    }
}
/**重载Decorator */
class CustomBaseDecorator extends Decorator {
    static Zoom: number = 0
    Decorate(style: ol.style.Style, type: StyleType, name: string) {
        switch (name) {
            case "title":
                let t = style.getText();
                t.getFill().setColor("white");
                t.setText(this.Options.content)
                break;
            default:
                break;
        }
        return style
    }
    //those styles in this project can not be modified
    Style() {
        let graphy = this.Children[0] as Graphic
        //dependent on zoom level
        // let times = CustomBaseDecorator.Zoom == 0 ? 0.5 : (CustomBaseDecorator.Zoom == 1 ? 0.7 : 1)
        let options: IStyleOptions = {} //scale: times
        if (graphy instanceof SpeedMeterGraphic || graphy instanceof VisibilityMeterGraphic) {
            options.color = this.Options.color
        }
        graphy.AssignOption(options)
        return super.Style();
    }
}
export default function InitGraphics(dev: DeviceService) {
    dev.AddGraphic(SpeedMeterGraphic, 'SpeedMeter');
    dev.AddGraphic(CameraGraphic, 'Camera');
     dev.AddGraphic(CustomOfflineDecorator, 'offline');
    dev.AddGraphic(CustomBaseDecorator, 'decorator');
}
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
