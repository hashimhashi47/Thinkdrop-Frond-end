import React, { useEffect, useRef } from "react";
import { Send, Smile, Paperclip, MoreVertical, User, AlertCircle, Trash2 } from "lucide-react";

export default function ChatWindow({ conversation, messages, onSendMessage }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!conversation) {
        return (
            <div className="md:col-span-8 lg:col-span-9 flex items-center justify-center bg-[#1E1E2E] h-full text-gray-500">
                <div className="text-center">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <User size={40} className="text-gray-400" />
                    </div>
                    <p>Select a conversation to start messaging</p>
                </div>
            </div>
        )
    }

    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        if (input.value.trim()) {
            onSendMessage(input.value);
            input.value = "";
        }
    }

    return (
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-[#1E1E2E] h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#2D2D44]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                            <User size={20} className="text-gray-400" />
                        </div>
                        {conversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#2D2D44]"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{conversation.name}</h3>
                        <span className="text-xs text-green-500 font-medium">Active Now</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        BLOCK/REPORT
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500/10 transition-colors">
                        REMOVE
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#1E1E2E]">
                {messages.map((msg) => {
                    const isMe = msg.senderId === "me";
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] break-words p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                ? "bg-brand-primary text-white rounded-tr-sm"
                                : "bg-[#2D2D44] text-gray-100 border border-white/5 rounded-tl-sm"
                                }`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-[#2D2D44] border-t border-white/5">
                <form onSubmit={handleSend} className="relative flex items-center gap-4 max-w-4xl mx-auto">
                    <input
                        name="message"
                        placeholder="Type something here..."
                        className="flex-1 bg-[#1E1E2E] border border-white/5 text-white text-sm rounded-xl px-4 py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder:text-gray-500"
                        autoComplete="off"
                    />
                    <div className="absolute right-20 flex items-center gap-2 text-gray-400">
                        <Smile size={20} className="cursor-pointer hover:text-white" />
                    </div>
                    <button
                        type="submit"
                        className="bg-brand-primary hover:bg-brand-hover text-white p-3 rounded-xl transition-transform active:scale-95 shadow-md shadow-brand-primary/25"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
