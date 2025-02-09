interface WindbirdMeasurement {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  status: {
    date: string;
    value: number;
  };
  measurements: {
    date: string;
    wind_heading: number;
    wind_speed_avg: number;
    wind_speed_max: number;
    wind_speed_min: number;
  };
}

interface WindbirdResponse {
  data: WindbirdMeasurement;
}

interface WindbirdAllResponse {
  data: WindbirdMeasurement[];
}

export async function getAllStations(): Promise<WindbirdMeasurement[]> {
  try {
    const response = await fetch('http://api.pioupiou.fr/v1/live-with-meta/all');
    const data: WindbirdAllResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Windbird stations:', error);
    return [];
  }
}

export async function getStation(stationId: number): Promise<WindbirdMeasurement | null> {
  try {
    const response = await fetch(`http://api.pioupiou.fr/v1/live-with-meta/${stationId}`);
    const data: WindbirdResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching Windbird station ${stationId}:`, error);
    return null;
  }
}