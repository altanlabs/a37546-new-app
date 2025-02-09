import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import WindMap from "@/components/blocks/WindMap"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getAllStations, getWindDescription } from "@/services/windbird"

interface WindStats {
  avgSpeed: number;
  maxSpeed: number;
  maxGustStation: string;
  dominantDirection: string;
  activeStations: number;
  totalStations: number;
  pressure: number;
}

export default function IndexPage() {
  const [stats, setStats] = useState<WindStats>({
    avgSpeed: 0,
    maxSpeed: 0,
    maxGustStation: '',
    dominantDirection: '',
    activeStations: 0,
    totalStations: 0,
    pressure: 0
  });

  useEffect(() => {
    const updateStats = async () => {
      const stations = await getAllStations();
      const cataloniaStations = stations.filter(station => 
        station.latitude >= 40.5 && 
        station.latitude <= 42.9 && 
        station.longitude >= 0.15 && 
        station.longitude <= 3.33
      );

      const activeStations = cataloniaStations.filter(s => s.status.value === 0);
      
      // Càlcul de velocitats i direccions
      const speeds = activeStations.map(s => s.measurements.wind_speed_avg);
      const maxGust = Math.max(...activeStations.map(s => s.measurements.wind_speed_max));
      const maxGustStation = activeStations.find(s => s.measurements.wind_speed_max === maxGust);
      
      // Càlcul de la direcció dominant
      const directions = activeStations.map(s => s.measurements.wind_heading);
      const directionCounts: { [key: string]: number } = {};
      directions.forEach(dir => {
        const sector = Math.floor(dir / 45) * 45;
        directionCounts[sector] = (directionCounts[sector] || 0) + 1;
      });
      const dominantDirection = Object.entries(directionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      // Càlcul de la pressió mitjana
      const pressures = activeStations
        .map(s => s.measurements.pressure)
        .filter(p => p > 0);
      const avgPressure = pressures.length 
        ? pressures.reduce((a, b) => a + b, 0) / pressures.length 
        : 0;

      setStats({
        avgSpeed: speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
        maxSpeed: maxGust,
        maxGustStation: maxGustStation?.name || '',
        dominantDirection: dominantDirection ? `${dominantDirection}°` : 'N/A',
        activeStations: activeStations.length,
        totalStations: cataloniaStations.length,
        pressure: avgPressure
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <motion.section 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="secondary" className="mb-2">
          Xarxa de Windbirds Catalunya
        </Badge>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Monitoratge del Vent en Temps Real
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg dark:text-gray-400">
          Visualitza les dades en directe dels Windbirds distribuïts per Catalunya
        </p>
      </motion.section>

      {/* Map Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-4">
          <WindMap />
        </Card>
      </motion.section>

      {/* Info Section */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Velocitat Mitjana</h3>
          <p className="text-2xl font-bold">{stats.avgSpeed.toFixed(1)} km/h</p>
          <p className="text-sm text-gray-500">{getWindDescription(stats.avgSpeed)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Ràfega Màxima</h3>
          <p className="text-2xl font-bold">{stats.maxSpeed.toFixed(1)} km/h</p>
          <p className="text-sm text-gray-500">
            {stats.maxGustStation ? `a ${stats.maxGustStation}` : 'No disponible'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Estacions Actives</h3>
          <p className="text-2xl font-bold">{stats.activeStations}</p>
          <p className="text-sm text-gray-500">De {stats.totalStations} totals</p>
        </Card>
      </motion.section>

      {/* Additional Info Section */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Direcció Dominant</h3>
          <p className="text-2xl font-bold">{stats.dominantDirection}</p>
          <p className="text-sm text-gray-500">Direcció predominant del vent</p>
        </Card>
        {stats.pressure > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Pressió Atmosfèrica</h3>
            <p className="text-2xl font-bold">{stats.pressure.toFixed(1)} hPa</p>
            <p className="text-sm text-gray-500">Mitjana de les estacions</p>
          </Card>
        )}
      </motion.section>
    </div>
  )
}