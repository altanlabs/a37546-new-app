import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface WindbirdLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  windSpeed?: number;
  windDirection?: number;
}

// Temporary mock data - This should come from your API
const mockWindbirds: WindbirdLocation[] = [
  { id: '1', name: 'Port de Barcelona', lat: 41.3651, lng: 2.1684 },
  { id: '2', name: 'Delta de l\'Ebre', lat: 40.7075, lng: 0.8519 },
  { id: '3', name: 'Costa Brava', lat: 42.0095, lng: 3.2157 },
  // Add more locations as needed
];

export default function WindMap() {
  const [windbirds, setWindbirds] = useState<WindbirdLocation[]>(mockWindbirds);

  // Center of Catalonia
  const center: [number, number] = [41.8183, 1.8276];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={center} 
        zoom={8} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {windbirds.map((windbird) => (
          <Marker
            key={windbird.id}
            position={[windbird.lat, windbird.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{windbird.name}</h3>
                {windbird.windSpeed && (
                  <p>Velocitat del vent: {windbird.windSpeed} km/h</p>
                )}
                {windbird.windDirection && (
                  <p>Direcció: {windbird.windDirection}°</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}