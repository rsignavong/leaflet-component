interface LayerObserver {
    layer: any;
    observer: any;
}
export declare class LeafletMarker {
    lmap: any;
    dmarker: any;
    observer: any;
    children: WeakMap<any, LayerObserver>;
    el: HTMLElement;
    tileLayer: string;
    mapId: string;
    className: string;
    iconUrl: string;
    iconHeight: number;
    iconWidth: number;
    latitude: number;
    longitude: number;
    scale: number;
    showScale: boolean;
    showDefaultMarker: boolean;
    defaultPopup: string;
    componentDidLoad(): void;
    disconnectedCallback(): void;
    defaultPopupHandler(newValue: string, _oldValue: string): void;
    iconHeightHandler(newValue: number, _oldValue: number): void;
    iconUrlHandler(newValue: string, _oldValue: string): void;
    iconWidthHandler(newValue: number, _oldValue: number): void;
    latitudeHandler(newValue: number, _oldValue: number): void;
    longitudeHandler(newValue: number, _oldValue: number): void;
    scaleHandler(newValue: number, _oldValue: number): void;
    childrenObserver(mutationsList: Array<any>): void;
    attributesObserver(el: any, mutationsList: Array<any>): void;
    removeChildren(nodes: Array<any>): void;
    setChildren(): void;
    setDefaultIcon(): void;
    setDefaultMarker(): void;
    setScale(): void;
    setTileLayer(): void;
    setView(): void;
    updateDefaultMarker(): void;
    updateDefaultPopup(): void;
}
export {};
