import React, { useState, useEffect } from "react";
import { User, Loader2, PenTool, Hash, X } from "lucide-react";
import { postService } from "../../services/postService";
import { userService } from "../../services/userService";

export default function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [availableTopics, setAvailableTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [showTopicSelector, setShowTopicSelector] = useState(false);

    useEffect(() => {
        // Fetch topics (interests) to use as tags
        const loadTopics = async () => {
            const interests = await userService.getAllInterests();
            // Flatten the categories to get a list of topics
            if (interests && Array.isArray(interests)) {
                const topics = interests.flatMap(cat => cat.items);
                setAvailableTopics(topics);
            }
        };
        loadTopics();
    }, []);

    const toggleTopic = (topic) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(selectedTopics.filter(t => t !== topic));
        } else {
            if (selectedTopics.length < 3) { // Limit to 3 tags
                setSelectedTopics([...selectedTopics, topic]);
            }
        }
    };

    const handlePost = async () => {
        if (!content.trim()) return;

        try {
            setIsPosting(true);
            const newPost = await postService.createPost({
                content,
                tags: selectedTopics
            });
            setContent("");
            setSelectedTopics([]);
            setShowTopicSelector(false);
            if (onPostCreated) {
                onPostCreated(newPost);
            }
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Failed to post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-[#2D2D44] rounded-2xl shadow-sm border border-white/5 p-4 mb-6 transition-all">
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                        <User className="text-gray-400" />
                    </div>
                </div>
                <div className="flex-grow space-y-3">
                    <textarea
                        rows="3"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full bg-[#1E1E2E] border border-white/5 text-gray-200 text-sm rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all placeholder-gray-500 resize-none"
                    />

                    {/* Selected Tags Display */}
                    {selectedTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedTopics.map(topic => (
                                <span key={topic} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20">
                                    <Hash size={10} /> {topic}
                                    <button onClick={() => toggleTopic(topic)} className="hover:text-white transition-colors">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-white/5 mt-3 pt-3 flex justify-between items-center px-2">
                <div className="flex gap-4">
                    <div className="flex gap-2 items-center text-xs text-gray-400 font-medium">
                        <PenTool size={14} className="text-brand-primary" />
                        <span>Writing Mode</span>
                    </div>

                    <button
                        onClick={() => setShowTopicSelector(!showTopicSelector)}
                        className={`flex gap-2 items-center text-xs font-medium transition-colors ${showTopicSelector || selectedTopics.length > 0 ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
                    >
                        <Hash size={14} />
                        <span>{selectedTopics.length > 0 ? "Edit Topics" : "Add Topics"}</span>
                    </button>
                </div>

                <button
                    onClick={handlePost}
                    disabled={!content.trim() || isPosting}
                    className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isPosting && <Loader2 size={16} className="animate-spin" />}
                    Post
                </button>
            </div>

            {/* Topic Selector Panel */}
            {showTopicSelector && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">Select up to 3 topics</p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {availableTopics.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => toggleTopic(topic)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedTopics.includes(topic)
                                        ? "bg-brand-primary text-white border-brand-primary"
                                        : "bg-[#1E1E2E] text-gray-400 border-white/5 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
