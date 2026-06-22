const mapContainer = document.getElementById("map");

if (mapContainer) {
  let listingData = null;

  try {
    listingData = JSON.parse(mapContainer.dataset.listing || "{}");
  } catch (error) {
    listingData = null;
  }

  const coordinates = listingData?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    mapContainer.innerHTML = `
      <div class="map-empty">
        <div>
          <h5 class="mb-2">Map preview unavailable</h5>
          <p class="mb-0">Location details are still listed below for this property.</p>
        </div>
      </div>
    `;
  } else {
    const [lng, lat] = coordinates.map(Number);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      mapContainer.innerHTML = `
        <div class="map-empty">
          <div>
            <h5 class="mb-2">Map preview unavailable</h5>
            <p class="mb-0">The saved coordinates are invalid.</p>
          </div>
        </div>
      `;
    } else {
      const delta = 0.01;
      const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join("%2C");

      mapContainer.innerHTML = `
        <iframe
          class="map-frame"
          title="Listing location map"
          loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}">
        </iframe>
      `;
    }
  }
}
