import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';
import { getAllStations } from '@/services/windbird';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface WindbirdStation {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  measurements: {
    wind_heading: number;
    wind_speed_avg: number;
    wind_speed_max: number;
    wind_speed_min: number;
    date: string;
  };
  status: {
    value: number;
    date: string;
  };
}

export default function WindMap() {
  const [stations, setStations] = useState<WindbirdStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Center of Catalonia
  const center: [number, number] = [41.8183, 1.8276];

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getAllStations();
        // Filter stations in Catalonia (approximate bounding box)
        const cataloniaStations = data.filter(station => 
          station.latitude >= 40.5 && 
          station.latitude <= 42.9 && 
          station.longitude >= 0.15 && 
          station.longitude <= 3.33
        );
        setStations(cataloniaStations);
        setLoading(false);
      } catch (err) {
        setError('Error carregant les estacions Windbird');
        setLoading(false);
      }
    };

    fetchStations();
    // Actualitza cada 30 segons
    const interval = setInterval(fetchStations, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-green-500';
      case 1:
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ca-ES');
  };

  if (loading) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Carregant estacions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">{station.name}</h3>
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(station.status.value)}`}></span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Velocitat mitjana:</span>{' '}
                    {station.measurements.wind_speed_avg.toFixed(1)} km/h
                  </p>
                  <p>
                    <span className="font-semibold">Ràfega màxima:</span>{' '}
                    {station.measurements.wind_speed_max.toFixed(1)} km/h
                  </p>
                  <p>
                    <span className="font-semibold">Direcció:</span>{' '}
                    {station.measurements.wind_heading}°
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Última actualització: {formatDate(station.measurements.date)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}