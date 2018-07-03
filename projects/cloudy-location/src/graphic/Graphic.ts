import { Composit, Singleton, LogHelper, IComposit } from "vincijs";
import { Geometries } from "./geometries";
import { Materials, StyleType, STYLETYPE } from "./materials";

export interface IStyleOptions {
    color?: string
    content?: string
    /**
     * by default, true
     */
    visable?: boolean
    rotation?: number
    zIndex?: number
    font?: string
    strokeWidth?: number
    strokeColor?: string
    size?: number
    offsetX?: number
    offsetY?: number
}

export interface IGraphic extends IComposit {
    Style(): ol.style.Style[]
    GetGeom(position: [number, number], type?: string): ol.Feature
}

export abstract class Graphic extends Composit implements IGraphic {
    public Visable: boolean = true;
    public Events = { OnLoaded: "onloaded" }
    protected Graphic: any;
    public Loaded = false
    // constructor(...composits: IGraphic[]) {
    //     super();
    //     if (composits)
    //         composits.forEach(c => this.Add(c));
    // }
    protected Options: IStyleOptions = {
        visable: true, color: "blue",
        rotation: 0, font: "Bold 16px Arial",
        strokeWidth: 3, strokeColor: "white"
    }
    // public Parent(): any {
    //     alert("共享部件没有显示指定父部件");
    // }
    public GetGeom(position: [number, number], type?: string): ol.Feature {
        return Geometries.GetPoint(position, type);
    }
    protected AssignOption(options?: IStyleOptions): IStyleOptions {
        return Object.assign({}, this.Options, options)
    }
    public Style(): ol.style.Style[] {
        if (!this.Children || this.Children.length <= 0) return null;
        if (!this.Options.visable || !this.Visable) return null;

        let res: ol.style.Style[] = []
        this.Children.forEach((c: IGraphic) => {
            res.push(...c.Style())
        })
        return res;
    }

    public ToString(data: any): string {
        return this.Graphic ? this.Graphic.name : undefined;
    }
}
export interface IGraphicFactory {
    GetComponent(name: string): IGraphic
    SetComponent(type: typeof Graphic, name?: string): void
}
class GraphicFactory implements IGraphicFactory {
    private Types = {}
    private Pool = {}
    SetComponent(type: typeof Graphic, name?: string): void {
        name = name || type.name.substr(0, name.length - 7);
        this.Types[name.toLowerCase()] = type; // <ie9 will dosen't work
    }
    /**
     * gain conincident Component 
     * @param name  such as "Map" not "MapGraphic"
     */
    GetComponent(name: string): IGraphic {
        if (!name) name = "base";
        name = name.toLowerCase();
        return this.Pool[name] || (this.Pool[name] = new (this.Types[name] || this.Types["base"])())
    }
}

export interface GraphicOutInfo {
    /**
     * Id_type
     */
    UniqueKey?: string
    Location: { x: number, y: number }
    Time?: Date | string
    ReveiveTime: Date
    Graphic: IGraphic
    Id: string
    Parent: IGraphic
    Title?: string
    type: string
    // Path?: Tracker
    PArray?: Array<{ x: number, y: number, dur: number, time: string }>
    AllPs?: Array<{ x: number, y: number, dur: number, time: string }>
    Duration?: number
    Color?: string
    Visable?: boolean
    Offline?: boolean
    Direction?: number
}
/**
 * this is a function to get GraphicFactory with "singleton" parton
 */
export let GetGraphicFactory: () => IGraphicFactory = Singleton(GraphicFactory, true);
