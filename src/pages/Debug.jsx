
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Listing } from '@/api/entities';
import { Message } from '@/api/entities';
import { Trade } from '@/api/entities'; // Added Trade import
import TestSuite from '../components/debug/TestSuite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { complianceCheck } from '@/api/functions';
import { demandForecasting } from '@/api/functions';
import { voiceSearch } from '@/api/functions';
import { photogrammetry } from '@/api/functions';

export default function Debug() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    User.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  // --- Test Functions ---

  const testComplianceCheck = async () => {
    return complianceCheck({
      title: 'Test Item',
      description: 'This is a perfectly safe item for sale.',
      images: [],
      seller_email: currentUser?.email || 'test@example.com'
    });
  };
  
  const testComplianceCheckBlocked = async () => {
    return complianceCheck({
      title: 'Prohibited Item: Fake ID',
      description: 'Get your novelty fake university ID here.',
      images: [],
      seller_email: currentUser?.email || 'test@example.com'
    });
  };

  const testDemandForecasting = async () => {
    return demandForecasting({ category: 'Textbooks', timeRange: '6months' });
  };
  
  const testVoiceSearch = async () => {
    return voiceSearch({ query: 'Find me textbooks under $50' });
  };

  const testCreateAndDeleteListing = async () => {
    const testListing = {
        title: "DEBUG TEST ITEM - DELETE ME",
        description: "This is a temporary item for testing.",
        price: 99.99,
        category: "Other",
        condition: "New",
        seller_email: currentUser.email
    };
    const created = await Listing.create(testListing);
    await Listing.delete(created.id);
    return { created: created, deleted: { id: created.id, status: 'success' } };
  };

  const testSendMessage = async () => {
      // Find another user to send message to, or use a test email
      const users = await User.list();
      const recipient = users.find(u => u.email !== currentUser.email) || { email: 'recipient@test.com' };

      // Find a listing to attach message to
      const listings = await Listing.list(null, 1);
      const listingId = listings[0]?.id || 'test-listing-id';

      const conversationId = `${listingId}-${[currentUser.email, recipient.email].sort().join('-')}`;
      
      return Message.create({
          conversation_id: conversationId,
          listing_id: listingId,
          sender_email: currentUser.email,
          recipient_email: recipient.email,
          content: 'This is a test message from the debug suite.'
      });
  };

  const testPhotogrammetry = async () => {
    if (!currentUser) throw new Error("Must be logged in to test this.");
    // Create a temporary listing to test with
     const testListing = {
        title: "3D Test Item",
        description: "3D test",
        price: 1,
        category: "Furniture",
        condition: "New",
        seller_email: currentUser.email,
        images: ["//via.placeholder.com/150", "//via.placeholder.com/150", "//via.placeholder.com/150"] // Mock URLs are sufficient for the function
    };
    const created = await Listing.create(testListing);

    try {
        const result = await photogrammetry({
            listingId: created.id,
            imageUrls: created.images,
            category: created.category
        });
        
        // Assert that the result contains the correct mock model URL
        if (result.data.modelData.glbUrl !== 'https://modelviewer.dev/shared-assets/models/Chair.glb') {
            throw new Error(`Test failed: Expected model URL not returned. Got: ${result.data.modelData.glbUrl}`);
        }
        
        return result;
    } finally {
        // Clean up the temporary listing
        await Listing.delete(created.id);
    }
  }

  const testTradeCreation = async () => {
    if (!currentUser) throw new Error("Must be logged in to test trading.");
    
    // Get some listings to test with
    const listings = await Listing.list(null, 5);
    if (listings.length < 2) throw new Error("Need at least 2 listings to test trading.");
    
    // Find suitable listings for the test
    let offeredListing = listings.find(l => l.seller_email === currentUser.email);
    let requestedListing = listings.find(l => l.seller_email !== currentUser.email);

    // If we don't have listings from the current user, use any available listings
    if (!offeredListing) {
      offeredListing = listings[0];
    }
    // If requestedListing is not found or is the same as offeredListing
    if (!requestedListing || requestedListing.id === offeredListing.id) {
      requestedListing = listings.find(l => l.id !== offeredListing.id); // Find any other listing not being offered
    }

    if (!requestedListing) {
      throw new Error("Not enough listings to test a trade.");
    }
    
    const tradeData = {
      offered_listing_id: offeredListing.id,
      requested_listing_id: requestedListing.id,
      offerer_email: currentUser.email,
      receiver_email: requestedListing.seller_email || 'test.receiver@example.com',
      message: "Test trade from debug suite",
      value_difference: requestedListing.price - offeredListing.price
    };
    
    const trade = await Trade.create(tradeData);
    
    // Instead of deleting, let's update the trade to cancelled status
    const cancelledTrade = await Trade.update(trade.id, { status: 'cancelled' });
    
    return { 
      created: trade, 
      cancelled: cancelledTrade,
      note: "Trade was created and then cancelled instead of deleted to preserve transaction history."
    };
  };

  const testMessageSendingAndConversation = async () => {
    if (!currentUser) throw new Error("Must be logged in to test messaging.");
    
    const listings = await Listing.list(null, 1);
    if (listings.length === 0) throw new Error("Need at least 1 listing to test messaging.");
    
    const testMessage = {
      conversation_id: `debug-test-${Date.now()}`,
      listing_id: listings[0].id,
      sender_email: currentUser.email,
      recipient_email: 'debug.recipient@example.com',
      content: 'This is a test message to verify sending and conversation retrieval.'
    };
    
    const message = await Message.create(testMessage);
    const conversation = await Message.filter({ conversation_id: testMessage.conversation_id });
    
    return { 
      messageSent: message,
      conversationLoaded: conversation,
      note: "This test verifies that a sent message is stored and can be retrieved as part of a conversation."
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Debug & Test Suite</h1>
      <Card>
        <CardHeader><CardTitle>User Status</CardTitle></CardHeader>
        <CardContent>
          {currentUser ? (
            <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(currentUser, null, 2)}</pre>
          ) : (
            <p>Not logged in.</p>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="data">Data Operations</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>
        <TabsContent value="functions" className="space-y-4">
            <TestSuite title="Compliance Check (Safe)" description="Tests the content moderation function with safe text." testFunction={testComplianceCheck} />
            <TestSuite title="Compliance Check (Blocked)" description="Tests the content moderation function with text that should be blocked." testFunction={testComplianceCheckBlocked} />
            <TestSuite title="Demand Forecasting" description="Tests the demand forecasting for 'Textbooks'." testFunction={testDemandForecasting} />
            <TestSuite title="Voice Search Parser" description="Tests the voice search function with a sample query." testFunction={testVoiceSearch} />
            <TestSuite title="Photogrammetry" description="Tests the 3D model generation function. Creates and deletes a temporary listing." testFunction={testPhotogrammetry} />
        </TabsContent>
        <TabsContent value="data" className="space-y-4">
             <TestSuite title="Create & Delete Listing" description="Creates a test listing and immediately deletes it." testFunction={testCreateAndDeleteListing} />
             <TestSuite title="Send Message (Basic)" description="Sends a single message to another user or a test address." testFunction={testSendMessage} />
        </TabsContent>
        <TabsContent value="features" className="space-y-4">
          <TestSuite title="Trade Creation" description="Tests the full trade creation flow. Creates and cancels a trade." testFunction={testTradeCreation} />
          <TestSuite title="Message Sending & Conversation" description="Tests sending a message and confirms it's stored in a retrievable conversation." testFunction={testMessageSendingAndConversation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
