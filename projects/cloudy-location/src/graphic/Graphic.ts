import { Composit, Singleton, LogHelper } from "vincijs";
import { BaseGeometry } from "./BaseGeometry";
import { BaseMaterial } from "./BaseMaterial";
// import { Tracker } from "../scene/Tracker";

export abstract class Graphic extends Composit {
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
    public GetStyle(color?: string, title?: string, visable: boolean = true): ol.style.Style {
        if (!visable || !this.Visable) return null;
        return BaseMaterial.GetPointMaterial(color, title);
    }
    public OnMoved(o3d: any, target: [number, number]) {

    }
    public ToString(data: any): string {
        return this.Graphic ? this.Graphic.name : undefined;
    }
}
export interface IGraphicFactory {
    GetComponent(name: string): Graphic
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
    GetComponent(name: string): Graphic {
        if (!name || !this.Types[name]) name = "base";
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
    Graphic: Graphic
    Id: string
    Parent: Graphic
    Title?: string
    type: string
    // Path?: Tracker
    PArray?: Array<{ x: number, y: number, dur: number, time: string }>
    AllPs?: Array<{ x: number, y: number, dur: number, time: string }>
    Duration?: number
    Color?: string
    Visable?: boolean
    Offline?: boolean
}
/**
 * this is a function to get GraphicFactory with "singleton" parton
 */
export let GetGraphicFactory: () => IGraphicFactory = Singleton(GraphicFactory, true);
