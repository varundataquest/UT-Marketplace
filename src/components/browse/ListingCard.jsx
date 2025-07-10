
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Star, MessageCircle, MapPin, HandCoins } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PriceComparisonWidget from "../smartprice/PriceComparisonWidget";

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

const conditionColors = {
  new: "bg-green-100 text-green-800",
  like_new: "bg-blue-100 text-blue-800",
  good: "bg-yellow-100 text-yellow-800",
  fair: "bg-orange-100 text-orange-800",
  poor: "bg-red-100 text-red-800"
};

export default function ListingCard({ listing, viewMode = "grid" }) {
  const isSold = listing.status === 'sold';

  if (viewMode === "list") {
    return (
      <Card className={`glass-effect border-0 hover-lift overflow-hidden ${isSold ? 'opacity-75' : ''}`}>
        <CardContent className="p-0">
          <div className="flex">
            <div className="w-48 h-full flex-shrink-0 relative">
              <Link to={createPageUrl(`ListingDetail/${listing.id}`)} className="absolute inset-0 z-10">
                <span className="sr-only">View {listing.title}</span>
              </Link>
              {listing.images && listing.images[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-orange-600 text-3xl">📦</div>
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                    SOLD
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <Link to={createPageUrl(`ListingDetail/${listing.id}`)}>
                  <h3 className={`font-semibold text-lg text-gray-900 line-clamp-1 hover:text-orange-600 transition-colors ${isSold ? 'line-through' : ''}`}>
                    {listing.title}
                  </h3>
                </Link>
                <span className={`text-2xl font-bold text-orange-600 ml-4 ${isSold ? 'line-through' : ''}`}>
                  ${listing.price}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-2 mb-3">
                {listing.description}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={categoryColors[listing.category] || categoryColors.other}>
                  {listing.category?.replace('_', ' ')}
                </Badge>
                <Badge className={conditionColors[listing.condition]}>
                  {listing.condition?.replace('_', ' ')}
                </Badge>
              </div>
              
              {/* SmartPrice Widget */}
              {listing.confidence_score && !isSold && (
                <div className="mb-3">
                  <PriceComparisonWidget listing={listing} />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {listing.likes || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    4.9
                  </div>
                </div>
                {!isSold && (
                  <div className="flex gap-2 z-20 relative">
                    <Button size="sm" variant="outline" className="border-orange-200 hover:border-orange-300">
                      <HandCoins className="w-4 h-4 mr-1" />
                      Negotiate
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-effect border-0 hover-lift overflow-hidden group ${isSold ? 'opacity-75' : ''}`}>
      <Link to={createPageUrl(`ListingDetail/${listing.id}`)} className="z-10 absolute inset-0">
         <span className="sr-only">View {listing.title}</span>
      </Link>
      <div className="relative aspect-square overflow-hidden">
        {listing.images && listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <div className="text-orange-600 text-5xl">📦</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-red-600 text-white text-xl px-6 py-3">
              SOLD
            </Badge>
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <Badge className={categoryColors[listing.category] || categoryColors.other}>
            {listing.category?.replace('_', ' ')}
          </Badge>
        </div>
        
        {!isSold && (
          <>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors cursor-pointer" />
            </div>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm border-orange-200 hover:border-orange-300">
                  <HandCoins className="w-4 h-4 mr-1" />
                  Negotiate
                </Button>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <Link to={createPageUrl(`ListingDetail/${listing.id}`)}>
          <h3 className={`font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors ${isSold ? 'line-through' : ''}`}>
            {listing.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {listing.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-2xl font-bold text-orange-600 ${isSold ? 'line-through' : ''}`}>
            ${listing.price}
          </span>
          <Badge className={conditionColors[listing.condition]}>
            {listing.condition?.replace('_', ' ')}
          </Badge>
        </div>
        
        {/* SmartPrice Widget */}
        {listing.confidence_score && !isSold && (
          <div className="mb-3">
            <PriceComparisonWidget listing={listing} />
          </div>
        )}
        
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
        {listing.meetup_preference && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {listing.meetup_preference.replace('_', ' ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
