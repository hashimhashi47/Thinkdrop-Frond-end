import React from "react";
import { Link } from "react-router-dom";
import { Home, MessageCircle, Bell, Search, User, Award } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-[#1E1E2E]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>THINK</span><span className="text-brand-primary">DROP</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
          <input
            className="w-96 pl-10 pr-5 py-2.5 text-sm border border-white/10 rounded-full bg-[#2D2D44] text-white focus:bg-[#373754] focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all shadow-sm placeholder-slate-400"
            placeholder="Search ideas, people, drops…"
          />
        </div>

        {/* Icons & Profile */}
        <div className="flex items-center gap-4 md:gap-6 text-slate-300">
          <Link to="/">
            <NavIcon icon={Home} label="Home" active={window.location.pathname === "/"} />
          </Link>
          <Link to="/chat">
            <NavIcon icon={MessageCircle} label="Messages" active={window.location.pathname === "/chat"} />
          </Link>
          <Link to="/notifications">
            <NavIcon icon={Bell} label="Notifications" active={window.location.pathname === "/notifications"} />
          </Link>
          <Link to="/rewards">
            <NavIcon icon={Award} label="Rewards" active={window.location.pathname === "/rewards"} />
          </Link>

          <Link to="/profile" className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1.5 pr-3 rounded-full border border-transparent hover:border-white/10 transition-all">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
              <User size={18} />
            </div>
            <span className="text-sm font-medium text-slate-200">My Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavIcon({ icon: Icon, active }) {
  return (
    <div className={`cursor-pointer p-2 rounded-xl transition-all ${active ? "bg-brand-primary/20 text-brand-primary" : "hover:bg-white/5 hover:text-white"}`}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
  );
}
