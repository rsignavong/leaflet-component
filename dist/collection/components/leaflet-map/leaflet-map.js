import L from 'leaflet';
export class LeafletMarker {
    constructor() {
        this.lmap = null;
        this.dmarker = null;
        this.observer = null;
        this.children = new WeakMap();
        this.tileLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        this.mapId = '';
        this.className = '';
        this.iconUrl = '';
        this.iconHeight = 32;
        this.iconWidth = 32;
        this.latitude = 51.505;
        this.longitude = -0.09;
        this.scale = 13;
    }
    componentDidLoad() {
        const target = this.mapId ? document.getElementById(this.mapId) : this.el;
        this.lmap = L.map(target);
        this.setView();
        this.setTileLayer();
        this.setScale();
        this.setChildren();
        this.setDefaultMarker();
        this.observer = new MutationObserver((mutations, _observer) => this.childrenObserver(mutations));
        this.observer.observe(target, { attributes: false, childList: true, subtree: false });
    }
    disconnectedCallback() {
        this.observer.disconnect();
    }
    defaultPopupHandler(newValue, _oldValue) {
        this.defaultPopup = newValue;
        this.setDefaultIcon();
        this.updateDefaultPopup();
    }
    iconHeightHandler(newValue, _oldValue) {
        this.iconHeight = newValue;
        this.setDefaultIcon();
    }
    iconUrlHandler(newValue, _oldValue) {
        this.iconUrl = newValue;
        this.setDefaultIcon();
    }
    iconWidthHandler(newValue, _oldValue) {
        this.iconWidth = newValue;
        this.setDefaultIcon();
    }
    latitudeHandler(newValue, _oldValue) {
        this.latitude = newValue;
        this.setView();
        this.updateDefaultMarker();
        this.updateDefaultPopup();
    }
    longitudeHandler(newValue, _oldValue) {
        this.longitude = newValue;
        this.setView();
        this.updateDefaultMarker();
        this.updateDefaultPopup();
    }
    scaleHandler(newValue, _oldValue) {
        this.scale = newValue;
        this.setView();
    }
    childrenObserver(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type !== 'childList')
                continue;
            this.removeChildren(mutation.removedNodes);
            this.setChildren();
        }
    }
    attributesObserver(el, mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type !== 'attributes')
                continue;
            if (['latitude', 'longitude'].includes(mutation.attributeName)) {
                this.children.get(el).layer.setLatLng([el.getAttribute('latitude'), el.getAttribute('longitude')]);
            }
        }
    }
    removeChildren(nodes) {
        nodes.forEach(node => {
            if (!node.nodeName.startsWith("LEAFLET-"))
                return;
            const el = this.children.get(node);
            this.lmap.removeLayer(el.layer);
            if (el.observer)
                el.observer.disconnect();
            this.children.delete(node);
        });
    }
    setChildren() {
        Array.from(this.el.children)
            .map(e => {
            if (this.children.get(e) !== undefined)
                return;
            if (e.nodeName === "LEAFLET-MARKER") {
                const observer = new MutationObserver((mutations, _observer) => this.attributesObserver(e, mutations));
                observer.observe(e, { attributes: true, childList: false, subtree: false });
                const marker = {
                    layer: L.marker([e.getAttribute('latitude'), e.getAttribute('longitude')]),
                    observer,
                };
                this.children.set(e, marker);
                marker.layer.addTo(this.lmap);
                if (e.textContent) {
                    marker.layer.bindPopup(e.textContent).openPopup();
                }
                if (e.getAttribute('icon-url')) {
                    const icon = L.icon({
                        iconUrl: e.getAttribute('icon-url'),
                        iconSize: [e.getAttribute('icon-width') || 32, e.getAttribute('icon-height') || 32]
                    });
                    marker.layer.setIcon(icon);
                }
            }
            else if (e.nodeName === "LEAFLET-CIRCLE") {
                const opts = {
                    radius: e.getAttribute('radius'),
                    stroke: e.hasAttribute('stroke'),
                    color: e.hasAttribute('color') ? e.getAttribute('color') : "#3388ff",
                    weight: e.hasAttribute('weight') ? e.getAttribute('weight') : 3,
                    opacity: e.hasAttribute('opacity') ? e.getAttribute('opacity') : 1.0,
                    lineCap: e.hasAttribute('line-cap') ? e.getAttribute('line-cap') : "round",
                    lineJoin: e.hasAttribute('line-join') ? e.getAttribute('line-join') : "round",
                    dashArray: e.hasAttribute('dash-array') ? e.getAttribute('dash-array') : null,
                    dashOffset: e.hasAttribute('dash-offset') ? e.getAttribute('dash-offset') : null,
                    fill: e.hasAttribute('fill') && e.getAttribute('fill') == "false" ? false : true,
                    fillColor: e.hasAttribute('fill-color') ? e.getAttribute('fill-color') : "#3388ff",
                    fillOpacity: e.hasAttribute('fill-opacity') ? e.getAttribute('fill-opacity') : 0.2,
                    fillRule: e.hasAttribute('fill-rule') ? e.getAttribute('fill-rule') : "evenodd",
                    bubblingMouseEvents: e.hasAttribute('bubbling-mouse-events'),
                    className: e.hasAttribute('class-name') ? e.getAttribute('class-name') : null
                };
                const circle = {
                    layer: L.circle([e.getAttribute('latitude'), e.getAttribute('longitude')], opts),
                    observer: null,
                };
                this.children.set(e, circle);
                circle.layer.addTo(this.lmap);
            }
        });
    }
    setDefaultIcon() {
        if (this.iconUrl) {
            const icon = L.icon({
                iconUrl: this.iconUrl,
                iconSize: [this.iconWidth, this.iconHeight]
            });
            this.dmarker.setIcon(icon);
        }
    }
    setDefaultMarker() {
        if (this.showDefaultMarker) {
            if (this.defaultPopup) {
                this.dmarker = L.marker([this.latitude, this.longitude])
                    .addTo(this.lmap)
                    .bindPopup(this.defaultPopup)
                    .openPopup();
            }
            else {
                this.dmarker = L.marker([this.latitude, this.longitude]).addTo(this.lmap);
            }
            this.setDefaultIcon();
        }
    }
    setScale() {
        if (this.showScale) {
            L.control.scale().addTo(this.lmap);
        }
    }
    setTileLayer() {
        L.tileLayer(this.tileLayer).addTo(this.lmap);
    }
    setView() {
        this.lmap.setView([this.latitude, this.longitude], this.scale);
    }
    updateDefaultMarker() {
        if (this.showDefaultMarker) {
            this.dmarker.setLatLng([this.latitude, this.longitude]);
        }
    }
    updateDefaultPopup() {
        console.log("update", this.showDefaultMarker, this.defaultPopup);
        if (this.showDefaultMarker && this.defaultPopup) {
            this.dmarker
                .bindPopup(this.defaultPopup, { offset: L.point(0, 6 - this.iconHeight / 2) })
                .openPopup();
        }
    }
    static get is() { return "leaflet-map"; }
    static get properties() { return {
        "className": {
            "type": String,
            "attr": "class-name"
        },
        "defaultPopup": {
            "type": String,
            "attr": "default-popup",
            "mutable": true,
            "watchCallbacks": ["defaultPopupHandler"]
        },
        "el": {
            "elementRef": true
        },
        "iconHeight": {
            "type": Number,
            "attr": "icon-height",
            "mutable": true,
            "watchCallbacks": ["iconHeightHandler"]
        },
        "iconUrl": {
            "type": String,
            "attr": "icon-url",
            "mutable": true,
            "watchCallbacks": ["iconUrlHandler"]
        },
        "iconWidth": {
            "type": Number,
            "attr": "icon-width",
            "mutable": true,
            "watchCallbacks": ["iconWidthHandler"]
        },
        "latitude": {
            "type": Number,
            "attr": "latitude",
            "mutable": true,
            "watchCallbacks": ["latitudeHandler"]
        },
        "longitude": {
            "type": Number,
            "attr": "longitude",
            "mutable": true,
            "watchCallbacks": ["longitudeHandler"]
        },
        "mapId": {
            "type": String,
            "attr": "map-id",
            "mutable": true
        },
        "scale": {
            "type": Number,
            "attr": "scale",
            "mutable": true,
            "watchCallbacks": ["scaleHandler"]
        },
        "showDefaultMarker": {
            "type": Boolean,
            "attr": "show-default-marker"
        },
        "showScale": {
            "type": Boolean,
            "attr": "show-scale"
        },
        "tileLayer": {
            "type": String,
            "attr": "tile-layer"
        }
    }; }
    static get style() { return "/**style-placeholder:leaflet-map:**/"; }
}
