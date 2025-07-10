import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Eye, Heart, Star, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const categoryColors = {
  textbooks: "bg-blue-100 text-blue-800",
  electronics: "bg-purple-100 text-purple-800",
  furniture: "bg-green-100 text-green-800",
  clothing: "bg-pink-100 text-pink-800",
  dorm_essentials: "bg-orange-100 text-orange-800",
  school_supplies: "bg-indigo-100 text-indigo-800",
  sports_equipment: "bg-red-100 text-red-800",
  transportation: "bg-yellow-100 text-yellow-800",
  tickets: "bg-cyan-100 text-cyan-800",
  other: "bg-gray-100 text-gray-800"
};

export default function FeaturedListings({ listings, isLoading }) {
  const displayListings = listings.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Featured Listings</CardTitle>
              <p className="text-gray-600 mt-1">Newest items from your fellow Longhorns</p>
            </div>
            <Link to={createPageUrl("Browse")}>
              <Button variant="outline" className="border-orange-200 hover:border-orange-300 hover-lift">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="glass-effect border-0 hover-lift overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <div className="text-orange-600 text-4xl">📦</div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className={categoryColors[listing.category] || categoryColors.other}>
                          {listing.category?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-orange-600">
                          ${listing.price}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {listing.condition}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.views || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {listing.likes || 0}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}