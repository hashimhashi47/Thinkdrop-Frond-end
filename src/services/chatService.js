import apiClient from "../api/client";

export const chatService = {
    // Get all conversations
    getConversations: async () => {
        try {
            const response = await apiClient.get("/chats");
            return response.data;
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    },

    // Get messages for a conversation
    getMessages: async (chatId) => {
        try {
            const response = await apiClient.get(`/chats/${chatId}/messages`);
            return response.data;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    },

    // Send a message
    sendMessage: async (chatId, text) => {
        try {
            const response = await apiClient.post(`/chats/${chatId}/messages`, { text });
            return response.data;
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }
};
