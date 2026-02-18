// Mock data for Admin Dashboard
const MOCK_DELAY = 800;

const mockUsers = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User_${i + 1}`,
    handle: `@user_${i + 1}`,
    role: i % 10 === 0 ? 'Admin' : i % 5 === 0 ? 'Moderator' : 'User',
    status: i % 15 === 0 ? 'Banned' : i % 7 === 0 ? 'Warning' : 'Active',
    location: `192.168.1.${100 + i}`,
    joined: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
}));

const mockAccounts = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    userId: i + 1,
    userName: `User_${i + 1}`,
    balance: (Math.random() * 1000).toFixed(2),
    pointsRedeemed: Math.floor(Math.random() * 5000),
    lastTransaction: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
    status: Math.random() > 0.9 ? 'Frozen' : 'Active',
}));

const mockReports = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    reporter: `@reporter_${i}`,
    reportedUser: `@target_${i}`,
    reason: ['Spam', 'Harassment', 'Inappropriate Content', 'Bot Behavior'][Math.floor(Math.random() * 4)],
    status: ['Pending', 'Reviewed', 'Dismissed'][Math.floor(Math.random() * 3)],
    date: new Date(Date.now() - Math.floor(Math.random() * 500000000)).toISOString().split('T')[0],
}));

const mockPosts = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    author: `@author_${i}`,
    content: `This is a suspicious post content #${i}. 需要注意.`,
    risk: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
    status: 'Flagged',
    time: `${Math.floor(Math.random() * 24)}h ago`,
}));

const mockActivityLogs = [
    { id: 1, user: "USER_8492", action: "Posted new encrypted content", time: "00:01:23", status: "normal" },
    { id: 2, user: "USER_1120", action: "Connection attempt failed", time: "00:02:45", status: "warning" },
    { id: 3, user: "USER_3391", action: "Updated profile metrics", time: "00:05:12", status: "normal" },
    { id: 4, user: "USER_7721", action: "Uploaded data packet (Img)", time: "00:08:00", status: "normal" },
    { id: 5, user: "SYSTEM", action: "Daily purge sequence initiated", time: "00:10:00", status: "warning" },
    { id: 6, user: "USER_0021", action: "New account registration", time: "00:12:30", status: "normal" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import apiClient from "./client";

export const adminService = {
    getStats: async () => {
        try {
            const response = await apiClient.get('/admin/getstats');

            // Postman structure: response.data -> { Sucess: { data: { ... } } }
            if (response.data && response.data.Sucess) {
                return response.data.Sucess.data;
            }

            return null;
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            return null;
        }
    },

    getUsers: async (page = 1, limit = 10, search = '') => {
        // Real API Call:
        // const response = await apiClient.get('/admin/users', { params: { page, limit, search } });
        // return response.data;

        await sleep(MOCK_DELAY);
        let filtered = mockUsers;
        if (search) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.handle.toLowerCase().includes(search.toLowerCase())
            );
        }
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        return {
            data: paginated,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
            currentPage: page,
        };
    },

    getAccounts: async (limit = 10, offset = 0, search = '') => {
        try {
            const response = await apiClient.get('/admin/getaccounts', {
                params: {
                    limit,
                    offset,
                    search
                }
            });

            if (response.data && response.data.Sucess) {
                const apiData = response.data.Sucess;
                const total = apiData.total || 0;

                return {
                    data: apiData.data || [],
                    total: total
                };
            }

            return { data: [], total: 0 };
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
            return { data: [], total: 0 };
        }
    },

    getAccountStats: async () => {
        try {
            const response = await apiClient.get('/admin/getaccountstats');
            if (response.data && response.data.Sucess) {
                return response.data.Sucess.data;
            }
            return { totalBalance: 0, totalRedeemed: 0 };
        } catch (error) {
            console.error("Failed to fetch account stats:", error);
            return { totalBalance: 0, totalRedeemed: 0 };
        }
    },

    getReports: async (page = 1, limit = 10) => {
        // Real API Call:
        // const response = await apiClient.get('/admin/reports', { params: { page, limit } });
        // return response.data;

        await sleep(MOCK_DELAY);
        const start = (page - 1) * limit;
        const paginated = mockReports.slice(start, start + limit);
        return {
            data: paginated,
            total: mockReports.length,
            totalPages: Math.ceil(mockReports.length / limit),
            currentPage: page,
            total: mockReports.length // Ensuring total count is returned
        };
    },

    getFlaggedPosts: async (page = 1, limit = 10) => {
        // Real API Call:
        // const response = await apiClient.get('/admin/posts/flagged', { params: { page, limit } });
        // return response.data;

        await sleep(MOCK_DELAY);
        const start = (page - 1) * limit;
        const paginated = mockPosts.slice(start, start + limit);
        return {
            data: paginated,
            total: mockPosts.length,
            totalPages: Math.ceil(mockPosts.length / limit),
            currentPage: page,
        };
    },

    getActivityLogs: async () => {
        const response = await apiClient.get('/admin/getpoststats?limit=10&offset=0');
        // Matches your JSON: { "Sucess": { "data": [...] } }
        return response.data.Sucess.data;
    },


    // --- Actions ---

    updateUserStatus: async (userId, status) => {
        // Real API Call:
        // await apiClient.patch(`/admin/users/${userId}/status`, { status });
        // return { success: true };

        await sleep(MOCK_DELAY);
        console.log(`[MOCK] Updated user ${userId} status to ${status}`);
        return { success: true };
    },

    resolveReport: async (reportId) => {
        // Real API Call:
        // await apiClient.post(`/admin/reports/${reportId}/resolve`);
        // return { success: true };

        await sleep(MOCK_DELAY);
        console.log(`[MOCK] Resolved report ${reportId}`);
        return { success: true };
    },

    dismissReport: async (reportId) => {
        // Real API Call:
        // await apiClient.post(`/admin/reports/${reportId}/dismiss`);
        // return { success: true };

        await sleep(MOCK_DELAY);
        console.log(`[MOCK] Dismissed report ${reportId}`);
        return { success: true };
    },

    deletePost: async (postId) => {
        // Real API Call:
        // await apiClient.delete(`/admin/posts/${postId}`);
        // return { success: true };

        await sleep(MOCK_DELAY);
        console.log(`[MOCK] Deleted post ${postId}`);
        return { success: true };
    },

    markPostSafe: async (postId) => {
        // Real API Call:
        // await apiClient.post(`/admin/posts/${postId}/safe`);
        // return { success: true };

        await sleep(MOCK_DELAY);
        console.log(`[MOCK] Marked post ${postId} as safe`);
        return { success: true };
    }
};
