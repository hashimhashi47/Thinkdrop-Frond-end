import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Hash } from "lucide-react";

export default function PostCard({ post }) {
    const { author, user, content, tags, likes, comments, timestamp, createdAt } = post;
    const authorData = author || user || { name: "Unknown", id: "#" };
    const timeDisplay = timestamp || (createdAt ? new Date(createdAt).toLocaleDateString() : "Just now");

    // Normalize likes/comments count
    const likesCount = Array.isArray(likes) ? likes.length : (likes || 0);
    const commentsCount = Array.isArray(comments) ? comments.length : (comments || 0);

    return (
        <div className="bg-[#2D2D44] rounded-2xl shadow-sm border border-white/5 p-6 mb-6 hover:border-white/10 transition-colors">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/user/${authorData.id}`} className="block flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                            {authorData.avatar ? (
                                <img src={authorData.avatar} alt={authorData.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="text-gray-400" />
                            )}
                        </div>
                    </Link>
                    <div>
                        <Link to={`/user/${authorData.id}`} className="font-bold text-gray-200 text-sm hover:text-white cursor-pointer transition-colors block">
                            {authorData.name}
                        </Link>
                        <p className="text-xs text-gray-500">{timeDisplay}</p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors user-select-none cursor-pointer">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
                <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {content}
                </p>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E1E2E] text-xs font-medium text-brand-primary border border-white/5">
                            <Hash size={10} />
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Post Actions */}
            <div className="flex bg-[#1E1E2E]/50 rounded-xl p-2 justify-between items-center px-4 mt-6">
                <div className="flex gap-6">
                    <PostAction icon={Heart} label={likesCount} color="hover:text-rose-500" />
                    <PostAction icon={MessageCircle} label={commentsCount} color="hover:text-blue-500" />
                </div>
                <PostAction icon={Share2} label="Share" color="hover:text-green-500" />
            </div>
        </div>
    );
}

function PostAction({ icon: Icon, label, color }) {
    return (
        <button className={`flex items-center gap-2 text-gray-500 ${color} transition-colors group`}>
            <Icon size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">{label}</span>
        </button>
    )
}
