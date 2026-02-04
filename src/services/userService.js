import apiClient from "../api/client";

export const userService = {
    // Get current user profile
    getProfile: async () => {
        // const response = await apiClient.get("/users/me");
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: "101",
                    name: "Maria Fernanda",
                    email: "maria@example.com",
                    avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Maria"
                });
            }, 300);
        });
    },

    // Get user friends/following
    getFriends: async () => {
        // const response = await apiClient.get("/users/friends");
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([]);
            }, 300);
        });
    },

    // Get all available interests
    getAllInterests: async () => {
        // TODO: Replace with actual API call
        // const response = await apiClient.get("/interests");
        // return response.data;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        category: "Gaming",
                        items: ["FPS", "RPG", "MOBA", "Adventure", "Strategy", "Indie"]
                    },
                    {
                        category: "Sports",
                        items: ["Football", "Cricket", "Basketball", "Tennis", "Badminton", "eSports"]
                    },
                    {
                        category: "Technology",
                        items: ["Programming", "AI", "Web Dev", "Cybersecurity", "Blockchain", "Gadgets"]
                    },
                    {
                        category: "Art & Creativity",
                        items: ["Digital Art", "Music", "Photography", "Writing", "Design", "Filmmaking"]
                    }
                ]);
            }, 500);
        });
    },

    // Update user interests
    updateUserInterests: async (interests) => {
        // const response = await apiClient.put("/users/interests", { interests });
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 800);
        });
    },

    // Get public user profile by ID
    getUserProfile: async (userId) => {
        // const response = await apiClient.get(`/users/${userId}`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: userId,
                    name: "Maria Fernanda",
                    anonymousName: "@maria_beats",
                    avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Maria",
                    isPremium: true,
                    stats: {
                        followers: 1205,
                        following: 450,
                        writings: 42
                    },

                    bio: "Beatmaker | Looking for collabs 🎵"
                });
            }, 600);
        });
    },
    // Get current user's specific interests
    getUserInterests: async () => {
        // const response = await apiClient.get("/users/interests");
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(["Gaming", "Web Dev", "Music"]);
            }, 600);
        });
    },

    // Get user followers
    getFollowers: async (userId) => {
        // const response = await apiClient.get(`/users/${userId}/followers`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 101, name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", isFollowing: true },
                    { id: 102, name: "Jane Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane", isFollowing: false },
                    { id: 103, name: "Bob Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", isFollowing: true },
                    { id: 104, name: "Alice Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice", isFollowing: false },
                ]);
            }, 600);
        });
    },

    // Get user following
    getFollowing: async (userId) => {
        // const response = await apiClient.get(`/users/${userId}/following`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 105, name: "Charlie Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie", isFollowing: true },
                    { id: 106, name: "Diana Evans", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana", isFollowing: true },
                    { id: 107, name: "Evan Foster", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Evan", isFollowing: true },
                ]);
            }, 600);
        });
    },
    // Follow a user
    followUser: async (userId) => {
        // const response = await apiClient.post(`/users/${userId}/follow`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    },

    // Unfollow a user
    unfollowUser: async (userId) => {
        // const response = await apiClient.post(`/users/${userId}/unfollow`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    },

    // Remove a follower
    removeFollower: async (followerId) => {
        // const response = await apiClient.delete(`/users/me/followers/${followerId}`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 500);
        });
    },

    // Get avatar presets
    getAvatarPresets: async () => {
        // const response = await apiClient.get("/users/avatars");
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Midnight",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Luna",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Kitty",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Max",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Daisy",
                    "https://api.dicebear.com/7.x/lorelei/svg?seed=Leo"
                ]);
            }, 300);
        });
    },

    // Update user profile
    updateUserProfile: async (data) => {
        // const response = await apiClient.put("/users/me", data);
        // return response.data;

        // Log the data to console as requested by user
        console.log("Sending profile update to backend:", data);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    user: {
                        ...data,
                        id: "101",
                        email: "maria@example.com" // Preserving read-only fields
                    }
                });
            }, 1000);
        });
    }
};
