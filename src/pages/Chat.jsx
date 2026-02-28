import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import { chatService } from "../services/chatService";
import { userService } from "../services/userService";

export default function Chat() {
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState(null);
    const myIdRef = useRef(null);
    const [myName, setMyName] = useState(null);

    // Use a ref to keep track of active chat for websocket callback
    const activeChatRef = useRef(activeChat);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Load initial data and connect websocket
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const initChat = async () => {
            let profileName = null;
            try {
                // Try to get current user ID from the access token first for reliability
                const token = localStorage.getItem("access_token");
                if (token) {
                    try {
                        const payloadBase64 = token.split('.')[1];
                        const decodedPayload = atob(payloadBase64);
                        const payloadObj = JSON.parse(decodedPayload);
                        if (payloadObj && payloadObj.userid) {
                            setMyId(payloadObj.userid);
                            myIdRef.current = payloadObj.userid;
                        }
                    } catch (e) {
                        console.error("Failed to decode token for myId", e);
                    }
                }

                // Try to get current user ID to distinguish my messages
                const profileObj = await userService.getProfile();
                // A common pattern is passing user 'id' if 'ID' isn't explicitly returned
                // If profileObj doesn't map 'id', we will depend on inference later
                if (profileObj) {
                    // Only override if we didn't already get it from the token
                    if (profileObj.id && !myIdRef.current) {
                        setMyId(profileObj.id);
                        myIdRef.current = profileObj.id;
                    }
                    if (profileObj.name) {
                        setMyName(profileObj.name);
                        profileName = profileObj.name;
                    }
                }
            } catch (err) {
                console.error("Failed to load profile for chat", err);
            }

            const targetUserId = location.state?.targetUserId;

            if (targetUserId) {
                // Clear the state so it doesn't trigger again on reload
                window.history.replaceState({}, document.title);

                try {
                    // Force the creation of the conversation if it doesn't exist yet
                    // The backend should return the conversation ID if it was just created 
                    // or if it already exists
                    const newConversation = await chatService.startConversation(targetUserId);

                    // Tell loadSidebar to look out for this conversation ID to select it
                    await loadSidebar(newConversation?.ID, profileName);
                } catch (err) {
                    console.error("Failed to start conversation with target user", err);
                    await loadSidebar(null, profileName);
                }
            } else {
                await loadSidebar(null, profileName);
            }

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

    const loadSidebar = async (autoSelectId = null, fallbackName = null) => {
        setLoading(true);
        try {
            let data = await chatService.getSidebar();

            // If we don't know myId yet, we can try to guess it from conversations or name
            let currentMyId = myIdRef.current || myId;
            if (!currentMyId && data && data.length > 0) {
                let likelyMyId = null;
                const matchName = myName || fallbackName;

                // 1. Precise Match: Look for our own Name in the conversation participants
                if (matchName) {
                    for (const c of data) {
                        if (c.User1NAME === matchName) {
                            likelyMyId = c.User1ID; break;
                        } else if (c.User2NAME === matchName) {
                            likelyMyId = c.User2ID; break;
                        }
                    }
                }

                // 2. Fallback Match: Find the common user ID across all conversations
                if (!likelyMyId) {
                    const userIds = new Map();
                    // Just count occurrences
                    data.forEach(c => {
                        userIds.set(c.User1ID, (userIds.get(c.User1ID) || 0) + 1);
                        userIds.set(c.User2ID, (userIds.get(c.User2ID) || 0) + 1);
                    });

                    let maxCount = 0;
                    for (const [id, count] of userIds.entries()) {
                        if (id !== 0 && count > maxCount) {
                            maxCount = count;
                            likelyMyId = id;
                        }
                    }
                }

                // 3. Confirm
                if (likelyMyId) {
                    setMyId(likelyMyId);
                    myIdRef.current = likelyMyId;
                    currentMyId = likelyMyId;
                }
            }

            // Sort and deduplicate conversations
            if (data && data.length > 0) {
                const uniqueData = [];
                const seenIds = new Set();
                const seenPairs = new Set();

                for (const c of data) {
                    if (seenIds.has(c.ID)) continue;

                    const pairKey = [c.User1ID, c.User2ID].sort().join('-');
                    if (seenPairs.has(pairKey)) continue;

                    seenIds.add(c.ID);
                    seenPairs.add(pairKey);
                    uniqueData.push(c);
                }

                uniqueData.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
                setConversations(uniqueData);

                if (autoSelectId) {
                    const targetConv = uniqueData.find(c => c.ID === autoSelectId);
                    if (targetConv) {
                        setActiveChat(targetConv);
                    }
                }
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
                setMessages((prev) => {
                    // Check if it's our own message being echoed back
                    const currentMyId = myIdRef.current;
                    const isFromMe = String(msg.sender_id) === String(currentMyId);

                    if (isFromMe) {
                        let replaced = false;
                        const newMessages = prev.map(p => {
                            const isOptimistic = p.id && p.id.toString().length > 10;
                            if (!replaced && isOptimistic && p.content === msg.content) {
                                replaced = true;
                                return msg; // replace optimistic with real message
                            }
                            return p;
                        });

                        if (replaced) return newMessages;
                    }

                    // To prevent duplicate real messages if any
                    if (msg.id && prev.some(p => p.id === msg.id)) {
                        return prev;
                    }

                    return [...prev, msg];
                });
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
