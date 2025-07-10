import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Copy, MessageCircle, Star, CheckCircle } from "lucide-react";

export default function ContactSellerModal({ isOpen, onClose, listing, seller }) {
  const [copied, setCopied] = useState(false);

  const copyPhoneNumber = () => {
    const phoneToUse = listing.seller_phone || seller?.phone;
    if (phoneToUse) {
      navigator.clipboard.writeText(phoneToUse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const openSMS = () => {
    const phoneToUse = listing.seller_phone || seller?.phone;
    if (phoneToUse) {
      const message = `Hi! I'm interested in your listing: "${listing.title}" for $${listing.price}`;
      window.open(`sms:${phoneToUse}?body=${encodeURIComponent(message)}`);
    }
  };

  const openCall = () => {
    const phoneToUse = listing.seller_phone || seller?.phone;
    if (phoneToUse) {
      window.open(`tel:${phoneToUse}`);
    }
  };

  if (!isOpen) return null;

  const phoneToDisplay = listing.seller_phone || seller?.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#DF6F1D]" />
            Contact Seller
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-gray-50/70">
            <CardContent className="p-4 flex gap-4 items-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src={seller?.profile_image} />
                <AvatarFallback>{seller?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{seller?.full_name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
                  <span>{seller?.trust_score || 'N/A'} Trust Score</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {phoneToDisplay ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Seller's Phone Number</p>
                <p className="text-3xl font-bold tracking-wider">{phoneToDisplay}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyPhoneNumber} variant="outline" className="flex-1">
                  {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-500"/> : <Copy className="w-4 h-4 mr-2"/>}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={openSMS} className="flex-1 bg-[#DF6F1D] hover:bg-orange-700 text-white border border-black">
                  <MessageCircle className="w-4 h-4 mr-2"/> Text
                </Button>
                <Button onClick={openCall} className="flex-1 bg-[#DF6F1D] hover:bg-orange-700 text-white border border-black">
                  <Phone className="w-4 h-4 mr-2"/> Call
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4 border rounded-md">
              <p>The seller has not provided a phone number.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}