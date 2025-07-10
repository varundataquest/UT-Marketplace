import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Brain,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartPriceAnalyzer({ listing, onNegotiate }) {
  const [priceAnalysis, setPriceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (listing && !priceAnalysis) {
      analyzePricing();
    }
  }, [listing]);

  const analyzePricing = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `Analyze this marketplace listing for price fairness and generate market insights:

Item: "${listing.title}"
Description: "${listing.description}"
Listed Price: $${listing.price}
Condition: ${listing.condition}
Category: ${listing.category}

Please provide:
1. Estimated market price range (min, max) based on condition and typical retail prices
2. Price confidence score (0-100%) based on condition and market comparison
3. Fair negotiation range considering condition depreciation
4. Whether this price should be flagged as potentially overpriced (>200% typical market value)
5. Brief market analysis and factors affecting price
6. Suggested negotiation talking points for buyers

Consider:
- Item condition impact on value
- Shipping costs buyers save by buying locally
- Campus convenience premium
- Market demand for this category
- Typical depreciation for used items`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            market_price_min: { type: "number" },
            market_price_max: { type: "number" },
            confidence_score: { type: "number" },
            fair_negotiation_min: { type: "number" },
            fair_negotiation_max: { type: "number" },
            price_flagged: { type: "boolean" },
            market_analysis: { type: "string" },
            value_factors: {
              type: "array",
              items: { type: "string" }
            },
            negotiation_points: {
              type: "array", 
              items: { type: "string" }
            },
            recommendation: { type: "string" }
          }
        }
      });

      setPriceAnalysis(result);

    } catch (error) {
      console.error("Price analysis error:", error);
      setError("Unable to analyze pricing at this time. Please try again later.");
    }

    setIsAnalyzing(false);
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (score) => {
    if (score >= 80) return { text: "Great Deal", color: "bg-green-100 text-green-800", icon: CheckCircle2 };
    if (score >= 60) return { text: "Fair Price", color: "bg-yellow-100 text-yellow-800", icon: TrendingUp };
    return { text: "Overpriced", color: "bg-red-100 text-red-800", icon: AlertTriangle };
  };

  if (isAnalyzing) {
    return (
        <Card className="bg-blue-50/50">
            <CardContent className="p-6 text-center">
                <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4"/>
                <p className="font-semibold text-blue-800">Analyzing Market Price...</p>
                <p className="text-sm text-blue-600">Our AI is comparing this listing to thousands of data points.</p>
            </CardContent>
        </Card>
    )
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  }

  if (!priceAnalysis) return null;

  const confidenceBadge = getConfidenceBadge(priceAnalysis.confidence_score);
  const IconComponent = confidenceBadge.icon;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
                <Brain className="w-6 h-6"/>
                SmartPrice AI Analysis
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="text-center">
                <p className="text-sm text-gray-600">AI Price Confidence</p>
                <p className={`text-4xl font-bold ${getConfidenceColor(priceAnalysis.confidence_score)}`}>
                    {priceAnalysis.confidence_score}%
                </p>
                <Progress value={priceAnalysis.confidence_score} className="mt-2 h-2"/>
                 <Badge className={`mt-3 ${confidenceBadge.color}`}>
                    <IconComponent className="w-4 h-4 mr-1" />
                    {confidenceBadge.text}
                </Badge>
            </div>

            <div className="text-sm space-y-3">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Market Range:</span>
                    <span className="font-bold text-gray-900">${priceAnalysis.market_price_min} - ${priceAnalysis.market_price_max}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Fair Negotiation:</span>
                    <span className="font-bold text-gray-900">${priceAnalysis.fair_negotiation_min} - ${priceAnalysis.fair_negotiation_max}</span>
                </div>
            </div>

            <div>
                <h4 className="font-semibold mb-2">Market Insights</h4>
                <p className="text-xs text-gray-600 bg-white/50 p-3 rounded-md">{priceAnalysis.market_analysis}</p>
            </div>

            <div>
                <Button className="w-full bg-ut-orange hover:bg-orange-700" onClick={() => onNegotiate(priceAnalysis.negotiation_points[0], priceAnalysis.fair_negotiation_min)}>
                    <MessageCircle className="w-4 h-4 mr-2"/> Negotiate with AI Helper
                </Button>
            </div>
        </CardContent>
    </Card>
  )
}