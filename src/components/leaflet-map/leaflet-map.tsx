import { Component, Prop } from '@stencil/core';
import L from 'leaflet';

@Component({
  tag: 'leaflet-map',
  styleUrl: 'leaflet-map.css',
  shadow: false
})
export class LeafletMarker {
  lmap: any = null;

  el!: HTMLDivElement;

  @Prop() tileLayer: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  @Prop() mapId: string = 'mapId';
  @Prop() className: string = '';
  @Prop() latitude: number = 51.505;
  @Prop() longitude: number = -0.09;
  @Prop() scale: number = 13;
  @Prop() showScale: boolean;

  componentDidLoad() {
    this.setView();
    this.setTileLayer();
    this.displayScale();
    this.setMarkers();
  }

  setMarkers(): void {
    Array.from(this.el.children).filter(e => e.nodeName == "LEAFLET-MARKER")
      .map(marker => {
        L.marker([marker.getAttribute('latitude'), marker.getAttribute('longitude')])
          .addTo(this.lmap)
          .bindPopup(marker.textContent)
          .openPopup();
      });
  }

  setTileLayer(): void {
    L.tileLayer(this.tileLayer).addTo(this.lmap);
  }

  setView(): void {
    this.lmap = L.map(this.mapId).setView([this.latitude, this.longitude], this.scale);
  }

  displayScale(): void {
    if (this.showScale) {
      L.control.scale().addTo(this.lmap);
    }
  }
  render() {
    return <div id={this.mapId} class={this.className} ref={el => this.el = el as HTMLDivElement}>
      <slot></slot>
    </div>;
  }
}
