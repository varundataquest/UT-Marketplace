
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Listing } from '@/api/entities';
import ListingCard from '../components/listings/ListingCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ListingDetailModal from '../components/listings/ListingDetailModal';
import DemandForecast from '../components/dashboard/DemandForecast';

const categories = [
    "Textbooks", "Electronics", "Furniture", "Clothing & Accessories", "Dorm Essentials",
    "School Supplies", "Sports & Outdoors", "Transportation", "Tickets & Events", "Other"
];
const conditions = ["New", "Like New", "Good", "Fair", "Used"];
const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Browse() {
    const query = useQuery();
    const [allListings, setAllListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [startContact, setStartContact] = useState(false);
    const [startTrade, setStartTrade] = useState(false);

    const [searchTerm, setSearchTerm] = useState(query.get('search') || '');
    const [category, setCategory] = useState(query.get('category') || 'all');
    const [condition, setCondition] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [sortBy, setSortBy] = useState('newest');
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showSold, setShowSold] = useState(false); // Add state for sold items

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const listings = await Listing.list();
            // Store all listings, filtering by status will happen in useMemo
            setAllListings(listings);
        } catch (error) {
            console.error("Failed to fetch listings:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchListings(); // Initial fetch of all listings

        const listingId = query.get('listing');
        if (listingId) {
            const fetchAndShowListing = async () => {
                try {
                    const listingToShow = await Listing.get(listingId);
                    if (listingToShow) {
                        handleViewListing(listingToShow);
                    }
                } catch (error) {
                    console.error("Failed to fetch shared listing:", error);
                }
            };
            fetchAndShowListing();
        }
    }, []); // Empty dependency array means this runs once on mount

    const handleViewListing = (listing, options = {}) => {
        setSelectedListing(listing);
        setStartContact(options.openContact || false);
        setStartTrade(options.openTrade || false);
    };

    const handleCloseModal = (shouldRefresh = false) => { // Added shouldRefresh parameter
        setSelectedListing(null);
        setStartContact(false);
        setStartTrade(false);
        if (shouldRefresh) { // If true, re-fetch listings (e.g., after a status change in modal)
            fetchListings();
        }
    };

    const filteredListings = useMemo(() => {
        let listings = [...allListings]; // Start with all fetched listings

        // Filter based on showSold toggle first
        listings = showSold
            ? listings.filter(listing => listing.status === 'sold')
            : listings.filter(listing => listing.status === 'active');

        if (searchTerm) {
            listings = listings.filter(l =>
                l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (category !== 'all') {
            listings = listings.filter(l => l.category === category);
        }
        if (condition !== 'all') {
            listings = listings.filter(l => l.condition === condition);
        }
        listings = listings.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

        switch (sortBy) {
            case 'price_asc':
                listings.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                listings.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                listings.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                break;
        }

        return listings;
    }, [allListings, searchTerm, category, condition, priceRange, sortBy, showSold]); // Add showSold as dependency

    const resetFilters = () => {
        setSearchTerm('');
        setCategory('all');
        setCondition('all');
        setPriceRange([0, 1000]);
        setSortBy('newest');
        if (isMobile) {
            setShowFiltersMobile(false);
        }
    }

    const toggleFiltersMobile = () => {
        setShowFiltersMobile(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-white p-4 lg:p-8">
            <div className="max-w-screen-xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
                     <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#DF6F1D]">
                                {showSold ? 'Sold Items' : 'Browse Listings'}
                            </h1>
                            <Button
                                onClick={() => setShowSold(!showSold)}
                                variant="outline"
                                className="border-2 border-[#DF6F1D] text-[#DF6F1D] hover:bg-orange-100"
                            >
                                {showSold ? 'Show Active' : 'Show Sold'}
                            </Button>
                        </div>
                        <p className="text-gray-600">{filteredListings.length} results found</p>
                    </div>
                    <div className="w-full md:w-auto flex items-center gap-4">
                        <div className="relative flex-grow">
                            <Input
                                placeholder="Search listings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12 text-base border-2 border-orange-200 focus:border-[#DF6F1D] rounded-lg"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <Button
                            onClick={toggleFiltersMobile}
                            className="md:hidden bg-[#DF6F1D] hover:bg-orange-700 text-white font-bold flex items-center gap-2"
                        >
                            <SlidersHorizontal className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    {(!isMobile || showFiltersMobile) && (
                        <aside className={`${isMobile ? 'fixed inset-0 z-50 bg-white p-6' : 'w-1/4 lg:w-1/5'} space-y-6`}>
                            {isMobile && (
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-[#DF6F1D] flex items-center gap-2">
                                        <SlidersHorizontal className="w-5 h-5"/>
                                        Filters
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleFiltersMobile}
                                        className="p-0 h-auto"
                                    >
                                        <X className="w-6 h-6"/>
                                    </Button>
                                </div>
                            )}

                            {!isMobile && (
                                <h2 className="text-xl font-bold text-[#DF6F1D] flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5"/>
                                    Filters
                                </h2>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="border-2 border-orange-200 focus:border-[#DF6F1D]">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Condition</label>
                                    <Select value={condition} onValueChange={setCondition}>
                                        <SelectTrigger className="border-2 border-orange-200 focus:border-[#DF6F1D]">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Conditions</SelectItem>
                                            {conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Price Range</label>
                                    <div className="py-4">
                                        <Slider
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            max={1000}
                                            step={10}
                                            className="[&_.rc-slider-track]:bg-[#DF6F1D]"
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>${priceRange[0]}</span>
                                        <span>${priceRange[1] === 1000 ? '1000+' : priceRange[1]}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort By</label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="border-2 border-orange-200 focus:border-[#DF6F1D]">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DemandForecast category={category !== 'all' ? category : null} />

                                <Button
                                    onClick={resetFilters}
                                    className="w-full bg-[#DF6F1D] hover:bg-orange-700 text-white font-bold"
                                >
                                    <X className="w-4 h-4 mr-2"/>
                                    Reset Filters
                                </Button>

                                {isMobile && (
                                    <Button
                                        onClick={toggleFiltersMobile}
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold mt-4"
                                    >
                                        Apply Filters
                                    </Button>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-lg border-2 border-orange-200 p-4 space-y-3 animate-pulse">
                                        <div className="h-40 bg-orange-100 rounded"></div>
                                        <div className="h-4 bg-orange-200 w-3/4 rounded"></div>
                                        <div className="h-6 bg-orange-200 w-1/2 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredListings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map(listing => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onView={handleViewListing}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg border-2 border-orange-200">
                                <h3 className="text-xl font-semibold text-gray-800">No listings found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or search term.</p>
                                <Button
                                    onClick={resetFilters}
                                    className="mt-4 bg-[#DF6F1D] hover:bg-orange-700 text-white font-bold"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {selectedListing && (
                <ListingDetailModal
                    key={selectedListing.id}
                    listing={selectedListing}
                    onClose={handleCloseModal}
                    startContact={startContact}
                    startTrade={startTrade}
                />
            )}
        </div>
    );
}
