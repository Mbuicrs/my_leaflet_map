// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load and display GeoJSON data
fetch('subsidence.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>Location:</b> ${feature.properties.name}`);
      }
    }).addTo(map);
  })
  .catch(error => console.error('Error loading GeoJSON:', error));

// Load and display CSV data
fetch('markers.csv')
  .then(response => response.text())
  .then(csv => {
    const data = Papa.parse(csv, { header: true, skipEmptyLines: true }).data;
    data.forEach(row => {
      const { Latitude, Longitude, Title } = row;
      if (Latitude && Longitude) {
        L.marker([parseFloat(Latitude), parseFloat(Longitude)])
          .addTo(map)
          .bindPopup(`<b>${Title}</b>`);
      }
    });
  })
  .catch(error => console.error('Error loading CSV:', error));
