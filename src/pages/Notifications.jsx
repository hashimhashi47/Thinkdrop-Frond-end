import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { notificationService } from "../services/notificationService";
import { Check, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="text-rose-500 fill-rose-500" size={16} />;
            case 'comment': return <MessageCircle className="text-blue-500 fill-blue-500" size={16} />;
            case 'follow': return <UserPlus className="text-green-500" size={16} />;
            default: return <Bell className="text-gray-400" size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#1E1E2E]">
            <Navbar />

            <main className="max-w-3xl mx-auto py-8 px-4">
                <div className="bg-[#2D2D44] rounded-2xl shadow-lg border border-white/5 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#2D2D44]/80 backdrop-blur-sm sticky top-0 z-10">
                        <h1 className="text-2xl font-bold text-white">Notifications</h1>
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 text-sm text-brand-primary hover:text-brand-hover font-medium transition-colors hover:bg-white/5 px-3 py-1.5 rounded-lg"
                        >
                            <Check size={16} /> Mark all as read
                        </button>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading updates...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                    <Bell className="text-gray-400" size={32} />
                                </div>
                                <p className="text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-5 flex items-start gap-4 transition-colors hover:bg-white/5 cursor-pointer group ${!notif.read ? "bg-brand-primary/10" : ""
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0" />
                                        <div className="absolute -bottom-1 -right-1 bg-[#2D2D44] rounded-full p-1 shadow-sm border border-white/5">
                                            {getIcon(notif.type)}
                                            { /* Icon overlay on avatar */}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 leading-relaxed">
                                            <span className="font-bold text-white">{notif.user.name}</span>{" "}
                                            <span className="text-gray-400">{notif.text}</span>
                                        </p>
                                        <span className="text-xs text-gray-500 mt-1 block font-medium">
                                            {notif.time}
                                        </span>
                                    </div>

                                    {/* Unread Dot */}
                                    {!notif.read && (
                                        <div className="w-2.5 h-2.5 bg-brand-primary rounded-full flex-shrink-0 mt-2 shadow-sm shadow-brand-primary/50" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
