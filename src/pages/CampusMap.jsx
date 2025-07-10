
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Users, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const meetupLocations = [
  {
    id: "pcl",
    name: "Perry-Castañeda Library (PCL)",
    description: "Main library with multiple floors, study areas, and high security",
    safety_rating: 5,
    hours: "24/7 (varies by floor)",
    crowd_level: "Very High",
    features: ["Security cameras", "24/7 access", "Multiple floors", "High foot traffic", "Security desk"],
    coordinates: { lat: 30.2849, lng: -97.7341 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8fdd707a2_Screenshot2025-07-05at91450AM.png"
  },
  {
    id: "tower",
    name: "UT Tower & Main Mall",
    description: "Iconic UT Tower area with open mall space and high visibility",
    safety_rating: 5,
    hours: "Dawn to Dusk",
    crowd_level: "Very High",
    features: ["Landmark location", "Open space", "High visibility", "Tourist area", "Well-lit"],
    coordinates: { lat: 30.2862, lng: -97.7394 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9ac193a78_University_of_Texas_at_Austin_August_2019_39_Main_Building.jpg"
  },
  {
    id: "union",
    name: "Student Activity Center (SAC)",
    description: "Student union building with food court and study areas",
    safety_rating: 5,
    hours: "6:00 AM - 12:00 AM",
    crowd_level: "Very High",
    features: ["Food court", "Multiple entrances", "Security presence", "Student services"],
    coordinates: { lat: 30.2866, lng: -97.7420 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2dbaa8a5f_Screenshot2025-07-05at92212AM.png"
  },
  {
    id: "gregory_gym",
    name: "Gregory Gymnasium",
    description: "Main recreational facility with high student traffic",
    safety_rating: 5,
    hours: "5:30 AM - 12:00 AM",
    crowd_level: "High",
    features: ["Security cameras", "Staff present", "High traffic", "Multiple entrances"],
    coordinates: { lat: 30.2826, lng: -97.7370 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5107af64b_Screenshot2025-07-05at91514AM.png"
  },
  {
    id: "jester",
    name: "Jester Residence Halls",
    description: "Large residence hall complex with dining and common areas",
    safety_rating: 4,
    hours: "24/7 (common areas)",
    crowd_level: "High",
    features: ["Residential area", "Dining facilities", "Common areas", "Student traffic"],
    coordinates: { lat: 30.2900, lng: -97.7370 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/82b69da38_Screenshot2025-07-05at92404AM.png"
  },
  {
    id: "kinsolving",
    name: "Kinsolving Residence Hall",
    description: "Residence hall with dining facilities and common spaces",
    safety_rating: 4,
    hours: "24/7 (common areas)",
    crowd_level: "Medium",
    features: ["Dining hall", "Common areas", "Residential security", "Student traffic"],
    coordinates: { lat: 30.2890, lng: -97.7320 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f2fecd42f_Screenshot2025-07-05at92309AM.png"
  },
  {
    id: "flawn",
    name: "Flawn Academic Center",
    description: "Academic building with study spaces and classrooms",
    safety_rating: 4,
    hours: "7:00 AM - 11:00 PM",
    crowd_level: "High",
    features: ["Academic building", "Study spaces", "Security cameras", "High student traffic"],
    coordinates: { lat: 30.2855, lng: -97.7365 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cd7e56e3d_Screenshot2025-07-05at92251AM.png"
  },
  {
    id: "commons",
    name: "Jester City Limits (JCL)",
    description: "Popular dining location with multiple restaurants",
    safety_rating: 5,
    hours: "7:00 AM - 12:00 AM",
    crowd_level: "Very High",
    features: ["Multiple restaurants", "High foot traffic", "Central location", "Well-lit"],
    coordinates: { lat: 30.2895, lng: -97.7375 },
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6ff3feec4_Screenshot2025-07-05at92200AM.png"
  }
];

const safetyTips = [
  "Always meet in well-lit, public areas",
  "Bring a friend when possible",
  "Meet during daylight hours",
  "Trust your instincts - if something feels off, leave",
  "Let someone know where you're going",
  "Keep transactions simple and quick"
];

export default function CampusMap() {
  const [selectedLocation, setSelectedLocation] = useState(meetupLocations[0]);

  const getSafetyColor = (rating) => {
    if (rating >= 5) return "bg-green-100 text-green-800";
    if (rating >= 4) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getCrowdColor = (level) => {
    switch (level) {
      case "Very High": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getGoogleMapsUrl = (location) => {
    const { lat, lng } = location.coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${location.name}`;
  };

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            <span className="text-orange-600">Safe Meetup</span> Locations
          </h1>
          <p className="text-gray-600">Recommended UT Austin campus locations for completing your trades safely</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Location Cards */}
          <div className="lg:col-span-2 space-y-4">
            {meetupLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`glass-effect border-0 shadow-lg hover-lift cursor-pointer transition-all ${
                    selectedLocation?.id === location.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex">
                    <div className="w-1/3">
                      <img
                        src={location.image}
                        alt={location.name}
                        className="w-full h-full object-cover rounded-l-lg"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {location.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {location.description}
                          </p>
                        </div>
                        <Badge className={getSafetyColor(location.safety_rating)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {location.safety_rating}/5
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {location.hours}
                        </Badge>
                        <Badge className={getCrowdColor(location.crowd_level)}>
                          <Users className="w-3 h-3 mr-1" />
                          {location.crowd_level} traffic
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {location.features.slice(0, 3).map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {location.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{location.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Location Details */}
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {selectedLocation.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedLocation.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Safety Rating:</span>
                        <Badge className={getSafetyColor(selectedLocation.safety_rating)}>
                          {selectedLocation.safety_rating}/5
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Operating Hours:</span>
                        <span className="font-medium">{selectedLocation.hours}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Crowd Level:</span>
                        <Badge className={getCrowdColor(selectedLocation.crowd_level)}>
                          {selectedLocation.crowd_level}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Safety Features:</h4>
                      <div className="space-y-1">
                        {selectedLocation.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black border border-black"
                      onClick={() => window.open(getGoogleMapsUrl(selectedLocation), '_blank')}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Safety Tips */}
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="glass-effect border-0 shadow-lg bg-red-50 border-red-100">
              <CardHeader>
                <CardTitle className="text-red-800">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium text-red-800">Local Police:</div>
                  <div className="text-red-700">911</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-red-800">Non-Emergency:</div>
                  <div className="text-red-700">311</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
