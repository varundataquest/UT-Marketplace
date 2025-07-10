
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Users, Package, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, listings: 0, reported: 0 });
    const [reportedListings, setReportedListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadAdminData = async () => {
            setIsLoading(true);
            try {
                const user = await User.me();
                if (user.role !== 'admin') {
                    setCurrentUser(null);
                    setIsLoading(false);
                    return;
                }
                setCurrentUser(user);

                const [allUsers, allListings] = await Promise.all([
                    User.list(),
                    Listing.list()
                ]);
                
                const reported = allListings.filter(l => l.is_reported);
                setReportedListings(reported);
                
                setStats({
                    users: allUsers.length,
                    listings: allListings.length,
                    reported: reported.length
                });

            } catch (error) {
                console.error("Failed to load admin data", error);
            }
            setIsLoading(false);
        };
        loadAdminData();
    }, []);
    
    const handleListingAction = async (listingId, action) => {
        if(action === 'remove') {
            await Listing.update(listingId, { status: 'removed', is_reported: false });
        } else if (action === 'dismiss') {
            await Listing.update(listingId, { is_reported: false });
        }
        // Refresh list
        const updatedReported = reportedListings.filter(l => l.id !== listingId);
        setReportedListings(updatedReported);
    };

    if (isLoading) {
        return <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mt-10" /></div>;
    }
    
    if (!currentUser) {
        return <div className="text-center text-red-600 font-bold">Access Denied. You are not an administrator.</div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-3"><Shield className="w-8 h-8 text-ut-orange"/>Admin Dashboard</h1>
            
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Users</CardTitle>
                        <Users className="w-5 h-5 text-gray-500"/>
                    </CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.users}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Listings</CardTitle>
                        <Package className="w-5 h-5 text-gray-500"/>
                    </CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.listings}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Reported Listings</CardTitle>
                        <AlertTriangle className="w-5 h-5 text-red-500"/>
                    </CardHeader>
                    <CardContent><p className="text-4xl font-bold">{stats.reported}</p></CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Moderation Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Listing</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Reported By</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportedListings.length > 0 ? reportedListings.map(listing => (
                                <TableRow key={listing.id}>
                                    <TableCell className="font-medium">{listing.title}</TableCell>
                                    <TableCell>{listing.report_reason || 'No reason provided'}</TableCell>
                                    <TableCell>{'N/A'/* Should be reporter email */}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button size="sm" variant="destructive" onClick={() => handleListingAction(listing.id, 'remove')} className="border border-black">Remove</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleListingAction(listing.id, 'dismiss')} className="border border-black text-black hover:bg-gray-100">Dismiss</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan="4" className="text-center">No reported listings.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
