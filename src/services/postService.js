import apiClient from "../api/client";

export const postService = {
    // Get all posts (Feed)
    getPosts: async () => {
        // Mock implementation for now
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        author: {
                            name: "Maria Fernanda",
                            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Maria",
                            id: "101"
                        },
                        content: "Just dropped a new beat! 🎹 #lofi #chill",
                        tags: ["Music", "Lofi"],
                        likes: 120,
                        comments: 15,
                        timestamp: "2h ago",
                        isLiked: false
                    },
                    {
                        id: 2,
                        user: { name: "Mike Chen", avatar: null },
                        content: "The best ideas come when you're least expecting them.",
                        tags: ["Philosophy", "Writing"],
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        likes: [1, 2],
                        comments: []
                    }
                ]);
            }, 500);
        });
    },

    // Create a new post
    createPost: async (postData) => {
        // const response = await apiClient.post("/posts", postData);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: Math.random(), ...postData, likes: 0, comments: 0 });
            }, 300);
        });
    },

    // Like a post
    likePost: async (postId) => {
        // const response = await apiClient.post(`/posts/${postId}/like`);
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, likes: 10 });
            }, 300);
        });
    },

    // Comment on a post
    commentPost: async (postId, content) => {
        // const response = await apiClient.post(`/posts/${postId}/comments`, { content });
        // return response.data;
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: Math.random(), content, author: { name: "Me" } });
            }, 300);
        });
    },

    // Get posts by specific user
    getUserPosts: async (userId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 3,
                        author: {
                            name: "Maria Fernanda",
                            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Maria",
                            id: userId
                        },
                        content: "Exploring the depths of sound. 🌊",
                        tags: ["Music", "Ambient"],
                        likes: 200,
                        comments: 45,
                        timestamp: "1d ago",
                        isLiked: false
                    },
                    {
                        id: 4,
                        author: {
                            name: "Maria Fernanda",
                            avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Maria",
                            id: userId
                        },
                        content: "Music is the silence between the notes.",
                        tags: ["Music", "Philosophy"],
                        likes: 340,
                        comments: 12,
                        timestamp: "3d ago",
                        isLiked: true
                    }
                ]);
            }, 600);
        });
    }
};
