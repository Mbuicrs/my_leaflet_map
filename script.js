// Initialize the map
const map = L.map('map').setView([1.286389, 36.817223], 13); // Default to Nairobi

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

// Initialize bounds
const bounds = new L.LatLngBounds();

// Function to add markers from CSV
function addMarkersFromCSV(csvData) {
  csvData.forEach(row => {
    const { Latitude, Longitude, Title } = row;
    if (Latitude && Longitude) {
      const latLng = [parseFloat(Latitude), parseFloat(Longitude)];
      L.marker(latLng)
        .addTo(map)
        .bindPopup(`<b>${Title}</b>`);
      bounds.extend(latLng); // Extend bounds to include this marker
    }
  });
  map.fitBounds(bounds); // Adjust map to fit all markers
}

// Load and parse CSV data
fetch('markers.csv')
  .then(response => response.text())
  .then(csvText => {
    const csvData = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
    addMarkersFromCSV(csvData);
  })
  .catch(error => console.error('Error loading CSV:', error));
