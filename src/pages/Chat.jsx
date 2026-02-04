import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { chatService } from "../services/chatService";

export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Load messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            loadMessages(activeChat.id);
        }
    }, [activeChat]);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
            if (data.length > 0) {
                setActiveChat(data[0]); // Auto-select first chat
            }
        } catch (error) {
            console.error("Failed to load chats", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const data = await chatService.getMessages(chatId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleSendMessage = async (text) => {
        if (!activeChat) return;

        const tempMsg = {
            id: Date.now(),
            senderId: "me",
            text: text,
            time: "Just now" // Optimistic update
        };

        setMessages((prev) => [...prev, tempMsg]);

        try {
            // In a real app, you'd wait for server confirmation or socket event
            await chatService.sendMessage(activeChat.id, text);
            // Refresh messages or handle response
        } catch (error) {
            console.error("Failed to send", error);
            // Handle rollback if needed
        }
    };

    return (
        <div className="min-h-screen bg-[#1E1E2E]">
            <Navbar />

            <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-64px)] overflow-hidden border-t border-white/5">
                <ConversationList
                    conversations={conversations}
                    activeId={activeChat?.id}
                    onSelect={setActiveChat}
                />
                <ChatWindow
                    conversation={activeChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                />
            </main>
        </div>
    );
}
