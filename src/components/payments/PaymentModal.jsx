import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, listing, seller }) {
    if (!isOpen || !listing || !seller) return null;

    const paypalLink = seller.paypal_username
        ? `https://www.paypal.me/${seller.paypal_username}/${listing.price}`
        : null;

    const zelleMailtoLink = `mailto:${seller.email}?subject=Zelle Payment for: ${encodeURIComponent(listing.title)}&body=Sending $${listing.price} via Zelle for your item "${encodeURIComponent(listing.title)}". Please confirm this is the correct email address.`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Your Purchase</DialogTitle>
                    <DialogDescription>
                        Pay the seller directly using one of the secure options below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-4 flex gap-4 items-center">
                            <img src={listing.images[0]} alt={listing.title} className="w-16 h-16 rounded-md object-cover" />
                            <div>
                                <h3 className="font-semibold">{listing.title}</h3>
                                <p className="text-2xl font-bold text-ut-orange">${listing.price}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-3">
                        {paypalLink && (
                            <Button asChild size="lg" className="bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold">
                                <a href={paypalLink} target="_blank" rel="noopener noreferrer">
                                    Pay with PayPal <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        )}
                        <Button asChild size="lg" className="bg-[#6c22b1] hover:bg-[#581c92] text-white font-bold">
                            <a href={zelleMailtoLink} target="_blank" rel="noopener noreferrer">
                                Pay with Zelle <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    </div>

                    <Alert>
                        <ShieldCheck className="w-4 h-4" />
                        <AlertTitle>You are now leaving our app</AlertTitle>
                        <AlertDescription>
                            You will be redirected to a third-party site to complete your payment. Always verify transaction details before sending money. All transactions are between you and the seller.
                        </AlertDescription>
                    </Alert>
                </div>
            </DialogContent>
        </Dialog>
    );
}