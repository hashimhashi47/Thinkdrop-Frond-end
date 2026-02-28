import React, { useEffect, useRef } from "react";
import { Send, Smile, MoreVertical, User, ShieldAlert, CheckCheck, Loader2 } from "lucide-react";

export default function ChatWindow({ conversation, messages, onSendMessage, myId }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        const receiverId = conversation?.User1ID === myId ? conversation?.User2ID : conversation?.User1ID;

        if (input.value.trim() && conversation) {
            onSendMessage(input.value, receiverId);
            input.value = "";
        }
    }

    if (!conversation) {
        return (
            <div className="md:col-span-8 lg:col-span-9 flex flex-col items-center justify-center bg-[#181926] h-full text-gray-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
                    <div className="relative group mx-auto mb-6">
                        <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full group-hover:bg-brand-primary/40 transition-colors duration-500"></div>
                        <div className="h-24 w-24 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 shadow-2xl relative z-10">
                            <User size={40} className="text-gray-400 group-hover:text-brand-primary transition-colors duration-500" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Your Anonymous Space</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                        Select a conversation from the sidebar to securely connect and exchange ideas.
                    </p>
                </div>
            </div>
        )
    }
    const isUserMe = (id) => myId != null && String(id) === String(myId);

    // Determine the partner's ID for header display and logic
    const partnerId = isUserMe(conversation.User1ID) ? conversation.User2ID : (isUserMe(conversation.User2ID) ? conversation.User1ID : (conversation.User2ID || conversation.User1ID));

    // Determine the partner's name for header display
    const partnerName = isUserMe(conversation.User1ID) ? (conversation.User2NAME || conversation.User2ID) : (isUserMe(conversation.User2ID) ? (conversation.User1NAME || conversation.User1ID) : (conversation.User2NAME || conversation.User2ID || conversation.User1NAME || conversation.User1ID));

    // Determine the partner's avatar
    const partnerAvatar = isUserMe(conversation.User1ID) ? conversation.User2ImageUrl : (isUserMe(conversation.User2ID) ? conversation.User1ImageUrl : (conversation.User2ImageUrl || conversation.User1ImageUrl));

    return (
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-[#1A1B29] h-[calc(100vh-64px)] relative overflow-hidden">
            {/* Ambient Background Gradient for chat */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#1A1B29]/90 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-brand-primary to-purple-600 p-[2px] shadow-lg shadow-purple-900/20">
                            <div className="h-full w-full bg-[#1A1B29] rounded-full flex items-center justify-center border border-transparent overflow-hidden">
                                {partnerAvatar ? (
                                    <img src={partnerAvatar} alt={partnerName} className="h-full w-full object-cover" />
                                ) : (
                                    <User size={20} className="text-gray-300" />
                                )}
                            </div>
                        </div>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-[3px] border-[#1A1B29]"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base group-hover:text-brand-primary transition-colors">
                            {partnerName}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-gray-400 font-medium tracking-wide">Connected Securely</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <ShieldAlert size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent z-10 custom-scrollbar flex flex-col">
                <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-[#1A1B29] px-4 py-1 rounded-full border border-white/5 shadow-sm">
                        End-to-End Encrypted Session
                    </span>
                </div>

                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm animate-in fade-in duration-700">
                        Say hello to start the conversation 👋
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = isUserMe(msg.sender_id) || String(msg.sender_id) === "me" || (!myId && String(msg.sender_id) !== String(partnerId));

                        // Check if msg is just a temporary optimistic update
                        const isOptimistic = msg.id && msg.id.toString().length > 10;

                        return (
                            <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                                <div className={`max-w-[75%] break-words p-4 text-[15px] leading-relaxed relative group ${isMe
                                    ? "bg-gradient-to-br from-brand-primary to-[#6366f1] text-white rounded-[20px] rounded-tr-[4px] shadow-lg shadow-brand-primary/20"
                                    : "bg-[#2A2B3D]/80 backdrop-blur-md text-gray-100 border border-white/5 rounded-[20px] rounded-tl-[4px] shadow-sm"
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.content || msg.text || ""}</p>

                                    <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium opacity-70 ${isMe ? "justify-end text-white" : "justify-start text-gray-400"}`}>
                                        {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            <span className="ml-1">
                                                {isOptimistic ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={14} />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-[#1A1B29]/95 backdrop-blur-md border-t border-white/5 z-20">
                <form onSubmit={handleSend} className="relative flex items-center gap-3 max-w-5xl mx-auto">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Smile size={20} className="text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                        </div>
                        <input
                            name="message"
                            placeholder="Message User..."
                            className="w-full bg-[#11121C] border border-white/10 text-white text-[15px] rounded-2xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-300 placeholder:text-gray-500 shadow-inner"
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-brand-primary hover:bg-[#5255e0] text-white p-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-lg shadow-brand-primary/30 flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                        <Send size={20} className="translate-x-0.5" />
                    </button>
                </form>
                <div className="mt-2 text-center text-[10px] text-gray-500 font-medium">
                    Press <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-sans mx-1">Enter</kbd> to send
                </div>
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
