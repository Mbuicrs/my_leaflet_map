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


const classLayers = {}; // Object to hold LayerGroups for each class




// Define the path to your custom icon image
const iconUrl = 'files/loc1.png';

// Fetch and parse the CSV data
fetch('markers.csv')
  .then((response) => response.text())
  .then((csvText) => {
    const data = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    }).data;

    // Extract EntrySize values and compute min and max
    const entrySizes = data
      .map(row => parseFloat(row.EntrySize))
      .filter(size => !isNaN(size));

    const minEntrySize = Math.min(...entrySizes);
    const maxEntrySize = Math.max(...entrySizes);

    // Define icon size range in pixels
    const minIconSize = 16;
    const maxIconSize = 64;

    data.forEach((row) => {
      const lat = parseFloat(row.Latitude);
      const lng = parseFloat(row.Longitude);
      const title = row.Title || 'No Title';
      const entrySize = parseFloat(row.EntrySize);

      if (!isNaN(lat) && !isNaN(lng) && !isNaN(entrySize)) {
        // Normalize entrySize to a value between 0 and 1
        const normalizedSize = (entrySize - minEntrySize) / (maxEntrySize - minEntrySize);
        // Clamp the normalized size between 0 and 1
        const clampedSize = Math.max(0, Math.min(1, normalizedSize));

        // Calculate icon dimensions
        const iconDimension = minIconSize + clampedSize * (maxIconSize - minIconSize);

        // Create a custom icon with the calculated size
        const dynamicIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [iconDimension, iconDimension],
          iconAnchor: [iconDimension / 2, iconDimension],
          popupAnchor: [0, -iconDimension]
        });

        // Create and add the marker to the map
        const marker = L.marker([lat, lng], { icon: dynamicIcon })
          .bindPopup(`<b>${title}</b>`);
        marker.addTo(allLayers);
      }
    });

    fitMapToLayers();
  })
  .catch((error) => console.error('Error loading CSV:', error));

// Example for GeoJSON data
fetch('data.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const classification = feature.properties.class; // e.g., 'subsidence', 'landslide', 'flood'
        if (classification === 'subsidence') {
          subsidenceLayer.addLayer(layer);
        } else if (classification === 'landslide') {
          landslideLayer.addLayer(layer);
        } else if (classification === 'flood') {
          floodLayer.addLayer(layer);
        }
      }
    });
  });



  // Define overlay maps
const overlayMaps = {
  "Subsidence": subsidenceLayer,
  "Landslide": landslideLayer,
  "Flood": floodLayer
};

// Add layers control to the map
L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);


  
// Function to fit map to all layers
function fitMapToLayers() {
  if (allLayers.getLayers().length > 0) {
    map.fitBounds(allLayers.getBounds(), {
      padding: [50, 50],
      maxZoom: 16,
    });
  }
}
