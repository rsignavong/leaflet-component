import { Component, Prop, Watch } from '@stencil/core';
import L from 'leaflet';

@Component({
  tag: 'leaflet-map',
  styleUrl: 'leaflet-map.css',
  shadow: false
})
export class LeafletMarker {
  lmap: any = null;
  dmarker: any = null;

  el!: HTMLDivElement;

  @Prop() tileLayer: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  @Prop() mapId: string = 'mapId';
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
    this.lmap = L.map(this.mapId);
    this.setView();
    this.setTileLayer();
    this.setScale();
    this.setMarkers();
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

  setMarkers(): void {
    Array.from(this.el.children).filter(e => e.nodeName == "LEAFLET-MARKER")
      .map(marker => {
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
        .bindPopup(this.defaultPopup, { offset: L.point(0, 6-this.iconHeight/2) })
        .openPopup();
    }
  }

  render() {
    return <div id={this.mapId} class={this.className} ref={el => this.el = el as HTMLDivElement}>
      <slot></slot>
    </div>;
  }
}
