import React, { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { postService } from "../../services/postService";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    fetchPosts(0, true);
  }, []);

  const fetchPosts = async (currentOffset = 0, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const data = await postService.getPosts(LIMIT, currentOffset);

      if (!data || data.length === 0) {
        setHasMore(false);
        if (isInitial) setLoading(false);
        return;
      }

      if (data.length < LIMIT) {
        setHasMore(false);
      }

      // Transform the raw data into the format PostCard expects
      const mappedPosts = data.map((post) => ({
        ...post,
        // Ensure these keys exist for the UI logic in PostCard
        authorData: {
          name: post.user?.anonymous_name || "Anonymous",
          id: post.user?.id || "#",
          avatar: post.user?.avatarurl || null, // This maps backend avatarurl
        },
        timeDisplay: post.created_at
          ? new Date(post.created_at).toLocaleDateString()
          : "Just now",
        tags: post.interest?.name ? [post.interest.name] : [],
        isLiked: post.isLiked || post.IsLiked || post.liked || false,
      }));

      setPosts(prev => isInitial ? mappedPosts : [...prev, ...mappedPosts]);
      setOffset(currentOffset + LIMIT);

    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load feed.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchPosts(offset, false);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-400 animate-pulse">Loading feed...</div>
    );
  if (error)
    return <div className="text-center py-10 text-rose-500">{error}</div>;

  return (
    <section className="col-span-12 lg:col-span-6 space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />

      {posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No posts yet. Be the first to share!
        </div>
      ) : (
        <>
          {posts.map((post) => <PostCard key={post.id || post._id} post={post} />)}

          {hasMore && (
            <div className="text-center pt-4 pb-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-[#2D2D44] hover:bg-[#363654] text-gray-300 rounded-full text-sm font-medium transition-colors border border-white/5"
              >
                Load More
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-6 text-gray-600 text-xs">
              You've reached the end of the feed
            </div>
          )}
        </>
      )}
    </section>
  );
}
