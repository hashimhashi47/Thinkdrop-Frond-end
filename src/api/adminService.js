// Mock data for Admin Dashboard
const MOCK_DELAY = 800;

const mockUsers = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    full_name: `User Name ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 10 === 0 ? 'admin' : 'user',
    verify: i % 3 === 0, // Some verified, some not
    is_blocked: i % 15 === 0, // Some blocked
    image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
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

const mockReports = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    user: {
        Name: `User Name ${i + 10}`,
        anonymous_name: `tester_${i + 10}`,
        avatarurl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`
    },
    type: ['Bug Report', 'Feature Request', 'UI Glitch', 'Performance Issue', 'General Feedback'][Math.floor(Math.random() * 5)],
    description: `This is a sample app feedback or bug description for report ${i + 1}. The app crashed when I tried to do X, Y, and Z. Please fix it.`,
    status: 'Pending',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
}));

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

    getAdminProfile: async () => {
        try {
            const response = await apiClient.get('/admin/profile');
            // Matching the typical 'Sucess' wrapper format in this app
            if (response.data && response.data.Sucess) {
                return response.data.Sucess.data;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to fetch admin profile:", error);
            throw error;
        }
    },

    updateAdminProfile: async (profileData) => {
        try {
            const response = await apiClient.put('/admin/updateprofile', profileData);
            return response.data;
        } catch (error) {
            console.error("Failed to update admin profile:", error);
            throw error;
        }
    },

    getUsers: async (page = 1, limit = 10, search = '') => {
        const response = await apiClient.get('/admin/getuserdetails', {
            params: { page, limit, search }
        });

        // Extract the nested data from the "Sucess" key
        const result = response.data.Sucess;

        return {
            data: result.data, // This is the array of users
            total: result.total,
            // Calculate totalPages if the backend doesn't provide it
            totalPages: Math.ceil(result.total / limit)
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

    getAllPosts: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const response = await apiClient.get('/admin/getpoststats', {
            params: { limit, offset }
        });

        const result = response.data?.Sucess || {};
        const total = result.total || 0;

        return {
            data: result.data || [],
            total: total,
            totalPages: Math.ceil((total || 1) / limit),
        };
    },

    getFlaggedPosts: async (page = 1, limit = 10) => {
        // API Call
        const response = await apiClient.get('/admin/getflagedpost', {
            params: { page, limit }
        });

        const result = response.data?.Sucess || {}; // Access the "Sucess" wrapper safely

        return {
            data: result.data || [],
            total: (result.data || []).length, // Using length of array if total isn't sent
            totalPages: Math.ceil(((result.data || []).length || 1) / limit),
        };
    },

    getActivityLogs: async () => {
        try {
            const response = await apiClient.get('/admin/getpoststats?limit=10&offset=0');
            // Matches your JSON: { "Sucess": { "data": [...] } }
            return response.data?.Sucess?.data || [];
        } catch (error) {
            console.error("Failed to fetch activity logs:", error);
            return [];
        }
    },

    getReports: async (page = 1, limit = 10) => {
        try {
            const offset = (page - 1) * limit;
            const response = await apiClient.get('/admin/complaints', {
                params: { limit, offset }
            });

            const result = response.data?.Sucess || {};

            return {
                data: result.data || [],
                total: result.total || 0,
                totalPages: Math.ceil((result.total || 0) / limit),
            };
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            return { data: [], total: 0, totalPages: 1 };
        }
    },

    updateReportStatus: async (reportId, status) => {
        try {
            // Adjust the endpoint if your backend uses a different route for status updates
            const response = await apiClient.put(`/admin/complaints/${reportId}`, { status });
            return response.data;
        } catch (error) {
            console.error("Failed to update report status:", error);
            throw error;
        }
    },


    // --- Actions ---

    createUser: async (userData) => {
        try {
            const response = await apiClient.post(`/admin/adduser`, userData);
            return response.data;
        } catch (error) {
            console.error("Failed to create user:", error);
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await apiClient.put(`/admin/updateuser/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error("Failed to update user:", error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await apiClient.delete(`/admin/deleteuser/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete user:", error);
            throw error;
        }
    },

    updateUserStatus: async (userId, status) => {
        // Real API Call:
        // await apiClient.patch(`/admin/users/${userId}/status`, { status });
        // return { success: true };

        await sleep(MOCK_DELAY);
        console.log(`[MOCK] Updated user ${userId} status to ${status}`);
        return { success: true };
    },

    blockUser: async (userId) => {
        try {
            const response = await apiClient.post(`/admin/block-user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to block user:", error);
            throw error;
        }
    },

    unblockUser: async (userId) => {
        try {
            const response = await apiClient.post(`/admin/unblock-user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to unblock user:", error);
            throw error;
        }
    },

    updatePostInterest: async (postId, interestIds) => {
        try {
            const response = await apiClient.put(`/admin/updatepostinterest/${postId}`, { interest_ids: interestIds });
            return response.data;
        } catch (error) {
            console.error("Failed to update post interest:", error);
            throw error;
        }
    },

    blockPost: async (postId) => {
        try {
            const response = await apiClient.post(`/admin/block-post/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to block post:", error);
            throw error;
        }
    },

    unblockPost: async (postId) => {
        try {
            const response = await apiClient.post(`/admin/unblock-post/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to unblock post:", error);
            throw error;
        }
    },

    deletePost: async (postId) => {
        try {
            // Changed from .post to .delete to match REST standards
            const response = await apiClient.delete(`/admin/delete-posts/${postId}`);
            return response.data;
        } catch (error) {
            // Updated error message to be context-aware
            console.error(`Failed to delete post with ID ${postId}:`, error);
            throw error;
        }
    },

    markPostSafe: async (postId) => {
        try {
            const response = await apiClient.post(`/admin/Safe-posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to block wallet:", error);
            throw error;
        }
    },

    // --- Wallet Management ---

    getWallets: async (page = 1, limit = 10, search = '') => {
        const response = await apiClient.get('/admin/getwallets', {
            params: { page, limit, search }
        });

        // Extract from misspelled "Sucess" key
        const result = response.data.Sucess;

        return {
            data: result.data || [],
            total: result.total || result.data.length,
            totalPages: Math.ceil((result.total || result.data.length) / limit),
        };
    },

    blockWallet: async (walletId) => {
        try {
            const response = await apiClient.post(`/admin/block-wallet/${walletId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to block wallet:", error);
            throw error;
        }
    },

    unblockWallet: async (walletId) => {
        try {
            const response = await apiClient.post(`/admin/unblock-wallet/${walletId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to unblock wallet:", error);
            throw error;
        }
    },

    verifyWalletBank: async (bankAccountId) => {
        try {
            const response = await apiClient.post(`/admin/verify-bank-account/${bankAccountId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to verify bank account:", error);
            throw error;
        }
    },

    // --- Interests Management ---

    getInterests: async () => {
        try {
            const response = await apiClient.get("/getallinterest");
            if (response.data && response.data.interests && response.data.interests.data) {
                return response.data.interests.data; // Raw array: [{ ID, Name, SubInterests: [{ID, Name}] }]
            }
            return [];
        } catch (error) {
            console.error("Failed to fetch interests:", error);
            throw error;
        }
    },

    createMainInterest: async (name) => {
        try {
            const response = await apiClient.post("/admin/createinterest", { name });
            return response.data;
        } catch (error) {
            console.error("Failed to create main interest:", error);
            throw error;
        }
    },

    updateMainInterest: async (id, name) => {
        try {
            const response = await apiClient.put(`/admin/updateinterest/${id}`, { name });
            return response.data;
        } catch (error) {
            console.error("Failed to update main interest:", error);
            throw error;
        }
    },

    deleteMainInterest: async (id) => {
        try {
            const response = await apiClient.delete(`/admin/deleteinterest/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete main interest:", error);
            throw error;
        }
    },

    createSubInterest: async (parentId, name) => {
        try {
            const response = await apiClient.post("/admin/createsubinterest", { parent_id: parentId, name });
            return response.data;
        } catch (error) {
            console.error("Failed to create sub interest:", error);
            throw error;
        }
    },

    updateSubInterest: async (id, name) => {
        try {
            const response = await apiClient.put(`/admin/updatesubinterest/${id}`, { name });
            return response.data;
        } catch (error) {
            console.error("Failed to update sub interest:", error);
            throw error;
        }
    },

    deleteSubInterest: async (id) => {
        try {
            const response = await apiClient.delete(`/admin/deletesubinterest/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete sub interest:", error);
            throw error;
        }
    }
};
