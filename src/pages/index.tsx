import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import WindMap from "@/components/blocks/WindMap"
import { motion } from "framer-motion"

export default function IndexPage() {
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
          <p className="text-2xl font-bold">12.5 km/h</p>
          <p className="text-sm text-gray-500">Últimes 24 hores</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Direcció Predominant</h3>
          <p className="text-2xl font-bold">NE</p>
          <p className="text-sm text-gray-500">Nord-est</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Estacions Actives</h3>
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm text-gray-500">De 3 totals</p>
        </Card>
      </motion.section>
    </div>
  )
}