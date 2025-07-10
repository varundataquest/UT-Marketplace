
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Save, X, CheckCircle } from 'lucide-react';
import { Listing } from '@/api/entities';
import { User } from '@/api/entities';
import { motion } from 'framer-motion';

const categories = [
    "Textbooks", "Electronics", "Furniture", "Clothing & Accessories", "Dorm Essentials", 
    "School Supplies", "Sports & Outdoors", "Transportation", "Tickets & Events", "Other"
];
const conditions = ["New", "Like New", "Good", "Fair", "Used"];

export default function ListingManagement({ listing, currentUser, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        category: listing.category,
        condition: listing.condition
    });
    const [isSaving, setIsSaving] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const [showPhoneVerification, setShowPhoneVerification] = useState(false);
    const [canManage, setCanManage] = useState(false);

    useEffect(() => {
        const determineOwnership = () => {
            if (!currentUser || !listing.seller_phone) {
                setCanManage(false);
                return;
            }
            // Direct ownership via logged-in user email
            if (currentUser.email === listing.seller_email) {
                setCanManage(true);
                return;
            }
            // Ownership via matching phone number for accounts without email/guest accounts
            if (currentUser.phone === listing.seller_phone) {
                setCanManage(true);
                return;
            }
            setCanManage(false);
        };
        determineOwnership();
    }, [currentUser, listing]);

    const handleActionAttempt = (actionCallback) => {
        if (canManage) {
            actionCallback();
        } else {
            // Reset phone input before showing verification
            setUserPhone(''); 
            setShowPhoneVerification(true);
        }
    };

    const verifyPhoneAndAct = async (actionCallbackAfterVerification) => {
        if (userPhone === listing.seller_phone) {
            if (currentUser && !currentUser.phone) { // Only update if user doesn't already have a phone saved
                try {
                    await User.update(currentUser.id, { phone: userPhone });
                    // Assuming currentUser is updated elsewhere, or passed back
                } catch (error) {
                    console.error('Failed to update user phone number:', error);
                    // Decide if you want to block or just log
                }
            }
            setShowPhoneVerification(false);
            setCanManage(true); // User is now verified for this session
            actionCallbackAfterVerification();
        } else {
            alert('Phone number does not match the seller phone number for this listing.');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedData = {
                ...editData,
                price: parseFloat(editData.price)
            };
            await Listing.update(listing.id, updatedData);
            onUpdate?.({ ...listing, ...updatedData });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update listing:', error);
            alert('Failed to update listing. Please try again.');
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        try {
            await Listing.delete(listing.id);
            onDelete?.(listing.id);
        } catch (error) {
            console.error('Failed to delete listing:', error);
            alert('Failed to delete listing. Please try again.');
        }
    };

    const handleMarkAsSold = () => {
        handleActionAttempt(async () => {
            try {
                await Listing.update(listing.id, { status: 'sold' });
                onUpdate?.({ ...listing, status: 'sold' });
                alert('Item marked as sold! It will be moved to your sold items.');
            } catch (error) {
                console.error('Failed to mark as sold:', error);
                alert('Failed to mark as sold. Please try again.');
            }
        });
    };
    
    // Don't show controls if no user is logged in
    if (!currentUser) return null;

    return (
        <>
            <div className="flex gap-2">
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <motion.div whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="border border-black text-black hover:bg-gray-100"
                                onClick={() => handleActionAttempt(() => setIsEditing(true))}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </motion.div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Listing</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <Input
                                        type="number"
                                        value={editData.price}
                                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <Select 
                                        value={editData.category} 
                                        onValueChange={(value) => setEditData({ ...editData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Condition</label>
                                    <Select 
                                        value={editData.condition} 
                                        onValueChange={(value) => setEditData({ ...editData, condition: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conditions.map(cond => (
                                                <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditing(false)}
                                    className="border border-black text-black hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-[#DF6F1D] hover:bg-orange-700 text-white border border-black"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {listing.status === 'active' && (
                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleMarkAsSold}
                            className="border border-green-600 text-green-600 hover:bg-green-50"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Sold
                        </Button>
                    </motion.div>
                )}

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <motion.div whileTap={{ scale: 0.95 }}>
                            <Button 
                                size="sm" 
                                variant="outline"
                                className="border border-red-600 text-red-600 hover:bg-red-50"
                                onClick={() => handleActionAttempt(() => { /* No action needed here, AlertDialog takes over */ })}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </motion.div>
                    </AlertDialogTrigger>
                    {canManage && ( // Only show AlertDialog content if user is verified
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border border-black text-black hover:bg-gray-100">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    )}
                </AlertDialog>
            </div>

            {/* Phone Verification Modal */}
            <Dialog open={showPhoneVerification} onOpenChange={setShowPhoneVerification}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verify Your Identity to Manage Listing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            To edit, delete, or mark this item as sold, please enter the phone number you used when creating the listing.
                        </p>
                        <div>
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowPhoneVerification(false)}
                                className="border border-black text-black hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => verifyPhoneAndAct(() => {
                                    // Default action after verification is to just close the modal.
                                    // The user can then click the intended action button again,
                                    // which will now proceed as `canManage` is true.
                                })}
                                className="bg-[#DF6F1D] hover:bg-orange-700 text-white"
                            >
                                Verify
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
