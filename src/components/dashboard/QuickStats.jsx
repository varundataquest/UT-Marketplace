import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function QuickStats({ listings, isLoading }) {
  const totalListings = listings.length;
  const totalValue = listings.reduce((sum, listing) => sum + (listing.price || 0), 0);
  const avgPrice = totalListings > 0 ? totalValue / totalListings : 0;
  const activeTraders = new Set(listings.map(l => l.seller_id)).size;

  const stats = [
    {
      title: "Active Listings",
      value: totalListings,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Total Value",
      value: `$${totalValue.toFixed(0)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Average Price",
      value: `$${avgPrice.toFixed(0)}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      title: "Active Traders",
      value: activeTraders,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-effect hover-lift border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}