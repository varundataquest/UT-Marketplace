
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Eye, Phone, ArrowLeftRight, Calendar, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function ListingCard({ listing, onView, showTradeButton = true }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [viewCount, setViewCount] = useState(listing.views || 0);
    const isSold = listing.status === 'sold';

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch (error) {
                setCurrentUser(null);
            }
        };
        loadUser();
    }, []);

    const handleCardClick = (e) => {
        if (e.target.closest('button')) {
            return;
        }
        
        // Increment view count when card is clicked
        setViewCount(prev => prev + 1);
        
        // Update view count in database (fire and forget)
        Listing.update(listing.id, { views: viewCount + 1 }).catch(console.error);
        
        onView(listing);
    };

    const copyLinkToClipboard = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Clipboard fallback failed:', err);
            alert('Could not copy link. You can manually copy it from the address bar.');
        }
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        const shareData = {
            title: listing.title,
            text: `Check out this item on Longhorn Exchange: ${listing.title} - $${listing.price}`,
            url: window.location.origin + createPageUrl(`Browse?listing=${listing.id}`)
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                // If sharing fails for any reason other than the user canceling it
                // (e.g., Permission Denied in an iframe), fall back to copying the link.
                if (error.name !== 'AbortError') {
                    console.warn('Web Share API failed, falling back to clipboard:', error);
                    copyLinkToClipboard(shareData.url);
                }
            }
        } else {
            // Fallback for browsers that don't support the Web Share API at all.
            copyLinkToClipboard(shareData.url);
        }
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toLocaleString();
        }
        return parseFloat(price || 0).toLocaleString();
    };

    const canTrade = currentUser && currentUser.email !== listing.seller_email;

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(223, 111, 29, 0.2), 0 4px 6px -4px rgba(223, 111, 29, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            className={`h-full group cursor-pointer ${isSold ? 'opacity-60' : ''}`}
            onClick={handleCardClick}
        >
            <Card className="h-full overflow-hidden flex flex-col border-2 border-orange-200 hover:border-[#DF6F1D] transition-all duration-300 bg-white shadow-md hover:shadow-xl">
                <div className="relative aspect-video">
                    {listing.images && listing.images[0] ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isSold ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-400">
                            <span>No Image</span>
                        </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full"
                            onClick={handleShare}
                            title="Share this listing"
                        >
                            <Share2 className="w-4 h-4 text-gray-600" />
                        </Button>
                    </div>
                    
                     {isSold && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge className="bg-red-600 text-white text-lg px-4 py-2">SOLD</Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-4 flex-grow flex flex-col">
                    <div className="flex-grow">
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-orange-900 line-clamp-2 leading-snug group-hover:text-[#DF6F1D]">
                                {listing.title}
                            </h3>
                            <p className="text-lg font-bold text-[#DF6F1D] whitespace-nowrap">
                                ${formatPrice(listing.price)}
                            </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="border-orange-300 text-orange-700">{listing.category}</Badge>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">{listing.condition}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-orange-600 mt-2">
                            <span className="flex items-center gap-1" title="Views">
                                <Eye className="w-3 h-3"/> {viewCount}
                            </span>
                            <span className="flex items-center gap-1" title={format(new Date(listing.created_date), 'PPpp')}>
                                <Calendar className="w-3 h-3"/> {format(new Date(listing.created_date), 'MMM d, h:mm a')}
                            </span>
                        </div>
                    </div>
                    {!isSold && (
                        <div className="mt-4 flex gap-2">
                            <Button 
                                size="sm" 
                                className="flex-1 text-white font-bold bg-[#DF6F1D] hover:bg-orange-700" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onView(listing, { openContact: true }); 
                                }}
                            >
                                <Phone className="w-4 h-4 mr-2"/> Contact
                            </Button>
                            {showTradeButton && canTrade && (
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 bg-transparent hover:bg-orange-100 text-[#DF6F1D] border-2 border-[#DF6F1D] font-bold"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onView(listing, { openTrade: true }); 
                                    }}
                                >
                                    <ArrowLeftRight className="w-4 h-4 mr-2"/> Trade
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
