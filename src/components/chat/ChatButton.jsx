import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChatClient } from './ChatProvider';

export default function ChatButton({ recipientEmail, recipientName, listingId, listingTitle }) {
    const { chatClient, currentUser } = useChatClient();

    const startConversation = async () => {
        if (!chatClient || !currentUser) return;

        try {
            // Create or get existing channel
            const channelId = `listing-${listingId}-${[currentUser.email, recipientEmail].sort().join('-')}`;
            
            const channel = chatClient.channel('messaging', channelId, {
                members: [currentUser.email, recipientEmail],
                name: `${listingTitle} - Chat`,
                created_by_id: currentUser.email,
                listing_id: listingId,
                listing_title: listingTitle
            });

            await channel.create();
            await channel.watch();

            // Send initial message if it's a new channel
            const state = channel.state;
            if (state.messages.length === 0) {
                await channel.sendMessage({
                    text: `Hi! I'm interested in your listing: "${listingTitle}"`
                });
            }

        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    return (
        <Button 
            onClick={startConversation}
            size="sm"
            className="bg-ut-orange hover:bg-orange-700 text-black border border-black"
        >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Seller
        </Button>
    );
}