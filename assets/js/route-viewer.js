/* GPX Toolkit generated site asset */
(() => {
  "use strict";
  const host = document.getElementById("route-map");
  if (!host) return;
  const status = document.getElementById("map-status");
  const data = JSON.parse(document.getElementById("map-data").textContent);
  const labels = data.labels;
  const say = (text) => { status.textContent = text; };
  if (!window.L) {
    say(labels.load_error);
    return;
  }
  try {
    const map = L.map(host, {scrollWheelZoom: false, zoomControl: false});
    L.control.zoom({zoomInTitle: labels.zoom_in, zoomOutTitle: labels.zoom_out}).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' + labels.contributors
    }).addTo(map).on("tileerror", () => say(labels.tile_error));
    const bounds = L.latLngBounds([]);
    const overlays = {};
    const popupFor = (route) => {
      const box = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = route.title;
      const length = document.createElement("p");
      length.textContent = route.distance_label;
      const link = document.createElement("a");
      link.href = route.page_url;
      link.textContent = labels.popup;
      box.append(title, length, link);
      return box;
    };
    data.routes.forEach((route, index) => {
      const group = L.featureGroup().addTo(map);
      const geometry = L.geoJSON(route.geojson, {
        style: {color: route.color, weight: 5, opacity: 0.95},
        pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {radius: 5, color: route.color}),
        onEachFeature: (_feature, layer) => layer.bindPopup(() => popupFor(route))
      }).addTo(group);
      const features = route.geojson.features;
      const endpoints = features.map((feature) => feature.geometry.type === "Point"
        ? [feature.geometry.coordinates] : feature.geometry.coordinates);
      const start = endpoints[0][0];
      const end = endpoints[endpoints.length - 1].at(-1);
      const marker = (coordinate, text, color, radius) => {
        const label = document.createElement("span");
        label.className = "marker-label";
        label.textContent = text + ": " + route.title;
        L.circleMarker([coordinate[1], coordinate[0]], {radius, color, fillColor: color, fillOpacity: 0.85, weight: 3})
          .bindTooltip(label).addTo(group);
      };
      marker(start, labels.marker_start, "#14744a", 9);
      marker(end, labels.marker_end, "#af2441", 5);
      bounds.extend(geometry.getBounds());
      // Leaflet treats layer-control strings as HTML, so escape the label.
      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${route.title}`;
      overlays[label.innerHTML] = group;
    });
    if (data.routes.length > 1) {
      const control = L.control.layers(null, overlays, {collapsed: window.innerWidth < 650}).addTo(map);
      const toggle = control.getContainer().querySelector('.leaflet-control-layers-toggle');
      if (toggle) { toggle.title = labels.layers; toggle.setAttribute('aria-label', labels.layers); }
    }
    if (bounds.isValid()) map.fitBounds(bounds, {padding: [24, 24], maxZoom: 15});
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    window.addEventListener("resize", () => map.invalidateSize());
  } catch (_error) {
    say(labels.render_error);
  }
})();
