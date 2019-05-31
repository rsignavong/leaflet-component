import { Component, Prop, Watch, Element } from '@stencil/core';
import L from 'leaflet';

@Component({
  tag: 'leaflet-map',
  styleUrl: 'leaflet-map.css',
  shadow: false
})
export class LeafletMarker {
  lmap: any = null;
  dmarker: any = null;

  @Element() el: HTMLElement;
  // el!: HTMLDivElement;

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

  setChildren(): void {
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
        } else if (e.nodeName == "LEAFLET-CIRCLE") {
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

  render() {
    // return <div id={this.mapId} class={this.className} ref={el => this.el = el as HTMLDivElement}>
    //   <slot></slot>
    // </div>;
    return <div></div>;
  }
}
