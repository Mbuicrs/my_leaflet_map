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
      style: {
        fillColor: 'grey',      // Set fill color to gray
        fillOpacity: 0.4,       // Set fill transparency to 40%
        color: 'transparent',   // Remove polygon borders
        weight: 0,              // Set border weight to 0
        stroke: false
      
      },
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


const customIcon = L.icon({
  iconUrl: 'files/loc1.png', // Path to your image
  iconSize: [22, 22],        // Adjust the size as needed
  iconAnchor: [16, 32],      // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -32]      // Point from which the popup should open relative to the iconAnchor
});



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
        const marker = L.marker([lat, lng], { icon: customIcon })
          .bindPopup(`<b>${title}</b>`)
          .bindTooltip(title, {
            permanent: true,
            direction: 'top',
            offset: [0, -10],
            className: 'plain-label'
          });
        marker.addTo(allLayers);
      }
    });
    fitMapToLayers();
  })
  .catch((error) => console.error('Error loading CSV:', error));

  
// Function to fit map to all layers
function fitMapToLayers() {
  if (allLayers.getLayers().length > 0) {
    map.fitBounds(allLayers.getBounds(), {
      padding: [50, 50],
      maxZoom: 16,
    });
  }
}
