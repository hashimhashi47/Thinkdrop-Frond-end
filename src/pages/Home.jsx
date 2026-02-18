import React from "react";
import Navbar from "../components/layout/Navbar";
import LeftProfile from "../components/home/LeftProfile";
import Feed from "../components/home/Feed";
import RightFriends from "../components/home/RightFriends";

export default function Home() {
    const [feedKey, setFeedKey] = React.useState(0);

    const refreshFeed = () => {
        setFeedKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-[#1E1E2E] relative selection:bg-brand-primary selection:text-white">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-primary/10 to-transparent"></div>
            </div>

            <Navbar />

            <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-4 sm:px-6 py-8 relative z-10">
                <LeftProfile onInterestUpdate={refreshFeed} />
                <Feed key={feedKey} />
                <RightFriends />
            </main>
        </div>
    );
}
