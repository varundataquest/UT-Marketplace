import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Trade } from '@/api/entities';
import { Loader2 } from 'lucide-react';

export default function TradeProposalModal({ isOpen, onClose, requestedListing, onTradeProposed }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [myListings, setMyListings] = useState([]);
    const [selectedListingId, setSelectedListingId] = useState('');
    const [message, setMessage] = useState('');
    const [cashOffer, setCashOffer] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);
                
                if (user) {
                    const userListings = await Listing.filter({
                        seller_email: user.email,
                        status: 'active'
                    });
                    setMyListings(userListings);
                }
            } catch (error) {
                console.error("Failed to load user data for trade modal", error);
            }
            setIsLoading(false);
        };
        
        loadData();
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedListingId || !currentUser || !requestedListing) {
            alert('Please select one of your items to offer.');
            return;
        }

        setIsSubmitting(true);
        try {
            const offeredListing = myListings.find(l => l.id === selectedListingId);
            const valueDifference = parseFloat(requestedListing.price || 0) - parseFloat(offeredListing.price || 0) - parseFloat(cashOffer || 0);

            await Trade.create({
                offered_listing_id: selectedListingId,
                requested_listing_id: requestedListing.id,
                offerer_email: currentUser.email,
                receiver_email: requestedListing.seller_email,
                message,
                value_difference: valueDifference
            });

            onTradeProposed();
            onClose();
            alert('Trade proposal sent successfully!');
        } catch (error) {
            console.error("Failed to propose trade:", error);
            alert('There was an error sending your trade proposal.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        // Reset state on close
        setSelectedListingId('');
        setMessage('');
        setCashOffer(0);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Propose a Trade</DialogTitle>
                    <DialogDescription>
                        Offer one of your active listings in exchange for "{requestedListing?.title}".
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : myListings.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="font-semibold">You have no active listings to trade.</p>
                        <p className="text-sm text-gray-600 mt-2">Please create a listing before you can propose a trade.</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="font-medium">Your item to offer *</label>
                            <Select onValueChange={setSelectedListingId} value={selectedListingId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select one of your items" />
                                </SelectTrigger>
                                <SelectContent>
                                    {myListings.map(listing => (
                                        <SelectItem key={listing.id} value={listing.id}>
                                            {listing.title} (${listing.price})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="font-medium">Add cash (optional)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={cashOffer}
                                onChange={(e) => setCashOffer(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="font-medium">Message (optional)</label>
                            <Textarea
                                placeholder="Add a message to the seller..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading || isSubmitting || myListings.length === 0 || !selectedListingId}
                        className="bg-[#DF6F1D] hover:bg-orange-700 text-white"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Proposal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}