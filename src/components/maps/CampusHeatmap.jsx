
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Shield, 
  Users, 
  RefreshCw, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { campusDensity } from '@/api/functions';

export default function CampusHeatmap() {
  const [densityData, setDensityData] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState(null); // New state for hover
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    loadDensityData();
    const interval = setInterval(loadDensityData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadDensityData = async () => {
    try {
      const { data } = await campusDensity();
      setDensityData(data.hotspots);
      setSafeZones(data.safeZones);
      setLastUpdate(new Date(data.timestamp));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load campus density:', error);
      setIsLoading(false);
    }
  };

  const getSafetyColor = (level, percent) => {
    switch (level) {
      case 'high': return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' };
      case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' };
      case 'low': return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const getSafetyIcon = (level) => {
    switch (level) {
      case 'high': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Eye className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  // Convert lat/lng to x/y coordinates for the map overlay
  const coordToPixel = (lat, lng) => {
    // UT Austin campus bounds from the satellite image
    const bounds = {
      north: 30.295,   // North edge of campus
      south: 30.275,   // South edge of campus  
      west: -97.750,   // West edge of campus
      east: -97.730    // East edge of campus
    };
    
    // Map dimensions
    const width = 800;
    const height = 600;
    
    // Convert coordinates to pixel positions
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
    
    return { x: Math.max(20, Math.min(width - 20, x)), y: Math.max(20, Math.min(height - 20, y)) };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-ut-orange" />
              Campus Activity Heatmap
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showSafeZones} 
                  onCheckedChange={setShowSafeZones}
                />
                <span className="text-sm">Safe Zones</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDensityData}
                disabled={isLoading}
                className="border border-black text-black hover:bg-gray-100"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Visualization with Satellite Overlay */}
            <div className="lg:col-span-2">
              <div 
                ref={mapRef}
                className="relative w-full h-[600px] rounded-lg border overflow-hidden bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/664674bea_image.png')`,
                  backgroundSize: 'cover'
                }}
              >
                {/* Semi-transparent overlay for better contrast */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Campus boundary outline */}
                <div className="absolute inset-4 border-2 border-orange-400/60 rounded-lg pointer-events-none"></div>

                {/* Density Hotspots */}
                {densityData.map((hotspot, index) => {
                  const colors = getSafetyColor(hotspot.safetyLevel, hotspot.densityPercent);
                  const { x, y } = coordToPixel(hotspot.lat, hotspot.lng);
                  const isHovered = hoveredHotspotId === hotspot.id;
                  
                  return (
                    <motion.div
                      key={hotspot.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isHovered ? 1.2 : 1 
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
                      className="absolute cursor-pointer z-10"
                      style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
                      onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                      onMouseLeave={() => setHoveredHotspotId(null)}
                      onClick={() => setSelectedHotspot(hotspot)}
                    >
                      {/* Heatmap pulse circle */}
                      <div 
                        className={`w-16 h-16 ${colors.bg} rounded-full opacity-40 animate-pulse`}
                        style={{
                          transform: `scale(${0.8 + (hotspot.densityPercent / 100)})`,
                        }}
                      />
                      {/* Secondary ring for high activity areas */}
                      {hotspot.densityPercent > 60 && (
                        <div 
                          className={`absolute top-1/2 left-1/2 w-24 h-24 ${colors.bg} rounded-full opacity-20 animate-ping`}
                          style={{ transform: 'translate(-50%, -50%)' }}
                        />
                      )}
                      {/* Center dot with location info */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className={`w-4 h-4 ${colors.bg} rounded-full border-2 border-white shadow-lg`} />
                        {/* Location label */}
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-lg whitespace-nowrap">
                          {hotspot.name}
                        </div>
                      </div>
                      
                      {/* Safe zone indicator */}
                      {showSafeZones && hotspot.safetyLevel === 'high' && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-3 border-green-400/60 rounded-full animate-pulse" />
                      )}
                    </motion.div>
                  );
                })}

                {/* Selected hotspot info overlay */}
                {selectedHotspot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border z-20"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{selectedHotspot.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedHotspot.currentDensity} people • {selectedHotspot.densityPercent}% capacity
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getSafetyColor(selectedHotspot.safetyLevel).text} ${getSafetyColor(selectedHotspot.safetyLevel).border} bg-white`}>
                            {getSafetyIcon(selectedHotspot.safetyLevel)}
                            <span className="ml-1">{selectedHotspot.safetyLevel} safety</span>
                          </Badge>
                          {selectedHotspot.safetyLevel === 'high' && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Recommended for trades
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedHotspot(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
                  <h5 className="font-semibold text-sm mb-2">Activity Level</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>High - Safe for trades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium - Use caution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Low - Avoid for trades</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Live Activity</h3>
                {lastUpdate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(lastUpdate)}
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {densityData
                  .sort((a, b) => b.densityPercent - a.densityPercent)
                  .map((hotspot) => {
                    const colors = getSafetyColor(hotspot.safetyLevel);
                    return (
                      <motion.div
                        key={hotspot.id}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border ${colors.border} cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedHotspot?.id === hotspot.id ? 'bg-orange-50 border-orange-200' : 'bg-white'
                        }`}
                        onClick={() => setSelectedHotspot(hotspot)}
                        onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                        onMouseLeave={() => setHoveredHotspotId(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={colors.text}>
                              {getSafetyIcon(hotspot.safetyLevel)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{hotspot.name}</p>
                              <p className="text-xs text-gray-600">
                                {hotspot.currentDensity} people
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline" 
                              className={`${colors.text} ${colors.border} text-xs`}
                            >
                              {hotspot.densityPercent}%
                            </Badge>
                            {hotspot.safetyLevel === 'high' && (
                              <div className="text-xs text-green-600 mt-1">✓ Trade Safe</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                })}
              </div>

              {/* Safe Zones Summary */}
              {showSafeZones && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm text-green-800">Safe Trade Zones</span>
                    </div>
                    <p className="text-xs text-green-700">
                      {safeZones.length} high-activity areas currently recommended for safe transactions
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      • Well-lit areas with security presence<br/>
                      • High foot traffic for safety<br/>
                      • Multiple exit routes available
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
