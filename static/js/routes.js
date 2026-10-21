// Interactive route maps of the sequence cards: OpenStreetMap tiles + GNSS track colored by speed (static/data/routes.json).
(function () {
  // speed colormap of the paper figure (0 to 100 km/h)
  var STOPS = ['#9ec5f4', '#5598e7', '#256abf', '#104281', '#0d366b'];
  function hex(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function speedColor(f) {
    f = Math.max(0, Math.min(1, f)) * (STOPS.length - 1);
    var i = Math.min(Math.floor(f), STOPS.length - 2), t = f - i, a = hex(STOPS[i]), b = hex(STOPS[i + 1]);
    return 'rgb(' + a.map(function (v, k) { return Math.round(v + (b[k] - v) * t); }).join(',') + ')';
  }

  function draw(el, d, binKmh) {
    var map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25, attributionControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var classes = Object.keys(d.classes).map(Number).sort(function (a, b) { return a - b; });
    // dark casing under the colored track, so light (slow) segments stay visible on the map
    classes.forEach(function (c) {
      L.polyline(d.classes[c], { color: '#0b1a33', weight: 5.5, opacity: 0.35, interactive: false }).addTo(map);
    });
    classes.forEach(function (c) {
      L.polyline(d.classes[c], { color: speedColor((c * binKmh + binKmh / 2) / 100), weight: 3.2, opacity: 1,
                                 interactive: false }).addTo(map);
    });
    if (d.show_start) {
      L.circleMarker(d.start, { radius: 6, color: '#0b0b0b', weight: 2, fillColor: '#fff', fillOpacity: 1 })
        .bindPopup('Start: Universidad de San Andrés campus, Victoria').addTo(map);
    }
    d.marks.forEach(function (m) {
      var icon = L.divIcon({ className: 'landmark-icon', html: '<span>' + m.id + '</span>', iconSize: [22, 22], iconAnchor: [11, 11] });
      L.marker([m.lat, m.lon], { icon: icon, title: m.name }).bindPopup('(' + m.id + ') ' + m.name).addTo(map);
    });
    map.fitBounds(d.bounds, { padding: [12, 12] });
  }

  fetch('./static/data/routes.json').then(function (r) { return r.json(); }).then(function (data) {
    document.querySelectorAll('.seq-map[data-seq]').forEach(function (el) {
      var d = data.sequences[el.getAttribute('data-seq')];
      if (d) draw(el, d, data.bin_kmh);
    });
  });
})();
