import apiClient from "../api/client";

// Helper to extract cookie value by name
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "";
};

// Build WebSocket URL from the base URL
const getWsUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    // Replace http:// or https:// with ws:// or wss://
    let wsUrl = baseUrl.replace(/^http/, "ws") + "/ws/chat";

    // The backend accepts the token via query params if the cookie is not automatically sent 
    // due to cross-origin limitations with websockets
    const token = getCookie("Access_token");
    if (token) {
        wsUrl += `?token=${token}`;
    }

    return wsUrl;
};

class ChatService {
    constructor() {
        this.socket = null;
        this.onMessageCallback = null;
    }

    // --- REST APIs ---

    // 1. Get Sidebar (Conversations List)
    async getSidebar() {
        try {
            const response = await apiClient.get("/ws/getsidebar");
            // Based on payload: { Sucess: { code: 200, status: true, data: [...] } }
            if (response.data?.Sucess?.data) {
                return response.data.Sucess.data;
            }
            return [];
        } catch (error) {
            console.error("Error fetching sidebar:", error);
            return [];
        }
    }

    // 2. Get Messages for a specific Conversation ID
    async getChatMessages(chatId) {
        try {
            const response = await apiClient.get(`/ws/chat/${chatId}/messages`);
            // Format hasn't been wrapped in "Sucess" in the user payload example, so we check directly
            if (response.data?.Sucess?.data) {
                return response.data.Sucess.data;
            }
            return response.data || [];
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    }

    // 3. Start a new conversation (or get existing one)
    async startConversation(receiverId) {
        try {
            // Must pass receiver_id as a number 
            const receiverNum = parseInt(receiverId, 10);

            const response = await apiClient.post("/ws/conversation", { receiver_id: receiverNum });
            // Typically wrapped in a successful format but sometimes nested
            if (response.data?.Sucess?.data) {
                return response.data.Sucess.data;
            }
            return response.data || {};
        } catch (error) {
            console.error("Error starting conversation:", error);
            throw error;
        }
    }

    // --- WebSocket ---

    connect(onMessageReceived) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocket is already connected or connecting.");
            return;
        }

        this.onMessageCallback = onMessageReceived;

        try {
            this.socket = new WebSocket(getWsUrl());

            this.socket.onopen = () => {
                console.log("WebSocket connected!");
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (this.onMessageCallback) {
                        this.onMessageCallback(message);
                    }
                } catch (err) {
                    console.error("Failed to parse WebSocket message:", event.data);
                }
            };

            this.socket.onclose = () => {
                console.log("WebSocket disconnected.");
                // Optionally handle auto-reconnect here
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } catch (error) {
            console.error("Error initializing WebSocket:", error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    sendMessage(receiverId, content) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const receiverNum = parseInt(receiverId, 10);
            if (isNaN(receiverNum)) {
                console.error("Invalid receiver ID:", receiverId);
                return;
            }

            const payload = {
                receiver_id: receiverNum,
                content: content
            };
            this.socket.send(JSON.stringify(payload));
        } else {
            console.error("Cannot send message: WebSocket is not open.");
            // We could optionally throw an error or attempt auto-reconnect
            throw new Error("WebSocket not connected");
        }
    }
}

export const chatService = new ChatService();
