import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw } from "lucide-react";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "textbooks", label: "Textbooks" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "dorm_essentials", label: "Dorm Essentials" },
  { value: "school_supplies", label: "School Supplies" },
  { value: "sports_equipment", label: "Sports Equipment" },
  { value: "transportation", label: "Transportation" },
  { value: "tickets", label: "Tickets" },
  { value: "other", label: "Other" }
];

const conditions = [
  { value: "all", label: "All Conditions" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" }
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" }
];

export default function FilterPanel({ filters, onFiltersChange, totalResults }) {
  const resetFilters = () => {
    onFiltersChange({
      category: "all",
      condition: "all",
      priceRange: [0, 1000],
      sortBy: "newest"
    });
  };

  return (
    <Card className="glass-effect border-0 shadow-lg sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-orange-600" />
          Filters
        </CardTitle>
        <p className="text-sm text-gray-600">{totalResults} items found</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            Category
          </label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            Condition
          </label>
          <Select
            value={filters.condition}
            onValueChange={(value) => onFiltersChange({ ...filters, condition: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            Price Range
          </label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
              max={1000}
              min={0}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            Sort By
          </label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters */}
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full hover:bg-orange-50 hover:border-orange-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}