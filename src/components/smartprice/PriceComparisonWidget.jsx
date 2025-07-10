import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PriceComparisonWidget({ listing }) {
  if (!listing.confidence_score) return null;

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

  const confidenceBadge = getConfidenceBadge(listing.confidence_score);
  const IconComponent = confidenceBadge.icon;

  return (
    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-800 font-medium">SmartPrice</span>
      </div>
      <Badge className={confidenceBadge.color + " text-xs"}>
        {listing.confidence_score}% - {confidenceBadge.text}
      </Badge>
    </div>
  );
}