import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative w-full overflow-hidden">
            {/* Background Image from Public Folder */}
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                    backgroundImage: "url('/ChatGPT Image Jan 17, 2026, 09_31_41 AM.png')"
                }}
            >
                {/* Dark Gradient Overlay for Text Readability - Fading from Right */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-[#111] md:to-[#111]/90"></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 h-screen flex flex-col justify-center items-end px-8 md:px-20 lg:px-32 text-right">
                <div className="max-w-xl text-white">
                    <h1 className="text-4xl md:text-6xl font-light mb-8 leading-tight tracking-wide drop-shadow-lg" style={{ fontFamily: "serif" }}>
                        SOME THOUGHTS ARE<br />
                        MEANT TO BE<br />
                        <span className="font-normal text-white">ANONYMOUS</span>
                    </h1>

                    <p className="text-gray-200 text-lg md:text-xl mb-12 font-light leading-relaxed drop-shadow-md">
                        A calm space to drop your ideas,<br />
                        refine them, and grow — anonymous &<br />
                        focused.
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-full text-lg transition-all active:scale-95 shadow-xl inline-block"
                    >
                        Get Started
                    </button>
                </div>

                <div className="absolute bottom-10 left-10 text-white/80 tracking-[0.2em] font-light text-sm hidden md:block drop-shadow-sm">
                    THINK FREELY. SPEAK ANONYMOUSLY.
                </div>
            </div>
        </div>
    );
}
