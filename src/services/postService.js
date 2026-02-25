import apiClient from "../api/client";

export const postService = {
    // Get all posts (Feed)
    getPosts: async (limit = 20, offset = 0) => {
        const response = await apiClient.get("/post/getallfeed", {
            params: { limit, offset }
        });

        // According to your JSON, we need to return: response.data.Sucess.data
        if (response.data?.Sucess) {
            return response.data.Sucess.data;
        }

        // Handle the case where backend sends "Error" instead
        if (response.data?.Error) {
            throw new Error(response.data.Error.error);
        }

        return [];
    },
    // Create a new post
    createPost: async (postData) => {
        try {
            // 1. Make the real POST request to your endpoint
            const response = await apiClient.post("/post/uploadpost", postData);

            // 2. Based on your JSON, the actual data is nested inside 'Sucess.data'
            if (response.data && response.data.Sucess.status) {
                return response.data.Sucess.data;
            } else {
                throw new Error("Failed to create post: API returned success=false");
            }
        } catch (error) {
            console.error("Error in createPost:", error);
            throw error; // Pass the error up to your UI component
        }
    },

    // Like a post
    likePost: async (postId) => {
        try {
            // Updated URL to match your endpoint structure
            const response = await apiClient.post(`/post/likepost/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Error liking post:", error);
            throw error;
        }
    },

    // Unlike a post
    unlikePost: async (postId) => {
        try {
            // Assuming your unlike endpoint follows a similar pattern
            // Adjust if your backend uses a different URL for unliking
            const response = await apiClient.post(`/post/unlikepost/${postId}`);
            return response.data;
        } catch (error) {
            console.error("Error unliking post:", error);
            throw error;
        }
    },

    // Comment on a post
    commentPost: async (postId, content) => {
        try {
            const response = await apiClient.post(`/posts/${postId}/comments`, { content });
            return response.data;
        } catch (error) {
            console.error("Error commenting on post:", error);
            throw error;
        }
    },

    // services/postService.js
    getUserPosts: async (limit = 10, offset = 0) => {
        try {
            const response = await apiClient.get("/users/writings", {
                params: { limit, offset }
            });

            if (response.data?.Sucess) {
                const rawPosts = response.data.Sucess.data;

                return rawPosts.map(post => ({
                    id: post.id,
                    content: post.content,
                    createdAt: post.created_at,
                    likes: post.like_count < 0 ? 0 : post.like_count,
                    tags: post.interest ? [post.interest.name] : [],
                    // This is the part PostCard needs to see!
                    authorData: {
                        id: post.user.id,
                        name: post.user.anonymous_name,
                        avatar: post.user.avatarurl,
                    },
                    comments: 0,
                    // Check for various possible casing/names from backend
                    isLiked: post.isliked || post.isLiked || post.IsLiked || post.liked || false
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching user writings:", error);
            throw error;
        }
    },

    // Report a post
    reportPost: async (postId, reason, description = "") => {
        try {
            const response = await apiClient.post("/post/reportpost", {
                postId,
                reason,
                description
            });
            return response.data;
        } catch (error) {
            console.error("Error reporting post:", error);
            throw error;
        }
    }
};
