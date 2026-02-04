import apiClient from "../api/client";

export const notificationService = {
    getNotifications: async () => {
        try {
            const response = await apiClient.get("/notifications");
            return response.data;
        } catch (error) {
            console.warn("Using mock notifications due to API error");
            return [
                {
                    id: 1,
                    type: "like",
                    user: { name: "Sarah Johnson", avatar: null },
                    text: "liked your post 'The future of AI is anon...'",
                    time: "2 mins ago",
                    read: false,
                },
                {
                    id: 2,
                    type: "comment",
                    user: { name: "Mike Chen", avatar: null },
                    text: "commented: 'Totally agree with this!'",
                    time: "1 hour ago",
                    read: false,
                },
                {
                    id: 3,
                    type: "follow",
                    user: { name: "Anonymous User", avatar: null },
                    text: "started following you",
                    time: "3 hours ago",
                    read: true,
                },
                {
                    id: 4,
                    type: "system",
                    user: { name: "System", avatar: null },
                    text: "Welcome to ThinkDrop! 🚀",
                    time: "1 day ago",
                    read: true,
                },
            ];
        }
    },

    markAsRead: async (id) => {
        try {
            await apiClient.put(`/notifications/${id}/read`);
        } catch (error) {
            // Mock success
            console.log("Marked as read", id);
        }
    },

    markAllAsRead: async () => {
        try {
            await apiClient.put(`/notifications/read-all`);
        } catch (error) {
            console.log("All marked as read");
        }
    }
};
