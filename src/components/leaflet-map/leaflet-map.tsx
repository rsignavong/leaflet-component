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

  @Prop() tileLayer: string = '';
  @Prop() mapId: string = 'mapId';
  @Prop() className: string = '';
  @Prop() latitude: number;
  @Prop() longitude: number;
  @Prop() scale: number;
  @Prop() showScale: boolean;

  componentDidLoad() {
    this.lmap = L.map(this.mapId).setView([51.505, -0.09], 13);
    L.tileLayer(this.tileLayer).addTo(this.lmap);
    L.control.scale().addTo(this.lmap);
    Array.from(this.el.children).filter(e => e.nodeName == "LEAFLET-MARKER")
      .map((marker) => {
      L.marker([marker.getAttribute('latitude'), marker.getAttribute('longitude')])
        .addTo(this.lmap)
        .bindPopup(marker.textContent)
        .openPopup();
    });
  }

  render() {
    return <div id={this.mapId} class={this.className} ref={el => this.el = el as HTMLDivElement}>
      <slot></slot>
    </div>;
  }
}
