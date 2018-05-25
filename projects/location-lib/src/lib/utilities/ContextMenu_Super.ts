import olContext from 'ol-contextmenu'
// const css = require('ol-contextmenu/dist/ol-contextmenu.min.css')
export interface ContextMenuItem {
    text: string
    icon?: string
    classname?: string
    callback: () => void
    items?: Array<ContextMenuItem>
}
export interface ContextMenuOptions {
    items: Array<ContextMenuItem>
    width?: number
    onOpen?: (evt: { pixel }) => void
    onOpening?: (evt: { pixel }) => void
    onClose?: (evt: { pixel }) => void
}
export class ContextMenu_Super {
    private OlContext: {
        close: () => void, open: () => void, pop: () => void, push: (t: ContextMenuItem) => void, isOpen: () => boolean
        , disable: () => void, disabled: boolean, clear: () => void, enable: () => void, extent: (t) => void
    }
    constructor(options: ContextMenuOptions) {
        this.OlContext = new olContext(options) as any;
    }
    public SetMap(map: ol.Map) {
        map.addControl(this.OlContext as any);
    }
    public Push(item: ContextMenuItem) {
        this.OlContext.push(item)
    }
    public Pop() {
        this.OlContext.pop();
    }
    public Open() {
        this.OlContext.open();
    }
    public Close() {
        this.OlContext.close();
    }
    public Disable() {
        this.OlContext.disable();
    }
    public IsOpen(): boolean {
        return this.OlContext.isOpen();
    }
}


