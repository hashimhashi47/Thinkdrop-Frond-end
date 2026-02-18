import React, { useEffect, useState } from "react";
import { User, MoreHorizontal, Circle } from "lucide-react";
import { userService } from "../../services/userService";

export default function RightFriends() {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        // Simulating an API call with Mock Data
        const mockFriends = [
            { id: 1, name: "Alice Johnson", username: "@alice_j", online: true, avatar: "https://i.pravatar.cc/150?u=1" },
            { id: 2, name: "Robert Fox", username: "@robert_fox", online: true, avatar: "https://i.pravatar.cc/150?u=2" },
            { id: 3, name: "Jenny Wilson", username: "@jenny_w", online: false, avatar: "https://i.pravatar.cc/150?u=3" },
            { id: 4, name: "Cody Fisher", username: "@c_fisher", online: true, avatar: "https://i.pravatar.cc/150?u=4" },
        ];

        // Replace this with userService.getFriends() when the API is ready
        setFriends(mockFriends);
    }, []);
    return (
        <aside className="col-span-12 lg:col-span-3 hidden lg:block">
            <div className="bg-[#2D2D44] rounded-2xl shadow-sm border border-white/5 p-4 sticky top-24">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="font-bold text-gray-200 text-sm">Friends</h2>
                    <button className="text-gray-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    {friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                        >
                            <div className="relative">
                                <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                                    <User size={20} className="text-gray-400" />
                                </div>
                                {friend.online && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#2D2D44]"></span>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-300 group-hover:text-brand-primary transition-colors">{friend.name}</p>
                                <p className="text-xs text-gray-500">{friend.online ? 'Online' : 'Offline'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-4 text-xs font-semibold text-brand-primary hover:text-brand-hover hover:bg-brand-primary/10 py-2 rounded-lg transition-colors">
                    View All Friends
                </button>
            </div>
        </aside>
    );
}
