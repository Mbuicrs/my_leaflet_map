// Initialize the map with default view
const map = L.map('map').setView([1.286389, 36.817223], 12); // Centered on Nairobi

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Create a feature group to hold all layers
const allLayers = L.featureGroup().addTo(map);

// Load and display GeoJSON data
fetch('subsidence.geojson')
  .then((response) => response.json())
  .then((geojsonData) => {
    const geojsonLayer = L.geoJSON(geojsonData, {
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(`<b>${feature.properties.name}</b>`);
        }
      },
    });
    geojsonLayer.addTo(allLayers);
    fitMapToLayers();
  })
  .catch((error) => console.error('Error loading GeoJSON:', error));
L.geoJSON(geojsonData, {
  style: {
    fillColor: 'gray',
    fillOpacity: 0.4,
    stroke: false
  },
  onEachFeature: (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<b>${feature.properties.name}</b>`);
    }
  }
}).addTo(allLayers);

// Load and display CSV data
fetch('markers.csv')
  .then((response) => response.text())
  .then((csvText) => {
    const data = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    }).data;

    data.forEach((row) => {
      const lat = parseFloat(row.Latitude);
      const lng = parseFloat(row.Longitude);
      const title = row.Title || 'No Title';

      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = createStarMarker([lat, lng], title);
        marker.addTo(allLayers);
      }
    });
    fitMapToLayers();
  })
  .catch((error) => console.error('Error loading CSV:', error));

function createStarMarker(latlng, title) {
  const circle = L.circleMarker(latlng, {
    radius: 10,
    fillColor: '#ffffff',
    fillOpacity: 1,
    color: '#ff0000',
    weight: 2
  });

  const starIcon = L.divIcon({
    html: '<div class="star-marker">&#9733;</div>',
    className: '',
    iconSize: [20, 20]
  });

  const star = L.marker(latlng, { icon: starIcon });

  const group = L.layerGroup([circle, star]);
  group.bindPopup(`<b>${title}</b>`);
  return group;
}

// Function to fit map to all layers
function fitMapToLayers() {
  if (allLayers.getLayers().length > 0) {
    map.fitBounds(allLayers.getBounds(), {
      padding: [50, 50],
      maxZoom: 16,
    });
  }
}
