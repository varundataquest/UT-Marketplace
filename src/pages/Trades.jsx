
import React, { useState, useEffect } from 'react';
import { Trade } from '@/api/entities';
import { Listing } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeftRight, Check, X, Clock, DollarSign, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Trades() {
    const [allTrades, setAllTrades] = useState([]);
    const [myTrades, setMyTrades] = useState([]);
    const [listings, setListings] = useState({});
    const [users, setUsers] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTrades();
    }, []);

    const loadTrades = async () => {
        setIsLoading(true);
        try {
            const user = await User.me().catch(() => null);
            setCurrentUser(user);

            // Load ALL trades (now public)
            const trades = await Trade.list('-created_date');
            setAllTrades(trades);

            // Filter user's personal trades if logged in
            if (user) {
                const userTrades = trades.filter(trade => 
                    trade.offerer_email === user.email || trade.receiver_email === user.email
                );
                setMyTrades(userTrades);
            }

            // Load associated listings and users
            const listingIds = [...new Set(trades.flatMap(t => [t.offered_listing_id, t.requested_listing_id]))];
            const userEmails = [...new Set(trades.flatMap(t => [t.offerer_email, t.receiver_email]))];

            const [allListings, allUsers] = await Promise.all([
                Listing.list(),
                User.list()
            ]);

            // Create lookup objects
            const listingsMap = Object.fromEntries(allListings.filter(l => listingIds.includes(l.id)).map(l => [l.id, l]));
            const usersMap = Object.fromEntries(allUsers.filter(u => userEmails.includes(u.email)).map(u => [u.email, u]));

            setListings(listingsMap);
            setUsers(usersMap);
        } catch (error) {
            console.error('Failed to load trades:', error);
        }
        setIsLoading(false);
    };

    const handleTradeAction = async (tradeId, action) => {
        if (!currentUser) {
            alert('Please log in to interact with trades');
            return;
        }
        
        try {
            await Trade.update(tradeId, { status: action });
            
            // If trade is accepted, mark both listings as sold
            if (action === 'accepted') {
                const trade = [...allTrades, ...myTrades].find(t => t.id === tradeId);
                if (trade) {
                    await Promise.all([
                        Listing.update(trade.offered_listing_id, { status: 'sold' }),
                        Listing.update(trade.requested_listing_id, { status: 'sold' })
                    ]);
                }
            }
            
            loadTrades(); // Refresh
            alert(`Trade ${action} successfully!`);
        } catch (error) {
            console.error('Failed to update trade:', error);
            alert('Failed to update trade. Please try again.');
        }
    };

    const handleDeleteTrade = async (tradeId) => {
        if (!currentUser) {
            alert('Please log in to delete trades');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this trade request? This cannot be undone.')) {
            return;
        }
        
        try {
            await Trade.delete(tradeId);
            loadTrades(); // Refresh
            alert('Trade request deleted successfully!');
        } catch (error) {
            console.error('Failed to delete trade:', error);
            alert('Failed to delete trade. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return <Badge className={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const TradeCard = ({ trade, showActions = false }) => {
        const offerer = users[trade.offerer_email];
        const receiver = users[trade.receiver_email];
        const offeredListing = listings[trade.offered_listing_id];
        const requestedListing = listings[trade.requested_listing_id];
        
        const isCurrentUserTheOfferer = currentUser?.email === trade.offerer_email;
        const isCurrentUserTheReceiver = currentUser?.email === trade.receiver_email;

        const ItemDisplay = ({ user, listing, type }) => (
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={user?.profile_image} />
                        <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium text-sm text-gray-600">
                        {user?.full_name || 'User'} {type === 'offer' ? 'Offers' : 'Wants'}
                    </h4>
                </div>
                {listing ? (
                    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        {listing.images?.[0] && (
                            <img src={listing.images[0]} alt={listing.title} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                            <h5 className="font-medium">{listing.title}</h5>
                            <p className="text-sm text-gray-600">{listing.condition}</p>
                            <p className="font-bold text-ut-orange">${listing.price}</p>
                        </div>
                    </div>
                ) : <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">Listing not available</p>}
            </div>
        );

        return (
            <Card className="mb-4 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4" />
                            Trade Proposal
                        </CardTitle>
                        <div className="flex gap-2">
                            {getStatusBadge(trade.status)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1"><ItemDisplay user={offerer} listing={offeredListing} type="offer" /></div>
                        <ArrowLeftRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        <div className="flex-1"><ItemDisplay user={receiver} listing={requestedListing} type="request" /></div>
                    </div>
                    
                    {trade.value_difference !== undefined && Math.abs(trade.value_difference) > 0.01 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-700" />
                            <p className="text-sm text-blue-800">
                                Cash difference: ${Math.abs(trade.value_difference).toFixed(2)}
                            </p>
                        </div>
                    )}

                    {trade.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium mb-1">Message:</p>
                            <p className="text-sm text-gray-700 italic">"{trade.message}"</p>
                        </div>
                    )}

                    {/* Actions for involved parties */}
                    {showActions && trade.status === 'pending' && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {isCurrentUserTheReceiver && (
                                <>
                                    <Button onClick={() => handleTradeAction(trade.id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Check className="w-4 h-4 mr-2" /> Accept
                                    </Button>
                                    <Button variant="outline" onClick={() => handleTradeAction(trade.id, 'declined')} className="border-red-300 text-red-600 hover:bg-red-50">
                                        <X className="w-4 h-4 mr-2" /> Decline
                                    </Button>
                                </>
                            )}

                            {isCurrentUserTheOfferer && (
                                <Button 
                                    variant="destructive"
                                    onClick={() => handleDeleteTrade(trade.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Request
                                </Button>
                            )}
                        </div>
                    )}

                    {showActions && trade.status !== 'pending' && (
                         <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                            trade.status === 'accepted' ? 'bg-green-50 text-green-800' :
                            trade.status === 'declined' ? 'bg-red-50 text-red-800' :
                            trade.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                            trade.status === 'completed' ? 'bg-blue-50 text-blue-800' : ''
                         }`}>
                            {trade.status === 'accepted' && '✅ Trade Accepted! Arrange the exchange.'}
                            {trade.status === 'declined' && '❌ Trade Declined.'}
                            {trade.status === 'cancelled' && '🗑️ Trade Cancelled.'}
                            {trade.status === 'completed' && '🤝 Trade Completed.'}
                         </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3"/>
                        {new Date(trade.created_date).toLocaleDateString()} at {new Date(trade.created_date).toLocaleTimeString()}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="text-center p-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading trades...</p>
            </div>
        );
    }

    const activeTrades = allTrades.filter(t => t.status === 'pending');
    const completedTrades = allTrades.filter(t => ['accepted', 'completed'].includes(t.status));

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Trading Activity</h1>
            
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">
                        All Active Trades ({activeTrades.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed Trades ({completedTrades.length})
                    </TabsTrigger>
                    {currentUser && (
                        <TabsTrigger value="mine">
                            My Trades ({myTrades.length})
                        </TabsTrigger>
                    )}
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                    <p className="text-gray-600">See all pending trade requests from the community</p>
                    {activeTrades.length > 0 ? (
                        activeTrades.map(trade => <TradeCard key={trade.id} trade={trade} />)
                    ) : (
                        <p className="text-gray-500">No active trades at the moment.</p>
                    )}
                </TabsContent>
                
                <TabsContent value="completed" className="space-y-4">
                    <p className="text-gray-600">Recently completed trades in the community</p>
                    {completedTrades.length > 0 ? (
                        completedTrades.map(trade => <TradeCard key={trade.id} trade={trade} />)
                    ) : (
                        <p className="text-gray-500">No completed trades to show.</p>
                    )}
                </TabsContent>
                
                {currentUser && (
                    <TabsContent value="mine" className="space-y-4">
                        <p className="text-gray-600">Your personal trade activity. Accept or decline offers made to you, or delete requests you've sent.</p>
                        {myTrades.length > 0 ? (
                            myTrades.map(trade => <TradeCard key={trade.id} trade={trade} showActions={true} />)
                        ) : (
                            <Alert>
                                <AlertDescription>
                                    You haven't made or received any trade offers yet. Find an item you like and propose a trade!
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
