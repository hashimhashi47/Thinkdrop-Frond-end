import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import {
  User,
  ArrowLeft,
  Loader2,
  UserPlus,
  UserMinus,
  Users,
} from "lucide-react";
import { userService } from "../services/userService";
import { postService } from "../services/postService";
import PostCard from "../components/home/PostCard";

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock Current User for ownership check
  const currentUserId = "101";
  const isOwner = userId === currentUserId;

  // Redirect Owner to their private Profile page
  if (isOwner) {
    return <Navigate to="/profile" replace />;
  }

  // inside UserProfile.jsx

  useEffect(() => {
    const initializeVisitorProfile = async () => {
      await fetchData();
    };
    initializeVisitorProfile();
  }, [userId]); // Re-run if the URL userId changes

  // inside UserProfile.jsx

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getUserProfile(userId);

      if (profileData) {
        // Set the follow button state based on the backend data
        setIsFollowing(profileData.isFollowing);

        // Map the writings for the PostCard components
        const mappedPosts = (profileData.rawWritings || []).map((post) => ({
          ...post,
          authorData: {
            name: profileData.name,
            id: profileData.id,
            avatar: profileData.avatar,
          },
          timeDisplay: post.created_at
            ? new Date(post.created_at).toLocaleDateString()
            : "Just now",
          tags: post.intrest ? [post.intrest] : [],
        }));

        setUser(profileData);
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Link to="/" className="text-brand-primary hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E2E]">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4">
        {/* Header Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Back</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-[#2D2D44] rounded-3xl p-8 mb-8 border border-white/5 shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <User size={300} />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-full border-4 border-brand-primary p-1 bg-[#1E1E2E]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover bg-[#2D2D44]"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                {user.name}
              </h1>
              <p className="text-brand-primary font-medium text-sm mb-4">
                {user.anonymousName}
              </p>

              <p className="text-gray-300 mb-6 max-w-md mx-auto md:mx-0 leading-relaxed">
                {user.bio}
              </p>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Action Button */}
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
                    isFollowing
                      ? "bg-[#1E1E2E] text-white border border-white/10 hover:border-red-500/50 hover:text-red-400"
                      : "bg-brand-primary text-white hover:bg-brand-hover shadow-lg shadow-brand-primary/25"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus size={16} /> Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Follow
                    </>
                  )}
                </button>

                {/* Stats (Non-clickable for visitors) */}
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center md:text-left">
                    <span className="block text-xl font-bold text-brand-primary">
                      {user.stats.writings}
                    </span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Writings
                    </span>
                  </div>

                  {/* Hiding numbers for visitors as per privacy request */}
                  <div className="text-center md:text-left opacity-60">
                    <span className="block text-xl font-bold text-gray-300">
                      Hidden
                    </span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Followers
                    </span>
                  </div>
                  <div className="text-center md:text-left opacity-60">
                    <span className="block text-xl font-bold text-gray-300">
                      Hidden
                    </span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                      Following
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Only Writings for Visitors */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto">
          <button className="pb-3 font-bold text-sm transition-colors relative whitespace-nowrap text-brand-primary">
            Writings
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"></div>
          </button>
          {/* Other tabs hidden for privacy */}
        </div>

        {/* Content Area - Always Writings */}
        <div className="min-h-[300px]">
          <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-bottom-2">
            {posts.length > 0 ? (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#2D2D44] rounded-3xl border border-white/5 text-gray-400">
                <p>No writings yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
