import { Composit, Singleton, LogHelper, IComposit } from "vincijs";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";

export interface IStyleOptions {
    color?: string
    title?: string
    /**
     * by default, true
     */
    visable?: boolean
    rotation?: number
    zIndex?: number
    font?: string
    strokeWidth?: number
    strokeColor?: string
    iconSize?: number
    iconFont?: string
}
export interface IGraphic extends IComposit {
    GetStyle(options: IStyleOptions): ol.style.Style[]
    Buid(position: [number, number], type?: string): ol.Feature
}

export abstract class Graphic extends Composit {
    protected Color: string = "gray"
    public Visable: boolean = true;
    public TypeCode: number = 0
    public Events = { OnLoaded: "onloaded" }
    /**m outter*/
    public Long: number = 0
    /**m outter*/
    public Width: number = 0
    /**m outter*/
    public Height: number = 0
    protected Graphic: any;
    public Loaded = false
    // public Parent(): any {
    //     alert("共享部件没有显示指定父部件");
    // }
    /**
     * clone graphic and show it on scene
     */
    public Buid(position: [number, number], type?: string): ol.Feature {  //TODO 当前还未使用绝对坐标体系
        return BaseGeometry.GetPoint(position, type);
    }
    protected Style(type: "icon" | "arrow" | "circle" = 'circle', options?: IStyleOptions): ol.style.Style[] {
        options = Object.assign({
            visable: true, color: this.Color,
            rotation: 0, font: "Normal 16px Arial bold",
            strokeWidth: 3, strokeColor: "white"
        }, options)
        if (!options.visable || !this.Visable) return null;
        switch (type) {
            case "arrow":
                return BaseMaterial.GetArrowMaterial(options);
            case "icon":
                return BaseMaterial.GetNomalIconMaterial(options)
            case "circle":
            default:
                return BaseMaterial.GetPointMaterial(options);
        }
    }

    public OnMoved(o3d: any, target: [number, number]) {

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
