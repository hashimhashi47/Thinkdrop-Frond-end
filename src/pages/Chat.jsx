import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/layout/Navbar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { chatService } from "../services/chatService";
import { userService } from "../services/userService";

export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);

    // Use a ref to keep track of active chat for websocket callback
    const activeChatRef = useRef(activeChat);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Load initial data and connect websocket
    useEffect(() => {
        const initChat = async () => {
            try {
                // Try to get current user ID to distinguish my messages
                const profileObj = await userService.getProfile();
                // A common pattern is passing user 'id' if 'ID' isn't explicitly returned
                // If profileObj doesn't map 'id', we will depend on inference later
                if (profileObj && profileObj.id) {
                    setMyId(profileObj.id);
                }
            } catch (err) {
                console.error("Failed to load profile for chat", err);
            }

            loadSidebar();

            chatService.connect((incomingMsg) => {
                // This callback fires when a new message arrives via WS
                handleIncomingMessage(incomingMsg);
            });
        };

        initChat();

        return () => {
            chatService.disconnect();
        };
    }, []);

    const loadSidebar = async () => {
        setLoading(true);
        try {
            let data = await chatService.getSidebar();

            // If we don't know myId yet, we can try to guess it from conversations
            let currentMyId = myId;
            if (!currentMyId && data && data.length > 0) {
                // Try to find the common user ID across all conversations
                const userIds = new Map();
                data.forEach(c => {
                    userIds.set(c.User1ID, (userIds.get(c.User1ID) || 0) + 1);
                    userIds.set(c.User2ID, (userIds.get(c.User2ID) || 0) + 1);
                });
                // The one with the most occurrences is likely us
                let maxCount = 0;
                let likelyMyId = null;
                for (const [id, count] of userIds.entries()) {
                    if (id !== 0 && count > maxCount) {
                        maxCount = count;
                        likelyMyId = id;
                    }
                }
                if (likelyMyId) {
                    setMyId(likelyMyId);
                    currentMyId = likelyMyId;
                }
            }

            // Sort conversations by created at descending
            if (data && data.length > 0) {
                data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to load sidebar", error);
        } finally {
            setLoading(false);
        }
    };

    // Load messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            loadMessages(activeChat.ID);
        }
    }, [activeChat]);

    const loadMessages = async (conversationId) => {
        try {
            const data = await chatService.getChatMessages(conversationId);
            // Sort by created_at ascending
            if (Array.isArray(data)) {
                data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    const handleIncomingMessage = (msg) => {
        // msg looks like: { receiver_id, content, sender_id, created_at, id }
        const currentActive = activeChatRef.current;

        if (currentActive) {
            // Append message if it belongs to the active conversation
            // Check if context maps to either user in current conversation
            const MsgParticipantMatch = (msg.sender_id === currentActive.User1ID || msg.sender_id === currentActive.User2ID);
            const MsgConvoMatch = msg.conversation_id && msg.conversation_id === currentActive.ID;

            if (MsgConvoMatch || MsgParticipantMatch) {
                setMessages((prev) => [...prev, msg]);
            }
        }

        // Refresh sidebar to update last message/timestamp
        loadSidebar();
    };

    const handleSendMessage = async (text, receiverId) => {
        if (!activeChat && !receiverId) return;

        // If we don't have an active chat, but we have a receiverId (e.g. starting a chat)
        let rId = receiverId;
        if (activeChat) {
            // Determine who is the other user
            rId = activeChat.User1ID === myId ? activeChat.User2ID : activeChat.User1ID;

            // Fallback if rId is mistakenly 0 or matches myId
            if (rId === 0 || rId === myId) {
                rId = (activeChat.User2ID !== myId && activeChat.User2ID !== 0) ? activeChat.User2ID : activeChat.User1ID;
            }
        }

        try {
            // Optimistic UI update
            const tempMsg = {
                id: Date.now() + Math.random().toString(), // Generates string that parses isOptimistic = true in ChatWindow
                sender_id: myId || "me",
                content: text,
                created_at: new Date().toISOString()
            };
            setMessages((prev) => [...prev, tempMsg]);

            // Send via WS
            chatService.sendMessage(rId, text);
            // Throttle sidebar refresh slightly to ensure server creates message
            setTimeout(loadSidebar, 600);
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    const handleSelectConversation = async (conv) => {
        setActiveChat(conv);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19]">
            <Navbar />

            <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-64px)] overflow-hidden border-t border-white/5">
                <ConversationList
                    conversations={conversations}
                    activeId={activeChat?.ID}
                    onSelect={handleSelectConversation}
                    myId={myId}
                />
                <ChatWindow
                    conversation={activeChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    myId={myId}
                />
            </main>
        </div>
    );
}
