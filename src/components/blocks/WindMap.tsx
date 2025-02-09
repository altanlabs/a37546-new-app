import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, DivIcon } from 'leaflet';
import { useEffect, useState } from 'react';
import { 
  getAllStations, 
  WindbirdLocation,
  getWindDirection,
  getStatusText,
  getStatusColor,
  getWindDescription
} from '@/services/windbird';
import { Card } from '@/components/ui/card';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Funció per crear l'indicador de direcció del vent
const createWindDirectionMarker = (heading: number) => {
  return new DivIcon({
    html: `<div style="transform: rotate(${heading}deg);">➤</div>`,
    className: 'wind-direction-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function WindMap() {
  const [stations, setStations] = useState<WindbirdLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Centre de Catalunya
  const center: [number, number] = [41.8183, 1.8276];

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getAllStations();
        // Filtrar estacions de Catalunya (bbox aproximat)
        const cataloniaStations = data.filter(station => 
          station.latitude >= 40.5 && 
          station.latitude <= 42.9 && 
          station.longitude >= 0.15 && 
          station.longitude <= 3.33
        );
        setStations(cataloniaStations);
        setLastUpdate(new Date());
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
    <div className="space-y-4">
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
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{station.name}</h3>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(station.status.value)}`}
                      >
                        {getStatusText(station.status.value)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Ubicació:</span>{' '}
                        {station.location_name || 'No disponible'}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Altitud:</span>{' '}
                        {station.elevation}m
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Velocitat mitjana:</span>{' '}
                        {station.measurements.wind_speed_avg.toFixed(1)} km/h
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Ràfega màxima:</span>{' '}
                        {station.measurements.wind_speed_max.toFixed(1)} km/h
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Direcció:</span>{' '}
                        {station.measurements.wind_heading}° ({getWindDirection(station.measurements.wind_heading)})
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Condicions:</span>{' '}
                        {getWindDescription(station.measurements.wind_speed_avg)}
                      </p>
                      {station.measurements.pressure && (
                        <p className="text-sm">
                          <span className="font-semibold">Pressió:</span>{' '}
                          {station.measurements.pressure} hPa
                        </p>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>Última actualització: {formatDate(station.measurements.date)}</p>
                    </div>
                  </div>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="text-right text-sm text-gray-500">
        Última actualització: {lastUpdate.toLocaleString('ca-ES')}
      </div>
    </div>
  );
}