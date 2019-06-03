import { Component, Prop, Watch, Element } from '@stencil/core';
import L from 'leaflet';

interface LayerObserver {
  layer: any,
  observer: any,
}

@Component({
  tag: 'leaflet-map',
  styleUrl: 'leaflet-map.css',
  shadow: false,
})
export class LeafletMarker {
  lmap: any = null;
  dmarker: any = null;
  observer: any = null;
  children: WeakMap<any, LayerObserver> = new WeakMap();

  @Element() el: HTMLElement;

  @Prop() tileLayer: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  @Prop({ mutable: true }) mapId: string = '';
  @Prop() className: string = '';
  @Prop({ mutable: true }) iconUrl: string = '';
  @Prop({ mutable: true }) iconHeight: number = 32;
  @Prop({ mutable: true }) iconWidth: number = 32;
  @Prop({ mutable: true }) latitude: number = 51.505;
  @Prop({ mutable: true }) longitude: number = -0.09;
  @Prop({ mutable: true }) scale: number = 13;
  @Prop() showScale: boolean;
  @Prop() showDefaultMarker: boolean;
  @Prop({ mutable: true }) defaultPopup: string;

  componentDidLoad() {
    const target = this.mapId ? document.getElementById(this.mapId) : this.el;

    this.lmap = L.map(target);
    this.setView();
    this.setTileLayer();
    this.setScale();
    this.setChildren();
    this.setDefaultMarker();

    this.observer = new MutationObserver((mutations: Array<any>, _observer: any) => this.childrenObserver(mutations));
    this.observer.observe(target, { attributes: false, childList: true, subtree: false });
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  @Watch('defaultPopup')
  defaultPopupHandler(newValue: string, _oldValue: string): void {
    this.defaultPopup = newValue;
    this.setDefaultIcon();
    this.updateDefaultPopup();
  }

  @Watch('iconHeight')
  iconHeightHandler(newValue: number, _oldValue: number): void {
    this.iconHeight = newValue;
    this.setDefaultIcon();
  }

  @Watch('iconUrl')
  iconUrlHandler(newValue: string, _oldValue: string): void {
    this.iconUrl = newValue;
    this.setDefaultIcon();
  }

  @Watch('iconWidth')
  iconWidthHandler(newValue: number, _oldValue: number): void {
    this.iconWidth = newValue;
    this.setDefaultIcon();
  }

  @Watch('latitude')
  latitudeHandler(newValue: number, _oldValue: number): void {
    this.latitude = newValue;
    this.setView();
    this.updateDefaultMarker();
    this.updateDefaultPopup();
  }

  @Watch('longitude')
  longitudeHandler(newValue: number, _oldValue: number): void {
    this.longitude = newValue;
    this.setView();
    this.updateDefaultMarker();
    this.updateDefaultPopup();
  }

  @Watch('scale')
  scaleHandler(newValue: number, _oldValue: number): void {
    this.scale = newValue;
    this.setView();
  }

  childrenObserver(mutationsList: Array<any>): void {
    for (const mutation of mutationsList) {
      if (mutation.type !== 'childList') continue;

      this.removeChildren(mutation.removedNodes);
      this.setChildren();
    }
  }

  attributesObserver(el: any, mutationsList: Array<any>) : void {
    for (const mutation of mutationsList) {
      if (mutation.type !== 'attributes')  continue;

      if (['latitude', 'longitude'].includes(mutation.attributeName)) {
        this.children.get(el).layer.setLatLng([el.getAttribute('latitude'), el.getAttribute('longitude')]);
      }
    }
  }

  removeChildren(nodes: Array<any>) {
    nodes.forEach(node => {
      if (!node.nodeName.startsWith("LEAFLET-")) return;

      const el = this.children.get(node);
      this.lmap.removeLayer(el.layer);
      if (el.observer) el.observer.disconnect();
      this.children.delete(node);
    });
  }

  setChildren(): void {
    Array.from(this.el.children)
      .map(e => {
        if (this.children.get(e) !== undefined) return;

        if (e.nodeName === "LEAFLET-MARKER") {
          const observer = new MutationObserver((mutations: Array<any>, _observer: any) => this.attributesObserver(e, mutations));
          observer.observe(e, { attributes: true, childList: false, subtree: false });

          const marker = {
            layer: L.marker([e.getAttribute('latitude'), e.getAttribute('longitude')]),
            observer,
          }

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
        } else if (e.nodeName === "LEAFLET-CIRCLE") {
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

  setDefaultIcon(): void {
    if (this.iconUrl) {
      const icon = L.icon({
        iconUrl: this.iconUrl,
        iconSize: [this.iconWidth, this.iconHeight]
      });

      this.dmarker.setIcon(icon);
    }
  }

  setDefaultMarker(): void {
    if (this.showDefaultMarker) {
      if (this.defaultPopup) {
        this.dmarker = L.marker([this.latitude, this.longitude])
          .addTo(this.lmap)
          .bindPopup(this.defaultPopup)
          .openPopup();
      } else {
        this.dmarker = L.marker([this.latitude, this.longitude]).addTo(this.lmap);
      }

      this.setDefaultIcon();
    }
  }

  setScale(): void {
    if (this.showScale) {
      L.control.scale().addTo(this.lmap);
    }
  }

  setTileLayer(): void {
    L.tileLayer(this.tileLayer).addTo(this.lmap);
  }

  setView(): void {
    this.lmap.setView([this.latitude, this.longitude], this.scale);
  }

  updateDefaultMarker(): void {
    if (this.showDefaultMarker) {
      this.dmarker.setLatLng([this.latitude, this.longitude]);
    }
  }

  updateDefaultPopup(): void {
    console.log("update", this.showDefaultMarker, this.defaultPopup);
    if (this.showDefaultMarker && this.defaultPopup) {
      this.dmarker
        .bindPopup(this.defaultPopup, { offset: L.point(0, 6 - this.iconHeight / 2) })
        .openPopup();
    }
  }

}
