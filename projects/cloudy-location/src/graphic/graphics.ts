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
    scale?: number
}

export interface IGraphic extends IComposit {
    Style(): ol.style.Style[]
    GetGeom(position: [number, number], type?: string): ol.Feature
    AssignOption(options: IStyleOptions): IStyleOptions
}

export abstract class Graphic extends Composit implements IGraphic {
    public Events = { OnLoaded: "onloaded" }
    protected Graphic: any;
    public Loaded = false
    // constructor(...composits: IGraphic[]) {
    //     super();
    //     if (composits)
    //         composits.forEach(c => this.Add(c));
    // }
    protected Options: IStyleOptions = {
        color: "blue", rotation: 0, font: "Bold .75rem Arial",
        strokeWidth: 3, strokeColor: "white"
    }
    // public Parent(): any {
    //     alert("共享部件没有显示指定父部件");
    // }
    public GetGeom(position: [number, number], type?: string): ol.Feature {
        return Geometries.GetPoint(position, type);
    }

    public AssignOption(options: IStyleOptions): IStyleOptions {
        return Object.assign(this.Options, options)
    }
    public Style(): ol.style.Style[] {
        if (!this.Children || this.Children.length <= 0) return [];

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
    /**
     * get coincident component, ":[prop]=value" does not be supply currently.
     * @param name format:type.subtype:[prop]=value, subtype can be undefined but can not be ''
     */
    GetComponent(name: string): IGraphic
    /**
     * get coincident component, ":[prop]=value" does not be supply currently.
     * @param type 
     * @param name format:type.subtype:[prop]=value, subtype can be undefined but can not be ''
     */
    SetComponent(type: typeof Composit, name: string): void
    /**
     * whether is it existent in defaults 
     * @param name 
     */
    DefsContains(name: string): boolean
    GetDef(name: string): IGraphic
    SetDef(type: typeof Composit, name: string): void
}
class GraphicFactory implements IGraphicFactory {
    // private Types: { [key: string]: new () => Graphic } = {}
    private Tps: { [key: string]: ({ [key: string]: (new () => IGraphic) } | (new () => IGraphic)) } = {}
    private Defs: { [key: string]: new () => IGraphic } = {}
    private Pool: { [key: string]: IGraphic } = {}
    private DefPool: { [key: string]: IGraphic } = {}
    SetComponent(type: typeof Composit, name: string): void {
        // name = name || type.name.substr(0, name.length - 7);
        name = name.toLowerCase()
        let array = name.split('.');
        if (!this.Tps[array[0]]) this.Tps[array[0]] = {}
        if (array[1]) {
            this.Tps[array[0]][array[1]] = type as any
        } else {
            this.Tps[array[0]][''] = type as any
        }
        this.Pool[name] = undefined
    }
    /**
     * gain coincident Component , ":[prop]=value" does not be supply currently.
     * @param name  format:type.subtype:[prop]=value, subtype can be undefined but can not be ''
     */
    GetComponent(name: string): IGraphic {
        if (!name)
            return this.GetDef('base')
        name = name.toLowerCase();
        if (this.Pool[name])
            return this.Pool[name]
        let array = name.split(".").map(i => i.toLowerCase());
        let type: new () => IGraphic
        //!type ||(!type.subType&&!type.'') return basic graphic
        if (!this.Tps[array[0]] || (!(type = this.Tps[array[0]][array[1]]) && !(type = this.Tps[array[0]][''])))
            return this.GetDef('base')
        return this.Pool[name] = new type()
    }

    DefsContains(name: string): boolean {
        return !!this.Defs[name.toLowerCase()];
    }
    GetDef(name: string): IGraphic {
        return this.DefPool[name] ? this.DefPool[name] : (this.DefPool[name] = new this.Defs[name]() as IGraphic);
    }
    SetDef(type: typeof Composit, name: string): void {
        name = name.toLowerCase()
        this.Defs[name] = type as any;
        this.DefPool[name] = undefined
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
    Graphic?: IGraphic
    Id: string
    Parent: IGraphic
    /**
     * 楼层
     */
    Floor?: number
    Title?: string
    Type: string
    SubType?: string
    // Path?: Tracker
    PArray?: Array<{ x: number, y: number, dur: number, time: string }>
    AllPs?: Array<{ x: number, y: number, dur: number, time: string }>
    Duration?: number
    Color?: string
    Visable?: boolean
    Offline?: boolean
    Direction?: number
    Repairing?: boolean
}
/**
 * this is a function to get GraphicFactory with "singleton" parton
 */
export let GetGraphicFactory: () => IGraphicFactory = Singleton(GraphicFactory, true);
