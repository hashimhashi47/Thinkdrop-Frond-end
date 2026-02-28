import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Share2, MoreHorizontal, User, Hash, Flag } from "lucide-react";
import toast from 'react-hot-toast';
import { postService } from "../../services/postService";

export default function PostCard({ post }) {
  // 1. Extract base properties from the post object
  // We extract 'content' and 'id' here to fix the ReferenceError
  const { content, id } = post;

  // 2. Prioritize mapped authorData from service, fallback to raw user object
  const author = post.authorData || post.user;

  const authorData = {
    name: author?.name || author?.anonymous_name || "Anonymous",
    id: author?.id || "#",
    avatar: author?.avatar || author?.avatarurl || null,
  };

  // 3. Normalize Tags & Likes
  const tags = Array.isArray(post.tags)
    ? post.tags
    : post.interest?.name
      ? [post.interest.name]
      : [];

  const initialLikes =
    post.likes !== undefined ? post.likes : post.like_count || 0;

  // 4. Normalize Timestamps
  const displayTime = post.createdAt || post.created_at;
  const timeDisplay = displayTime
    ? new Date(displayTime).toLocaleDateString()
    : "Just now";

  // 5. States for interactions
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(
    initialLikes < 0 ? 0 : initialLikes,
  );

  // Report Feature States
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const handleLikeToggle = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      if (newIsLiked) {
        await postService.likePost(id);
      } else {
        await postService.unlikePost(id);
      }
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason) return;

    setIsReporting(true);
    try {
      await postService.reportPost(id, reportReason, customReason);
      setShowReportModal(false);
      setReportReason("");
      setCustomReason("");
      toast.success("Post reported successfully. Our team will review it shortly.");
    } catch (error) {
      console.error("Failed to report post:", error);
      toast.error("Failed to send report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="bg-[#2D2D44] rounded-2xl shadow-sm border border-white/5 p-6 mb-6 hover:border-white/10 transition-colors text-left relative">
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#2D2D44] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Report Post</h3>
            <p className="text-sm text-gray-400 mb-4">Please select a reason for reporting this post.</p>

            <div className="space-y-3 mb-4">
              {['Spam', 'Harassment', 'Inappropriate Content', 'Misinformation', 'Other'].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-brand-primary focus:ring-brand-primary bg-[#1E1E2E] border-white/20"
                  />
                  <span className="text-gray-300 group-hover:text-white">{reason}</span>
                </label>
              ))}
            </div>

            {reportReason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide more details..."
                className="w-full bg-[#1E1E2E] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-primary mb-4"
                rows="3"
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason || isReporting}
                className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isReporting ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/user/${authorData.id}`} className="block flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
              {authorData.avatar ? (
                <img
                  src={authorData.avatar}
                  alt={authorData.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <User className="text-gray-400" size={20} />
              )}
            </div>
          </Link>
          <div>
            <Link
              to={`/user/${authorData.id}`}
              className="font-bold text-gray-200 text-sm hover:text-white transition-colors block"
            >
              {authorData.name}
            </Link>
            <p className="text-xs text-gray-500">{timeDisplay}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
          >
            <MoreHorizontal size={20} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E1E2E] border border-white/10 rounded-lg shadow-xl py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowReportModal(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-2"
              >
                <Flag size={14} /> Report Post
              </button>
              {/* Click outside closer could go here, for now relying on user clicking elsewhere or button toggle */}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
          {content}{" "}
          {/* This variable is now defined from the destructuring in step 1 */}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E1E2E] text-xs font-medium text-brand-primary border border-white/5"
            >
              <Hash size={10} /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex bg-[#1E1E2E]/50 rounded-xl p-2 justify-between items-center px-4 mt-6">
        <div className="flex gap-6">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 transition-colors group ${isLiked ? "text-rose-500" : "text-gray-500 hover:text-rose-500"}`}
          >
            <Heart
              size={18}
              className={`transition-transform group-hover:scale-110 ${isLiked ? "fill-current" : ""}`}
            />
            <span className="text-xs font-semibold">{likesCount}</span>
          </button>
        </div>
        <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
          <Share2
            size={18}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-xs font-semibold">Share</span>
        </button>
      </div>
    </div>
  );
}
