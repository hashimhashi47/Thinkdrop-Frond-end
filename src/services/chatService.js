import apiClient from "../api/client";

export const chatService = {
    // Get all conversations
    getConversations: async () => {
        try {
            const response = await apiClient.get("/chats");
            return response.data;
        } catch (error) {
            console.warn("Using mock conversations due to API error");
            return [ // Mock data
                { id: 1, name: "Sarah Johnson", message: "Hi, can we discuss the...", time: "10:30 AM", unread: 2, image: null, online: true },
                { id: 2, name: "Michael Chen", message: "That sounds great! 👍", time: "09:15 AM", unread: 0, image: null, online: true },
                { id: 3, name: "Emily Davis", message: "See you tomorrow.", time: "Yesterday", unread: 0, image: null, online: false },
                { id: 4, name: "Leya Baytr", message: "Hey, there is a...", time: "Yesterday", unread: 1, image: null, online: true },
            ];
        }
    },

    // Get messages for a conversation
    getMessages: async (chatId) => {
        try {
            const response = await apiClient.get(`/chats/${chatId}/messages`);
            return response.data;
        } catch (error) {
            console.warn("Using mock messages due to API error");
            return [ // Mock data
                { id: 1, senderId: "others", text: "Hi, can we discuss the project proposal?", time: "10:00 AM" },
                { id: 2, senderId: "me", text: "Sure, I'm free at 2 PM.", time: "10:05 AM" },
                { id: 3, senderId: "others", text: "What regarding the budget?", time: "10:06 AM" },
                { id: 4, senderId: "me", text: "I hope we can fix it up.", time: "10:10 AM" },
                { id: 5, senderId: "others", text: "Well, you're available for a call?", time: "10:12 AM" },
            ];
        }
    },

    // Send a message
    sendMessage: async (chatId, text) => {
        // Optimistic response for demo
        try {
            const response = await apiClient.post(`/chats/${chatId}/messages`, { text });
            return response.data;
        } catch (error) {
            return { id: Date.now(), senderId: "me", text: text, time: "Just now" };
        }
    }
};
