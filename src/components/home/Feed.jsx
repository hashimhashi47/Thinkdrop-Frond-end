import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { postService } from "../../services/postService";

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await postService.getPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            // setError("Failed to load feed."); 
            // Fallback is handled in service now
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    }

    if (loading) return <div className="text-center py-10 text-gray-400">Loading feed...</div>;
    if (error) return <div className="text-center py-10 text-rose-500">{error}</div>;

    return (
        <section className="col-span-12 lg:col-span-6 space-y-6">
            <CreatePost onPostCreated={handlePostCreated} />

            {posts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No posts yet. Be the first to share!</div>
            ) : (
                posts.map((post) => (
                    <PostCard
                        key={post.id || post._id}
                        post={post}
                    />
                ))
            )}
        </section>
    );
}
