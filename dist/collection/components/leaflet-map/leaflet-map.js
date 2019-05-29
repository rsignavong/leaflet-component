import L from 'leaflet';
export class LeafletMarker {
    constructor() {
        this.lmap = null;
        this.dmarker = null;
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
        var target = this.el;
        if (this.mapId && this.mapId != '') {
            target = document.getElementById(this.mapId);
        }
        this.lmap = L.map(target);
        this.setView();
        this.setTileLayer();
        this.setScale();
        this.setChildren();
        this.setDefaultMarker();
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
    setChildren() {
        Array.from(this.el.children)
            .map(e => {
            if (e.nodeName == "LEAFLET-MARKER") {
                const marker = e;
                const mk = L.marker([marker.getAttribute('latitude'), marker.getAttribute('longitude')])
                    .addTo(this.lmap)
                    .bindPopup(marker.textContent)
                    .openPopup();
                if (marker.getAttribute('icon-url')) {
                    const icon = L.icon({
                        iconUrl: marker.getAttribute('icon-url'),
                        iconSize: [marker.getAttribute('icon-width') || 32, marker.getAttribute('icon-height') || 32]
                    });
                    mk.setIcon(icon);
                }
            }
            else if (e.nodeName == "LEAFLET-CIRCLE") {
                const circle = e;
                const opts = {
                    radius: circle.getAttribute('radius'),
                    stroke: circle.hasAttribute('stroke'),
                    color: circle.hasAttribute('color') ? circle.getAttribute('color') : "#3388ff",
                    weight: circle.hasAttribute('weight') ? circle.getAttribute('weight') : 3,
                    opacity: circle.hasAttribute('opacity') ? circle.getAttribute('opacity') : 1.0,
                    lineCap: circle.hasAttribute('line-cap') ? circle.getAttribute('line-cap') : "round",
                    lineJoin: circle.hasAttribute('line-join') ? circle.getAttribute('line-join') : "round",
                    dashArray: circle.hasAttribute('dash-array') ? circle.getAttribute('dash-array') : null,
                    dashOffset: circle.hasAttribute('dash-offset') ? circle.getAttribute('dash-offset') : null,
                    fill: circle.hasAttribute('fill') && circle.getAttribute('fill') == "false" ? false : true,
                    fillColor: circle.hasAttribute('fill-color') ? circle.getAttribute('fill-color') : "#3388ff",
                    fillOpacity: circle.hasAttribute('fill-opacity') ? circle.getAttribute('fill-opacity') : 0.2,
                    fillRule: circle.hasAttribute('fill-rule') ? circle.getAttribute('fill-rule') : "evenodd",
                    bubblingMouseEvents: circle.hasAttribute('bubbling-mouse-events'),
                    className: circle.hasAttribute('class-name') ? circle.getAttribute('class-name') : null
                };
                L.circle([circle.getAttribute('latitude'), circle.getAttribute('longitude')], opts)
                    .addTo(this.lmap);
            }
        });
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
    render() {
        return h("slot", null);
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
