import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default marker icons not loading properly with bundlers like Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom colored icons so customer vs provider markers look different
const customerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'hue-rotate-0', // default blue for customer
});

const providerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'hue-rotate-180', // shifts color for provider, quick visual distinction
});

// Helper component that re-centers the map when coordinates change
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const LeafletMap = ({
  customerLocation,
  providerLocation,
  zoom = 14,
  height = '400px',
}) => {
  const centerLat = customerLocation?.latitude || providerLocation?.latitude || 22.7196;
  const centerLng = customerLocation?.longitude || providerLocation?.longitude || 75.8577; // Indore fallback

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl2 overflow-hidden border border-ink-300">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; OpenStreetMap contributors'
        />

        {customerLocation && (
          <Marker
            position={[customerLocation.latitude, customerLocation.longitude]}
            icon={customerIcon}
          >
            <Popup>Customer location</Popup>
          </Marker>
        )}

        {providerLocation && (
          <Marker
            position={[providerLocation.latitude, providerLocation.longitude]}
            icon={providerIcon}
          >
            <Popup>Provider location</Popup>
          </Marker>
        )}

        <RecenterMap lat={providerLocation?.latitude} lng={providerLocation?.longitude} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;