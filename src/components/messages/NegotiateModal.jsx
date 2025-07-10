
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneCall } from "lucide-react"; // Changed icon from MessageCircle/Send to PhoneCall
import { User } from "@/api/entities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils"; // Kept as it might be used elsewhere or for context related to listings

export default function NegotiateModal({ isOpen, onClose, listing, seller, onMessageSent }) {
  // Removed message, offerPrice, and isSending states as they are for messaging
  const [isPhoneNumberVisible, setIsPhoneNumberVisible] = useState(false); // New state to control phone number visibility
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      User.me().then(setCurrentUser).catch(() => setCurrentUser(null));
      setIsPhoneNumberVisible(false); // Reset visibility when modal opens
      setError(null);
      // Removed initial message and offer price setting
    }
  }, [isOpen]); // Only depend on isOpen

  const handleShowPhoneNumber = async () => {
    if (!currentUser) {
        setError("You must be logged in to view contact details.");
        return;
    }
    
    // In this new flow, revealing the phone number is the "action"
    // Similar to "sending a message", this confirms the user wants to contact.
    setIsPhoneNumberVisible(true);
    setError(null);
    
    // Call the original onMessageSent callback, as this is the new "contact initiated" event.
    if (onMessageSent) {
      onMessageSent(); 
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-ut-orange" /> {/* Changed icon */}
            Contact Seller
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 flex gap-4 items-center">
              <img 
                src={listing?.images?.[0]} 
                alt={listing?.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{listing?.title}</h3>
                <p className="text-2xl font-bold text-ut-orange">${listing?.price}</p>
              </div>
              <div className="text-right">
                 <p className="text-sm text-gray-500">Seller</p>
                 <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={seller?.profile_image} />
                        <AvatarFallback>{seller?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{seller?.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Removed offer price input and message textarea */}
          
          {!isPhoneNumberVisible ? (
            <p className="text-sm text-gray-600 text-center">Click the button below to reveal the seller's phone number for direct contact.</p>
          ) : (
            <div className="text-center p-4 border rounded-md bg-gray-50">
              <p className="text-lg font-medium text-gray-700 mb-2">Seller's Phone Number:</p>
              {seller?.phone_number ? (
                <>
                  <a 
                    href={`tel:${seller.phone_number}`} 
                    className="text-4xl font-bold text-ut-orange hover:underline block mb-4"
                  >
                    {seller.phone_number}
                  </a>
                  <Button 
                    asChild 
                    className="w-full bg-ut-orange hover:bg-orange-700 text-black border border-black"
                  >
                    <a href={`tel:${seller.phone_number}`}>
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Call Seller
                    </a>
                  </Button>
                </>
              ) : (
                <p className="text-red-500 font-semibold">Seller has not provided a phone number.</p>
              )}
            </div>
          )}

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {!isPhoneNumberVisible && ( // Only show this button if the number is not yet visible
            <Button 
              onClick={handleShowPhoneNumber} 
              disabled={!currentUser} // Disable if user is not logged in
              className="w-full bg-ut-orange hover:bg-orange-700 text-black border border-black"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Show Phone Number
            </Button>
          )}
          {/* Once phone number is visible, this button is no longer needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
