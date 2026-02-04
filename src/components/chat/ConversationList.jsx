import React from "react";
import { User } from "lucide-react";

export default function ConversationList({ conversations, activeId, onSelect }) {
    return (
        <div className="md:col-span-4 lg:col-span-3 bg-[#1E1E2E] border-r border-white/5 overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                {/* Search could go here */}
            </div>

            <div className="space-y-1 px-2">
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeId === conv.id
                            ? "bg-[#2D2D44] shadow-md border border-white/5"
                            : "hover:bg-white/5"
                            }`}
                    >
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border-2 border-[#1E1E2E] shadow-sm overflow-hidden">
                                <User size={24} className="text-gray-400" />
                            </div>
                            {conv.online && (
                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-[#1E1E2E]"></span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className={`font-semibold text-sm truncate ${activeId === conv.id ? "text-brand-primary" : "text-gray-200"}`}>
                                    {conv.name}
                                </h3>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{conv.time}</span>
                            </div>
                            <p className={`text-xs truncate ${conv.unread ? "font-bold text-white" : "text-gray-500"}`}>
                                {conv.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
