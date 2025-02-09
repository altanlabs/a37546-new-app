// Definició dels tipus segons la documentació oficial
export interface WindbirdStatus {
  id: number;        // Station ID
  date: string;      // Date of the status (ISO 8601)
  value: number;     // Status code (0: OK, 1: Warning, 2: Error, 3: No data)
  text: string;      // Human readable status
}

export interface WindbirdMeasurement {
  date: string;           // Measurement date (ISO 8601)
  pressure: number;       // Pressure in hPa
  wind_heading: number;   // Wind direction in degrees (0-359)
  wind_speed_avg: number; // Average wind speed in km/h
  wind_speed_max: number; // Maximum wind speed in km/h
  wind_speed_min: number; // Minimum wind speed in km/h
}

export interface WindbirdLocation {
  id: number;            // Station ID
  name: string;          // Station name
  description: string;   // Station description
  latitude: number;      // Station latitude
  longitude: number;     // Station longitude
  elevation: number;     // Station elevation in meters
  status: WindbirdStatus;
  measurements: WindbirdMeasurement;
  location_name: string; // Human readable location
}

interface WindbirdResponse {
  data: WindbirdLocation;
}

interface WindbirdAllResponse {
  data: WindbirdLocation[];
}

// Funció per convertir la direcció del vent en text
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

// Funció per obtenir el text d'estat
export function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return 'Operatiu';
    case 1:
      return 'Advertència';
    case 2:
      return 'Error';
    case 3:
      return 'Sense dades';
    default:
      return 'Estat desconegut';
  }
}

// Funció per obtenir el color de l'estat
export function getStatusColor(status: number): string {
  switch (status) {
    case 0:
      return 'bg-green-500';
    case 1:
      return 'bg-yellow-500';
    case 2:
      return 'bg-red-500';
    case 3:
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

// Funció per obtenir la descripció de la velocitat del vent (escala Beaufort)
export function getWindDescription(speed: number): string {
  if (speed < 1) return 'Calma';
  if (speed < 6) return 'Vent molt fluix';
  if (speed < 12) return 'Vent fluix';
  if (speed < 20) return 'Vent moderat';
  if (speed < 29) return 'Vent fort';
  if (speed < 39) return 'Vent molt fort';
  if (speed < 50) return 'Temporal';
  if (speed < 62) return 'Temporal fort';
  if (speed < 75) return 'Temporal molt fort';
  return 'Temporal huracanat';
}

export async function getAllStations(): Promise<WindbirdLocation[]> {
  try {
    const response = await fetch('http://api.pioupiou.fr/v1/live-with-meta/all');
    if (!response.ok) {
      throw new Error('Error en la resposta de l\'API');
    }
    const data: WindbirdAllResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error obtenint les estacions Windbird:', error);
    return [];
  }
}

export async function getStation(stationId: number): Promise<WindbirdLocation | null> {
  try {
    const response = await fetch(`http://api.pioupiou.fr/v1/live-with-meta/${stationId}`);
    if (!response.ok) {
      throw new Error('Error en la resposta de l\'API');
    }
    const data: WindbirdResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error obtenint l'estació Windbird ${stationId}:`, error);
    return null;
  }
}