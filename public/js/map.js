const mapContainer = document.getElementById("map");

if (
  !mapContainer ||
  !mapToken ||
  !mapToken.startsWith("pk.") ||
  !listing?.geometry?.coordinates?.length
) {
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div class="map-empty">
        <div>
          <h5 class="mb-2">Map preview unavailable</h5>
          <p class="mb-0">Location details are still listed below for this property.</p>
        </div>
      </div>
    `;
  }
} else {
  mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
    container: "map",
    center: listing.geometry.coordinates,
    zoom: 9,
  });

  new mapboxgl.Marker({ color: "black" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${listing.title}</h4><p>Exact location will be shared after booking</p>`
      )
    )
    .addTo(map);
}

