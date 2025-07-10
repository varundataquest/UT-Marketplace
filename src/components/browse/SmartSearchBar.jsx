import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const suggestedSearches = [
  "dorm decor",
  "textbooks for engineering",
  "gaming setup",
  "study desk",
  "mini fridge",
  "concert tickets"
];

export default function SmartSearchBar({ onSearch, isSearching }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestedSearch = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="space-y-4">
      <Card className="glass-effect border-0 shadow-lg p-6">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for? (e.g., 'textbooks for chemistry')"
              className="pl-12 py-3 text-lg rounded-xl border-orange-200 focus:border-orange-400 focus:ring-orange-200"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="gradient-orange text-white px-6 py-3 rounded-xl hover-lift font-semibold"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Smart Search
              </>
            )}
          </Button>
        </form>

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSearches.map((search) => (
              <Badge
                key={search}
                variant="outline"
                className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
                onClick={() => handleSuggestedSearch(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}