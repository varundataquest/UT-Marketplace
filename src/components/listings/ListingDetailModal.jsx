
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Listing } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, Eye, Star, Shield, Calendar, ArrowLeftRight, CheckCircle, DollarSign, Phone, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ARViewer from "../ar/ARViewer";
import SmartPriceAnalyzer from "../smartprice/SmartPriceAnalyzer";
import PriceHistoryChart from "../dataviz/PriceHistoryChart";
import TradeProposalModal from '../trading/TradeProposalModal';
import PaymentModal from '../payments/PaymentModal';
import ContactSellerModal from '../contact/ContactSellerModal';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ListingManagement from './ListingManagement';
import ZellePayment from '../payments/ZellePayment';

const categoryColors = {
  Textbooks: "bg-blue-100 text-blue-800",
  Electronics: "bg-purple-100 text-purple-800",
  Furniture: "bg-green-100 text-green-800",
  "Clothing & Accessories": "bg-pink-100 text-pink-800",
  "Dorm Essentials": "bg-orange-100 text-orange-800",
  "School Supplies": "bg-indigo-100 text-indigo-800",
  "Sports & Outdoors": "bg-red-100 text-red-800",
  Transportation: "bg-yellow-100 text-yellow-800",
  "Tickets & Events": "bg-cyan-100 text-cyan-800",
  Other: "bg-gray-100 text-gray-800"
};

const conditionColors = {
  New: "bg-green-100 text-green-800",
  "Like New": "bg-blue-100 text-blue-800", 
  Good: "bg-yellow-100 text-yellow-800",
  Fair: "bg-orange-100 text-orange-800",
  Used: "bg-red-100 text-red-800"
};

export default function ListingDetailModal({ listing, onClose, startContact, startTrade }) {
  const [seller, setSeller] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLoadingSeller, setIsLoadingSeller] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentListing, setCurrentListing] = useState(listing);

  useEffect(() => {
    const incrementViewCount = async () => {
        if (currentListing) {
            try {
                // We do this without waiting for it to complete to not slow down the UI
                Listing.update(currentListing.id, { views: (currentListing.views || 0) + 1 });
            } catch (error) {
                console.error("Failed to increment view count", error);
            }
        }
    };
    incrementViewCount();
  }, [listing?.id]);

  useEffect(() => {
    const loadUserAndSeller = async () => {
      setIsLoadingSeller(true);
      try {
        const user = await User.me().catch(() => null);
        setCurrentUser(user);
        
        if (currentListing) {
          const users = await User.list();
          const listingSeller = users.find(u => u.email === currentListing.seller_email);
          
          if (listingSeller) {
            setSeller(listingSeller);
          } else {
            setSeller({
              full_name: currentListing.seller_name || "Guest User",
              email: currentListing.seller_email,
              trust_score: "New User",
              profile_image: null,
              phone: currentListing.seller_phone
            });
          }
        }
      } catch (error) {
        console.error("Error loading user/seller details:", error);
        setSeller({
          full_name: currentListing.seller_name || "Unknown Seller",
          email: currentListing.seller_email,
          trust_score: "N/A",
          profile_image: null,
          phone: currentListing.seller_phone
        });
      }
      setIsLoadingSeller(false);
    };
    
    loadUserAndSeller();
    setSelectedImage(0);
  }, [currentListing]);

  useEffect(() => {
    if (startContact && seller && currentListing) {
      setIsContactModalOpen(true);
    }
    if (startTrade && seller && currentListing) {
      setIsTradeModalOpen(true);
    }
  }, [startContact, startTrade, seller, currentListing]);
  
  const handleListingUpdate = (updatedListing) => {
    setCurrentListing(prev => ({...prev, ...updatedListing}));
    // We don't close the modal here, but the refresh will happen on close
  };

  const handleListingDelete = (deletedId) => {
    onClose(true); // Close modal and trigger refresh
  };

  if (!currentListing) {
    return null;
  }

  const categoryColor = categoryColors[currentListing.category] || categoryColors.Other;
  const conditionColor = conditionColors[currentListing.condition] || 'bg-gray-100 text-gray-800';

  const copyLinkToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Clipboard fallback failed:', err);
      alert('Could not copy link. You can manually copy it from the address bar.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentListing.title,
      text: `Check out this item on Longhorn Exchange: ${currentListing.title} - $${currentListing.price}`,
      url: window.location.origin + createPageUrl(`Browse?listing=${currentListing.id}`)
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Web Share API failed, falling back to clipboard:', error);
          copyLinkToClipboard(shareData.url);
        }
      }
    } else {
      copyLinkToClipboard(shareData.url);
    }
  };

  const canProposeTrade = currentUser && currentUser.email !== currentListing.seller_email && currentListing.status === 'active';

  return (
    <>
      <Dialog open={!!currentListing} onOpenChange={(isOpen) => !isOpen && onClose(true)}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Column */}
            <div className="lg:col-span-2 p-4 md:p-6 space-y-6">
              {/* Listing Management Controls */}
              {listing.status === 'active' && currentUser && (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="text-sm text-gray-500">
                    Posted on {format(new Date(currentListing.created_date), "PP 'at' p")}
                  </div>
                  <ListingManagement 
                    listing={currentListing}
                    currentUser={currentUser}
                    onUpdate={handleListingUpdate}
                    onDelete={handleListingDelete}
                  />
                </div>
              )}

              <Card className="overflow-hidden shadow-lg border-0">
                <div className="aspect-video bg-gray-100 relative">
                  {currentListing.images && currentListing.images.length > 0 ? (
                    <img 
                      src={currentListing.images[selectedImage]} 
                      alt={currentListing.title} 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="bg-white/80 backdrop-blur-sm rounded-full"
                      onClick={handleShare}
                    >
                      <Share2 className="w-5 h-5"/>
                    </Button>
                  </div>
                </div>
                {currentListing.images && currentListing.images.length > 1 && (
                  <div className="p-2 bg-gray-50 flex gap-2 overflow-x-auto">
                    {currentListing.images.map((img, index) => (
                      <button 
                        key={index} 
                        onClick={() => setSelectedImage(index)} 
                        className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                          selectedImage === index ? 'border-[#DF6F1D]' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt={`thumbnail ${index+1}`} className="w-full h-full object-cover"/>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="border-0 shadow-none">
                <CardHeader className="px-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{currentListing.title || "Untitled Listing"}</h1>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge className={`text-sm ${categoryColor}`}>
                      {currentListing.category || 'N/A'}
                    </Badge>
                    <Badge className={`text-sm ${conditionColor}`}>
                      {currentListing.condition || 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-2">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{currentListing.description}</p>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4"/>
                      Posted on {format(new Date(currentListing.created_date), 'PPP')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {currentListing.views || 0} views
                    </span>
                  </div>
                </CardContent>
              </Card>

              <ARViewer listing={currentListing} />
            </div>
            
            {/* Right Column */}
            <div className="bg-gray-50/70 border-l p-4 md:p-6 space-y-6">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <p className="text-gray-600">Price</p>
                  <p className="text-4xl font-extrabold text-[#DF6F1D] mt-1 mb-6">${currentListing.price}</p>
                  <div className="space-y-3">
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        className="w-full bg-[#DF6F1D] hover:bg-orange-700 text-white font-bold text-lg py-6" 
                        onClick={() => setIsPaymentModalOpen(true)}
                        disabled={currentListing.status !== 'active'}
                      >
                        <DollarSign className="w-6 h-6 mr-3"/> 
                        {currentListing.status === 'active' ? 'Pay Now' : 'Sold'}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full border-2 border-[#DF6F1D] text-[#DF6F1D] hover:bg-orange-100 font-bold text-lg py-6" 
                        onClick={() => setIsContactModalOpen(true)}
                        disabled={!currentListing.seller_phone && !seller?.phone}
                      >
                        <Phone className="w-6 h-6 mr-3"/> 
                        {(currentListing.seller_phone || seller?.phone) ? 'Contact Seller' : 'Contact Unavailable'}
                      </Button>
                    </motion.div>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full border-2 border-[#DF6F1D] text-[#DF6F1D] hover:bg-orange-100 font-bold text-lg py-6" 
                        onClick={() => setIsTradeModalOpen(true)}
                        disabled={!canProposeTrade}
                      >
                        <ArrowLeftRight className="w-6 h-6 mr-3"/> 
                        {currentListing.status === 'active' ? (canProposeTrade ? 'Propose Trade' : 'This is your item') : 'Sold'}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-500"/> 
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSeller ? (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  ) : seller ? (
                    <div className="flex items-center gap-4 group">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={seller.profile_image}/>
                        <AvatarFallback className="text-2xl">
                          {seller.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg group-hover:text-[#DF6F1D]">
                          {seller.full_name}
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                          <span className="font-semibold">{seller.trust_score || 'N/A'}</span>
                          <span className="text-gray-500">Trust Score</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Seller information unavailable</p>
                  )}
                </CardContent>
              </Card>
              
              <SmartPriceAnalyzer listing={currentListing} />
              <PriceHistoryChart listing={currentListing} /> 
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {seller && !isLoadingSeller && (
        <ContactSellerModal 
          isOpen={isContactModalOpen} 
          onClose={() => setIsContactModalOpen(false)} 
          listing={currentListing} 
          seller={seller}
        />
      )}

      <TradeProposalModal 
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        requestedListing={currentListing}
        onTradeProposed={() => {
          console.log('Trade proposed successfully!');
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        listing={currentListing}
        seller={seller}
      />

      <ZellePayment
        isOpen={isZelleModalOpen}
        onClose={() => setIsZelleModalOpen(false)}
        listing={currentListing}
        seller={seller}
      />
    </>
  );
}
