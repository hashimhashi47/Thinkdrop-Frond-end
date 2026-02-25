import React from "react";
import { User, Search, Hash } from "lucide-react";

export default function ConversationList({ conversations, activeId, onSelect, myId }) {

    // Helper to extract a display name when only user IDs are available
    const getOtherUserId = (conv) => {
        if (!conv) return "Unknown";
        if (conv.User1ID === myId) return conv.User2ID;
        if (conv.User2ID === myId) return conv.User1ID;
        // Fallback if myId is undefined: just pick the one that isn't 0
        return conv.User2ID !== 0 ? conv.User2ID : conv.User1ID;
    };

    return (
        <div className="md:col-span-4 lg:col-span-3 bg-[#11121C] border-r border-white/5 flex flex-col h-full relative overflow-hidden">
            {/* Ambient Background Gradient */}
            <div className="absolute top-0 right-[-20%] w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="p-6 pb-2 z-10 shrink-0">
                <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center justify-between">
                    Messages
                    <span className="bg-brand-primary/20 text-brand-primary text-xs font-bold px-2 py-1 rounded-md">
                        {conversations.length}
                    </span>
                </h2>

                {/* Search Bar */}
                <div className="relative group mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors duration-300" />
                    <input
                        className="w-full pl-11 pr-5 py-3 text-sm border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md text-white focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-300 shadow-sm placeholder-slate-500"
                        placeholder="Search conversations..."
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 z-10 space-y-1">
                {conversations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <div className="bg-white/5 p-4 rounded-full border border-white/5">
                            <Search size={32} className="text-brand-primary/50" />
                        </div>
                        <p className="text-sm font-medium">No conversations found</p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isSelect = activeId === conv.ID;
                        const partnerId = getOtherUserId(conv);
                        const displayTime = new Date(conv.CreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                        return (
                            <div
                                key={conv.ID}
                                onClick={() => onSelect(conv)}
                                className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ` +
                                    (isSelect
                                        ? "bg-gradient-to-r from-brand-primary/20 to-[#2D2D44]/40 border border-brand-primary/30 shadow-lg shadow-brand-primary/10 transform scale-[1.02]"
                                        : "border border-transparent hover:border-white/5 hover:bg-white/5")
                                }
                            >
                                {/* Active indicator stripe */}
                                {isSelect && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r-md"></div>
                                )}

                                <div className="relative shrink-0">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 shadow-sm overflow-hidden ` +
                                        (isSelect ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-[#2D2D44] bg-[#2D2D44] text-gray-400 group-hover:border-white/10")
                                    }>
                                        <User size={20} className={isSelect ? "opacity-100" : "opacity-70"} />
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#11121C] shadow-sm"></span>
                                </div>

                                <div className="flex-1 min-w-0 pr-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-semibold text-sm truncate transition-colors duration-300 ${isSelect ? "text-white font-bold" : "text-gray-200 group-hover:text-white"}`}>
                                            User ID: {partnerId}
                                        </h3>
                                        <span className={`text-xs whitespace-nowrap ml-2 transition-colors ${isSelect ? "text-brand-primary/80 font-medium" : "text-gray-500"}`}>
                                            {displayTime}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate transition-colors ${isSelect ? "text-slate-300" : "text-gray-500"}`}>
                                        Tap to view messages
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
}
