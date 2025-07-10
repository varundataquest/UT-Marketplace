
import React, { useState, useEffect } from 'react';
import { Listing } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShoppingBag, ArrowRight, Tag, BookOpen, Sofa, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ListingCard from '../components/listings/ListingCard';
import ListingDetailModal from '../components/listings/ListingDetailModal';

const categoryHighlights = [
    { name: 'Textbooks', icon: BookOpen, color: 'bg-orange-100 text-orange-800' },
    { name: 'Furniture', icon: Sofa, color: 'bg-orange-200 text-orange-900' },
    { name: 'Electronics', icon: Sparkles, color: 'bg-orange-300 text-orange-900' },
    { name: 'Other', icon: Tag, color: 'bg-orange-400 text-white' },
];

export default function Dashboard() {
    const [recentListings, setRecentListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [startContact, setStartContact] = useState(false);
    const [startTrade, setStartTrade] = useState(false);

    useEffect(() => {
        const fetchRecentListings = async () => {
            setIsLoading(true);
            try {
                const listings = await Listing.filter({ status: 'active' }, '-created_date', 8);
                setRecentListings(listings);
            } catch (error) {
                console.error("Failed to fetch recent listings:", error);
            }
            setIsLoading(false);
        };
        fetchRecentListings();
    }, []);

    const handleViewListing = (listing, options = {}) => {
        setSelectedListing(listing);
        setStartContact(options.openContact || false);
        setStartTrade(options.openTrade || false);
    };

    const handleCloseModal = () => {
        setSelectedListing(null);
        setStartContact(false);
        setStartTrade(false);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-white">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white rounded-2xl p-8 md:p-16 border-2 border-orange-200 shadow-lg"
            >
                <div className="flex justify-center mb-6">
                    <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a141211e4_image.png"
                        alt="Hook Em Horns"
                        className="h-20 md:h-32 opacity-90"
                    />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-[#DF6F1D] leading-tight mb-4">
                    Welcome to the Longhorn Exchange
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-orange-800 font-medium">
                    The official marketplace for UT Austin students. Buy, sell, and trade with your fellow Longhorns safely and easily.
                </p>
                <p className="text-[#DF6F1D] font-bold mt-2">🤘 Hook 'em Horns! 🤘</p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link to={createPageUrl('CreateListing')}>
                        <Button size="lg" className="bg-[#DF6F1D] hover:bg-orange-700 text-white shadow-lg font-bold text-base">
                            <ShoppingBag className="mr-2 h-5 w-5" /> Start Selling
                        </Button>
                    </Link>
                    <Link to={createPageUrl('Browse')}>
                        <Button size="lg" variant="outline" className="bg-transparent hover:bg-orange-100 text-[#DF6F1D] border-2 border-[#DF6F1D] shadow-lg font-bold text-base">
                            Browse Listings <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Category Highlights */}
            <div className="space-y-4">
                 <h2 className="text-2xl font-bold text-orange-900">Shop by Category</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryHighlights.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                        <Link to={createPageUrl(`Browse?category=${cat.name}`)}>
                            <div className="group flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-orange-200 hover:border-[#DF6F1D] hover:shadow-lg transition-all duration-300">
                                <div className={`p-3 rounded-lg ${cat.color}`}>
                                    <cat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-orange-900 group-hover:text-[#DF6F1D]">{cat.name}</h3>
                                </div>
                            </div>
                        </Link>
                        </motion.div>
                    ))}
                 </div>
            </div>

            {/* Recent Listings */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-orange-900">Fresh from Fellow Longhorns</h2>
                    <Link to={createPageUrl('Browse')}>
                        <Button variant="ghost" className="text-[#DF6F1D] hover:text-orange-700 hover:bg-orange-100 font-medium">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                           <div key={i} className="bg-white rounded-lg border-2 border-orange-200 p-4 space-y-3 animate-pulse">
                               <div className="h-40 bg-orange-100 rounded"></div>
                               <div className="h-4 bg-orange-200 w-3/4 rounded"></div>
                               <div className="h-6 bg-orange-200 w-1/2 rounded"></div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recentListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onView={handleViewListing}
                            />
                        ))}
                    </div>
                )}
                 { !isLoading && recentListings.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-orange-200">
                        <p className="text-orange-700">No listings yet. Be the first Longhorn to sell something!</p>
                    </div>
                 )}
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
