import apiClient from "../api/client";

export const notificationService = {
    getNotifications: async () => {
        try {
            const response = await apiClient.get("/notifications");
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    },

    markAsRead: async (id) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    markAllAsRead: async () => {
        try {
            await apiClient.put(`/notifications/read-all`);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    }
};
