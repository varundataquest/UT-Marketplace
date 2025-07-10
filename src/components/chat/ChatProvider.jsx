import React, { createContext, useContext } from 'react';

// Create a dummy context. Its value will be null/undefined when provided.
// This allows other components to still import ChatContext without immediate errors,
// but indicates that no actual chat client will be provided.
const ChatContext = createContext(null);

/**
 * Custom hook to access chat client.
 * This hook will now always throw an error as chat functionality has been completely removed.
 * Consumers should update their code to no longer use this hook.
 */
export const useChatClient = () => {
    // Although the context value will be null, we still call useContext to maintain the hook's signature
    // and to highlight that this hook is no longer functional.
    const context = useContext(ChatContext); 
    throw new Error('`useChatClient` is no longer supported as chat functionality has been completely removed. Please update your application to remove references to chat features.');
};

/**
 * ChatProvider component.
 * This component no longer provides any chat client functionality.
 * It simply renders its children, providing a null context for chat features.
 * Any components that attempt to consume chat context via `useChatClient`
 * will now receive an explicit error at runtime.
 */
export default function ChatProvider({ children }) {
    // All original state, effects, and Stream Chat initialization logic are removed.
    // The provider now always supplies a null value for the chat context.
    // This design allows components higher up in the tree to still import and render ChatProvider
    // without immediate syntax errors, while ensuring no actual chat functionality is instantiated
    // and explicitly communicating its removal to any consumers of `useChatClient`.
    return (
        <ChatContext.Provider value={null}>
            {children}
        </ChatContext.Provider>
    );
}