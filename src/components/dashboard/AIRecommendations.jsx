import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function AIRecommendations({ recommendations, userMajor }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-effect border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">AI Recommendations</CardTitle>
              <p className="text-gray-600">Personalized picks for {userMajor} students</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="glass-effect border-0 hover-lift overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video w-full">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <div className="text-purple-600 text-4xl">🎯</div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-500 text-white shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Pick
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                        ${item.price}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-start gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.ai_reason}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-100 text-purple-800">
                        {item.category?.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Perfect for {userMajor}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}