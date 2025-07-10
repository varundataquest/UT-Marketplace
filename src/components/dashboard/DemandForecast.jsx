import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { demandForecasting } from '@/api/functions';

export default function DemandForecast({ category, onCategoryChange }) {
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || 'Textbooks');

  const categories = [
    'Textbooks', 'Electronics', 'Furniture', 'Clothing & Accessories',
    'Dorm Essentials', 'School Supplies', 'Sports & Outdoors', 'Transportation'
  ];

  useEffect(() => {
    if (selectedCategory) {
      loadForecast(selectedCategory);
    }
  }, [selectedCategory]);

  const loadForecast = async (cat) => {
    setIsLoading(true);
    try {
      const { data } = await demandForecasting({ 
        category: cat,
        timeRange: '6months'
      });
      setForecastData(data);
    } catch (error) {
      console.error('Failed to load demand forecast:', error);
    }
    setIsLoading(false);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'border-green-200 bg-green-50 text-green-800';
      case 'decreasing': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getMonthName = (monthNum) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNum - 1] || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-ut-orange" />
          Demand Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 
                "bg-ut-orange hover:bg-orange-700 text-black border border-black" : 
                "border border-black text-black hover:bg-gray-100"
              }
            >
              {cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-ut-orange border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-gray-600">Analyzing demand patterns...</p>
          </div>
        ) : forecastData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Forecast */}
            <Card className={`border-2 ${getTrendColor(forecastData.forecast.trend)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(forecastData.forecast.trend)}
                    <span className="font-semibold capitalize">{forecastData.forecast.trend} Demand</span>
                  </div>
                  <Badge variant="outline">
                    {Math.round(forecastData.forecast.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                <p className="text-sm mb-2">{forecastData.forecast.recommendation}</p>
                
                {forecastData.forecast.peakMonth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Peak demand in {getMonthName(forecastData.forecast.peakMonth)} 
                      ({forecastData.forecast.monthsUntilPeak} month{forecastData.forecast.monthsUntilPeak !== 1 ? 's' : ''} away)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Data */}
            {forecastData.historicalData.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {forecastData.historicalData.slice(-6).map((dataPoint, index) => (
                    <div key={dataPoint.month} className="flex justify-between items-center p-2 rounded bg-gray-50">
                      <span className="text-sm">{dataPoint.month.replace('-', ' ')}</span>
                      <Badge variant="outline">{dataPoint.volume} listings</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Insights */}
            {forecastData.forecast.trend === 'increasing' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Opportunity Alert!</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {selectedCategory} items are in high demand. Consider listing yours now for faster sales!
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No forecast data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}