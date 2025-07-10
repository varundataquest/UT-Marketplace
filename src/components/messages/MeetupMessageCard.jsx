import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Check, X } from 'lucide-react';

export default function MeetupMessageCard({ message, currentUser, onUpdate }) {
    const isRecipient = message.recipient_email === currentUser.email;
    const isPending = message.meetup_status === 'pending';
    const isAccepted = message.meetup_status === 'accepted';
    const isDeclined = message.meetup_status === 'declined';
    
    const formattedDate = new Date(message.meetup_time).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const formattedTime = new Date(message.meetup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getStatusBadge = () => {
        if (isAccepted) return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
        if (isDeclined) return <Badge variant="destructive">Declined</Badge>;
        if (isPending) return <Badge variant="outline">Pending</Badge>;
        return null;
    };

    return (
        <Card className="max-w-sm my-2 border-ut-orange">
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold">Meet-up Proposal</h4>
                        <p className="text-xs text-gray-500">From: {message.sender_email === currentUser.email ? "You" : "Them"}</p>
                    </div>
                    {getStatusBadge()}
                </div>
                
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-600"/><span>{formattedDate}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-600"/><span>{formattedTime}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-600"/><span>{message.meetup_location}</span></div>
                </div>

                {isRecipient && isPending && (
                    <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white border border-black" onClick={() => onUpdate(message.id, 'accepted')}>
                           <Check className="w-4 h-4 mr-2"/> Accept
                        </Button>
                         <Button size="sm" variant="destructive" className="flex-1 border border-black" onClick={() => onUpdate(message.id, 'declined')}>
                           <X className="w-4 h-4 mr-2"/> Decline
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}