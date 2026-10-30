/* GPX Toolkit generated site asset */
(() => {
  "use strict";
  const host = document.getElementById("route-map");
  if (!host) return;
  const status = document.getElementById("map-status");
  const say = (text) => { status.textContent = text; };
  if (!window.L) {
    say("A térkép nem tölthető be. Ellenőrizd az internetkapcsolatot; a GPX és az útvonaladatok alább elérhetők.");
    return;
  }
  try {
    const data = JSON.parse(document.getElementById("map-data").textContent);
    const map = L.map(host, {scrollWheelZoom: false});
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> közreműködők'
    }).addTo(map).on("tileerror", () => say("Az alaptérkép egyes részei nem érhetők el. Az útvonal továbbra is megjelenik."));
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
      link.textContent = "Részletes útvonal megnyitása →";
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
      marker(start, "Indulás", "#14744a", 9);
      marker(end, "Érkezés", "#af2441", 5);
      bounds.extend(geometry.getBounds());
      // Leaflet treats layer-control strings as HTML, so escape the label.
      const label = document.createElement("span");
      label.textContent = `${index + 1}. ${route.title}`;
      overlays[label.innerHTML] = group;
    });
    if (data.routes.length > 1) L.control.layers(null, overlays, {collapsed: window.innerWidth < 650}).addTo(map);
    if (bounds.isValid()) map.fitBounds(bounds, {padding: [24, 24], maxZoom: 15});
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    window.addEventListener("resize", () => map.invalidateSize());
  } catch (_error) {
    say("A térkép megjelenítése sikertelen. Az útvonaladatok és a GPX-letöltés továbbra is elérhetők.");
  }
})();
