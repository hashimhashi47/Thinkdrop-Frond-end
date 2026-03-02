import React, { useEffect, useState } from "react";
import { User, MoreHorizontal, Circle } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useNavigate } from "react-router-dom";

export default function RightFriends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatService.getSidebar();
                // Filter deduplication by conversation_id to mimic Chat.jsx
                if (data && data.length > 0) {
                    const uniqueData = [];
                    const seenIds = new Set();
                    for (const c of data) {
                        if (seenIds.has(c.conversation_id)) continue;
                        seenIds.add(c.conversation_id);
                        uniqueData.push(c);
                    }
                    uniqueData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setFriends(uniqueData);
                } else {
                    setFriends([]);
                }
            } catch (error) {
                console.error("Failed to load right sidebar chats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    const handleFriendClick = (friend) => {
        // Navigate to chat and potentially trigger auto-select if your Chat.jsx supports it,
        // otherwise just taking them to the chat page is usually sufficient.
        // We can pass the targetUserId as state if your Chat.jsx initChat uses it.
        navigate("/chat", { state: { targetUserId: friend.user_id } });
    };

    return (
        <aside className="col-span-12 lg:col-span-3 hidden lg:block">
            <div className="bg-[#2D2D44] rounded-2xl shadow-sm border border-white/5 p-4 sticky top-24">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="font-bold text-gray-200 text-sm">Recent Chats</h2>
                    <button className="text-gray-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500 text-xs animate-pulse">Loading chats...</div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-xs">No recent chats</div>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend.conversation_id}
                                onClick={() => handleFriendClick(friend)}
                                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                            >
                                <div className="relative shrink-0">
                                    <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                                        {friend.user_image_url ? (
                                            <img src={friend.user_image_url} alt="avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#2D2D44]"></span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-300 group-hover:text-brand-primary transition-colors truncate">
                                        {friend.user_name || "Unknown User"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate">
                                        {friend.created_at ? new Date(friend.created_at).toLocaleDateString() : ""}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={() => navigate("/chat")}
                    className="w-full mt-4 text-xs font-semibold text-brand-primary hover:text-brand-hover hover:bg-brand-primary/10 py-2 rounded-lg transition-colors"
                >
                    Open Messages
                </button>
            </div>
        </aside>
    );
}
