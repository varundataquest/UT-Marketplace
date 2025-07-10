
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Listing } from '@/api/entities';
import { User } from '@/api/entities';
import { ContactRequest } from '@/api/entities/ContactRequest'; // Assuming a ContactRequest entity exists
import { Button } from '@/components/ui/button';
// Textarea is no longer needed for messaging
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Loader2, ListTodo, ArrowLeft } from 'lucide-react'; // Changed icons for contact requests
import { motion } from 'framer-motion';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Messages() {
    const query = useQuery();
    // State for holding contact requests instead of conversations
    const [contactRequests, setContactRequests] = useState([]);
    // State for the currently selected contact request
    const [selectedContactRequest, setSelectedContactRequest] = useState(null);
    // Removed states related to messages (messages, newMessage, isLoadingMessages, isSending)
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    // Removed messagesEndRef as there's no chat scroll to manage
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Removed scrollToBottom useEffect as it's not relevant for contact requests

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);

                // Fetch all contact requests where the current user is either the requester or the owner
                const allRequests = await ContactRequest.list('-created_date');
                const userRelevantRequests = allRequests.filter(req =>
                    req.requester_email === user.email || req.owner_email === user.email
                );

                if (userRelevantRequests.length === 0) {
                    setContactRequests([]);
                    setIsLoading(false);
                    return;
                }

                // Collect all unique listing IDs and user emails involved in these requests
                const listingIds = [...new Set(userRelevantRequests.map(req => req.listing_id))];
                const userEmails = [...new Set([
                    ...userRelevantRequests.map(req => req.requester_email),
                    ...userRelevantRequests.map(req => req.owner_email)
                ])];

                // Fetch only the necessary listings and users to avoid excessive data fetching
                const [allListings, allUsers] = await Promise.all([
                    Listing.filter({ id: listingIds }),
                    User.filter({ email: userEmails })
                ]);

                const listingsMap = new Map(allListings.map(l => [l.id, l]));
                const usersMap = new Map(allUsers.map(u => [u.email, u]));

                // Populate requests with listing and other user details, and filter out invalid ones
                const populatedRequests = userRelevantRequests
                    .map(request => {
                        const listing = listingsMap.get(request.listing_id);
                        if (!listing) return null; // Filter out requests for listings that no longer exist

                        // Determine the 'other user' (the person who isn't the current user in this request context)
                        const otherUserEmail = request.requester_email === user.email
                            ? request.owner_email
                            : request.requester_email;
                        const otherUser = usersMap.get(otherUserEmail) || {
                            full_name: 'Unknown User', // Fallback for deleted or missing users
                            email: otherUserEmail,
                            profile_image: null
                        };

                        return {
                            ...request,
                            listing,
                            otherUser,
                            isOwner: request.owner_email === user.email,
                            isRequester: request.requester_email === user.email
                        };
                    })
                    .filter(Boolean) // Remove null entries
                    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); // Sort by most recent request

                setContactRequests(populatedRequests);

                // Check for a specific request ID in the URL for direct access
                const requestIdFromUrl = query.get('requestId');
                if (requestIdFromUrl) {
                    const targetRequest = populatedRequests.find(r => r.id === requestIdFromUrl);
                    if (targetRequest) handleSelectContactRequest(targetRequest);
                }

            } catch (error) {
                console.error("Failed to load contact requests:", error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []); // Empty dependency array means this runs once on mount

    /**
     * Handles selecting a contact request from the list.
     * If the current user is the listing owner and the request status is 'pending',
     * it updates the status to 'number_viewed'.
     * @param {object} request - The contact request object.
     */
    const handleSelectContactRequest = async (request) => {
        setSelectedContactRequest(request);

        // If current user is the owner and request is still pending, mark phone number as viewed
        if (currentUser && request.owner_email === currentUser.email && request.status === 'pending') {
            try {
                const updatedRequest = await ContactRequest.update(request.id, { status: 'number_viewed' });
                // Update the state to reflect the change globally
                setContactRequests(prev => prev.map(r => r.id === request.id ? updatedRequest : r));
                setSelectedContactRequest(updatedRequest); // Update selected too
            } catch (error) {
                console.error("Failed to update contact request status to 'number_viewed':", error);
            }
        }
    };

    /**
     * Marks a contact request as 'contacted'. This action is typically performed by the listing owner.
     * @param {object} request - The contact request object to update.
     */
    const handleMarkAsContacted = async (request) => {
        try {
            const updatedRequest = await ContactRequest.update(request.id, { status: 'contacted' });
            // Update the state to reflect the change globally
            setContactRequests(prev => prev.map(r => r.id === request.id ? updatedRequest : r));
            setSelectedContactRequest(updatedRequest); // Update selected too
        } catch (error) {
            console.error("Failed to mark request as contacted:", error);
        }
    };

    // handleSendMessage and related logic are removed as there's no messaging functionality

    const ContactRequestsList = () => (
        <div className="border-r h-full overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Contact Requests</h2>
            </div>
            {isLoading ? (
                <div className="p-4 space-y-3">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex gap-3 items-center animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : contactRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    <ListTodo className="mx-auto w-12 h-12 mb-2"/>
                    <p>No contact requests yet.</p>
                    <p className="text-sm">Requests from interested parties for your listings, or your own requests, will appear here.</p>
                </div>
            ) : (
                <ul className="divide-y">
                    {contactRequests.map(request => (
                        <li key={request.id} onClick={() => handleSelectContactRequest(request)}
                            className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedContactRequest?.id === request.id ? 'bg-orange-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    {/* Display the avatar of the 'other user' involved in the request */}
                                    <AvatarImage src={request.otherUser?.profile_image} />
                                    <AvatarFallback>{request.otherUser.full_name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">
                                        {request.isRequester ? `To: ${request.otherUser.full_name}` : `From: ${request.otherUser.full_name}`}
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">re: {request.listing?.title}</p>
                                    <p className="text-xs text-gray-500 truncate">Status: {request.status.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
    
    const ContactRequestDetails = () => (
      <div className="flex flex-col h-full">
        {selectedContactRequest ? (
          <>
            <div className="p-3 border-b flex items-center gap-3">
              {isMobileView && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedContactRequest(null)}>
                  <ArrowLeft className="w-5 h-5"/>
                </Button>
              )}
              <Avatar>
                {/* Display the avatar of the 'other user' involved in the request */}
                <AvatarImage src={selectedContactRequest.otherUser.profile_image} />
                <AvatarFallback>{selectedContactRequest.otherUser.full_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">
                    {selectedContactRequest.isRequester ? `Contact for ${selectedContactRequest.otherUser.full_name}` : `Request from ${selectedContactRequest.otherUser.full_name}`}
                </p>
                <p className="text-sm text-gray-500">re: {selectedContactRequest.listing.title}</p>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <Card className="p-4">
                        <h4 className="font-semibold text-lg mb-2">Request Details</h4>
                        <p><strong>Status:</strong> {selectedContactRequest.status.replace(/_/g, ' ')}</p>
                        <p><strong>Requested on:</strong> {new Date(selectedContactRequest.created_date).toLocaleDateString()}</p>
                        <p><strong>Listing:</strong> {selectedContactRequest.listing.title}</p>

                        {/* Display phone number and actions based on user role */}
                        {selectedContactRequest.isOwner && (
                            <div className="mt-4 border-t pt-4">
                                <h5 className="font-medium">Requester's Contact Info:</h5>
                                <p className="text-xl font-bold flex items-center gap-2 mt-2">
                                    <Phone className="w-5 h-5 text-gray-700" />
                                    {selectedContactRequest.phone_number || 'No phone number provided'}
                                </p>
                                {selectedContactRequest.status !== 'contacted' && (
                                    <Button onClick={() => handleMarkAsContacted(selectedContactRequest)} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                                        <ListTodo className="w-4 h-4 mr-2" /> Mark as Contacted
                                    </Button>
                                )}
                                {selectedContactRequest.status === 'contacted' && (
                                    <p className="text-sm text-gray-600 mt-2">This request has been marked as contacted.</p>
                                )}
                            </div>
                        )}
                        {selectedContactRequest.isRequester && (
                            <div className="mt-4 border-t pt-4">
                                <h5 className="font-medium">Your Contact Info for this request:</h5>
                                <p className="text-xl font-bold flex items-center gap-2 mt-2">
                                    <Phone className="w-5 h-5 text-gray-700" />
                                    {selectedContactRequest.phone_number || 'No phone number provided'}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    This is the phone number you provided. The listing owner can view it.
                                </p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
            {/* Removed message input area as there's no chat functionality */}
          </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8">
                <Phone className="w-16 h-16 mb-4"/>
                <h3 className="text-xl font-semibold">Select a contact request</h3>
                <p>Choose from your contact requests on the left to view details.</p>
            </div>
        )}
      </div>
    );

    return (
        <Card className="h-[calc(100vh-10rem)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                {isMobileView ? (
                    selectedContactRequest ? <ContactRequestDetails /> : <ContactRequestsList />
                ) : (
                    <>
                        <div className="md:col-span-1 h-full"><ContactRequestsList /></div>
                        <div className="md:col-span-2 h-full"><ContactRequestDetails /></div>
                    </>
                )}
            </div>
        </Card>
    );
}
