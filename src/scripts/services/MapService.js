export class MapService {
    constructor(mapContainerId) {
        this.mapContainerId = mapContainerId;
        this.map = null;
        this.markers = [];
        this.tileLayers = {
            standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }),
            dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            })
        };
    }
    addTileLayers() {
    this.tileLayers.standard.addTo(this.map);
    L.control.layers(this.tileLayers).addTo(this.map);
    }

    initMap(center, zoom) {
    const container = document.getElementById(this.mapContainerId);

    if (container && container._leaflet_id != null) {
        container._leaflet_id = null;
    }

    if (this.map) {
        this.map.remove();
        this.map = null;
    }

    this.map = L.map(this.mapContainerId).setView(center, zoom);
    this.tileLayers.standard.addTo(this.map);
    L.control.layers(this.tileLayers).addTo(this.map);
    }

    addMarker(position, popupContent) {
        const marker = L.marker(position).addTo(this.map);
        if (popupContent) {
            marker.bindPopup(popupContent);
        }
        this.markers.push(marker);
        return marker;
    }

    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    fitToMarkers() {
        if (this.markers.length === 0) return;

        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    setView(center, zoom) {
        this.map.setView(center, zoom);
    }
}
