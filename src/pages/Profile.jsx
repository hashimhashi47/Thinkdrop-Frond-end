import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { User, FileText, Users, Loader2, Award, ThumbsUp, UserPlus, PenTool, Bookmark } from "lucide-react";
import { userService } from "../services/userService";
import { postService } from "../services/postService";
import PostCard from "../components/home/PostCard";
import { Link } from "react-router-dom";

export default function Profile() {
    // Current User Identity (Mocked)
    const currentUserId = "101";

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("writings"); // writings, followers, following

    // Extended User Data (Preserving original profile uniqueness not present in API)
    const [extendedData] = useState({
        level: "Senior Writer",
        levelProgress: 75
    });

    // Handlers for list actions
    const handleRemoveFollower = async (followerId) => {
        try {
            await userService.removeFollower(followerId);
            setFollowers(prev => prev.filter(f => f.id !== followerId));
        } catch (error) {
            console.error("Failed to remove follower", error);
        }
    };

    const handleFollowBack = async (followerId) => {
        try {
            await userService.followUser(followerId);
            setFollowers(prev => prev.map(f =>
                f.id === followerId ? { ...f, isFollowing: true } : f
            ));
            // Optimistically update Following list too if needed
        } catch (error) {
            console.error("Failed to follow back", error);
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await userService.unfollowUser(userId);
            setFollowing(prev => prev.filter(f => f.id !== userId));
        } catch (error) {
            console.error("Failed to unfollow user", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Data for the Current User (101)
                const [profileData, postsData] = await Promise.all([
                    userService.getUserProfile(currentUserId),
                    postService.getUserPosts(currentUserId)
                ]);

                setUser(profileData);
                setPosts(postsData);

                const [followersData, followingData] = await Promise.all([
                    userService.getFollowers(currentUserId),
                    userService.getFollowing(currentUserId)
                ]);
                setFollowers(followersData);
                setFollowing(followingData);

            } catch (error) {
                console.error("Failed to fetch profile data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate Rewards Stats
    // Rewards logic moved to dedicated Rewards page

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
                <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1E1E2E] pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4">

                {/* Main Profile Card (Original Design Preserved) */}
                <div className="bg-[#2D2D44] rounded-3xl p-8 mb-8 border border-white/5 shadow-xl relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <User size={300} />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0 relative">
                            <div className="h-32 w-32 rounded-3xl bg-gradient-to-tr from-brand-primary to-blue-500 p-1">
                                <div className="h-full w-full bg-[#2D2D44] rounded-[22px] flex items-center justify-center overflow-hidden">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerHTML = '<User size={64} class="text-gray-300" />';
                                        }}
                                    />
                                    {/* Fallback icon handling is tricky with img tag, but if img loads it covers div background */}
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-3 bg-white text-[#1E1E2E] rounded-full p-2 border-4 border-[#2D2D44] shadow-lg">
                                <span className="text-xl">🔥</span>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>

                            <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                                <p className="text-brand-primary font-semibold text-sm uppercase tracking-wider">{extendedData.level}</p>
                                <span className="text-gray-600">•</span>
                                <Link to="/edit-profile" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-[#1E1E2E] px-3 py-1 rounded-full border border-white/5 hover:border-white/20">
                                    <PenTool size={12} /> Edit
                                </Link>
                            </div>

                            {/* Bio */}
                            <p className="text-gray-300 mb-6 max-w-md mx-auto md:mx-0 leading-relaxed text-sm">
                                {user.bio}
                            </p>

                            {/* Level Progress (Original Feature) */}
                            <div className="mb-8 max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                                    <span>Level Progress</span>
                                    <span>{extendedData.levelProgress}%</span>
                                </div>
                                <div className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full"
                                        style={{ width: `${extendedData.levelProgress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats (Interactive) */}
                            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
                                <button onClick={() => setActiveTab("writings")} className="bg-[#1E1E2E] rounded-2xl p-4 flex flex-col items-center group cursor-pointer hover:bg-white/5 transition-colors border border-transparent hover:border-brand-primary/20">
                                    <FileText size={20} className={`mb-2 transition-colors ${activeTab === 'writings' ? 'text-brand-primary' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span className="text-xl font-bold text-white mb-0.5">{user.stats.writings}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Writings</span>
                                </button>
                                <button onClick={() => setActiveTab("followers")} className="bg-[#1E1E2E] rounded-2xl p-4 flex flex-col items-center group cursor-pointer hover:bg-white/5 transition-colors border border-transparent hover:border-brand-primary/20">
                                    <Users size={20} className={`mb-2 transition-colors ${activeTab === 'followers' ? 'text-brand-primary' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span className="text-xl font-bold text-white mb-0.5">{user.stats.followers}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</span>
                                </button>
                                <button onClick={() => setActiveTab("following")} className="bg-[#1E1E2E] rounded-2xl p-4 flex flex-col items-center group cursor-pointer hover:bg-white/5 transition-colors border border-transparent hover:border-brand-primary/20">
                                    <Bookmark size={20} className={`mb-2 transition-colors ${activeTab === 'following' ? 'text-brand-primary' : 'text-gray-400 group-hover:text-white'}`} />
                                    <span className="text-xl font-bold text-white mb-0.5">{user.stats.following || 0}</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Following</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex items-center gap-6 border-b border-white/10 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("writings")}
                        className={`pb-3 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === "writings" ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
                    >
                        Writings
                        {activeTab === "writings" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab("followers")}
                        className={`pb-3 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === "followers" ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
                    >
                        Followers
                        {activeTab === "followers" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab("following")}
                        className={`pb-3 font-bold text-sm transition-colors relative whitespace-nowrap ${activeTab === "following" ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
                    >
                        Following
                        {activeTab === "following" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"></div>}
                    </button>

                </div>

                {/* Content Area */}
                <div className="min-h-[300px]">
                    {activeTab === "writings" && (
                        <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300 slide-in-from-bottom-2">
                            {/* Left Column: Posts */}
                            <div className="space-y-6">
                                {posts.length > 0 ? (
                                    <div className="grid gap-6">
                                        {posts.map(post => (
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
                    )}

                    {activeTab === "followers" && (
                        <div className="grid gap-4 animate-in fade-in duration-300 slide-in-from-bottom-2">
                            {followers.length > 0 ? (
                                followers.map(follower => (
                                    <div key={follower.id} className="bg-[#2D2D44] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={follower.avatar} alt={follower.name} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{follower.name}</h4>
                                                <span className="text-xs text-gray-400">User ID: {follower.id}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (follower.isFollowing) {
                                                    handleRemoveFollower(follower.id);
                                                } else {
                                                    handleFollowBack(follower.id);
                                                }
                                            }}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-colors ${follower.isFollowing
                                                ? 'border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                                                : 'bg-brand-primary text-white border-transparent hover:bg-brand-hover'
                                                }`}
                                        >
                                            {follower.isFollowing ? 'Remove' : 'Follow Back'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Users size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No followers yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "following" && (
                        <div className="grid gap-4 animate-in fade-in duration-300 slide-in-from-bottom-2">
                            {following.length > 0 ? (
                                following.map(follow => (
                                    <div key={follow.id} className="bg-[#2D2D44] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={follow.avatar} alt={follow.name} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{follow.name}</h4>
                                                <span className="text-xs text-gray-400">User ID: {follow.id}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnfollow(follow.id)}
                                            className="px-4 py-1.5 text-xs font-bold rounded-full border border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
                                        >
                                            Unfollow
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <UserPlus size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Not following anyone yet.</p>
                                </div>
                            )}
                        </div>
                    )}


                </div>

            </main>
        </div>
    );
}
