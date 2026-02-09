"use client";

import React from "react";

interface PhoneFrameProps {
    children: React.ReactNode;
    className?: string;
}

export default function PhoneFrame({ children, className = "" }: PhoneFrameProps) {
    return (
        <div className={`relative ${className}`}>
            {/* 
        iPhone 17 Pro Max Frame Simulation
        Aspect Ratio: ~19.5:9 
        We use a container that shapes the phone via border-radius and box-shadows.
      */}
            <div
                className="relative w-full h-full bg-[#1c1c1e] rounded-[3.5rem] md:rounded-[4rem] shadow-2xl border-[6px] md:border-[10px] border-[#3a3a3c] ring-1 ring-white/20 overflow-hidden z-20"
                style={{
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1), 0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0,0,0,0.8)"
                }}
            >
                {/* Titanium-like shine on the border */}
                <div className="absolute inset-0 rounded-[3.5rem] md:rounded-[4rem] border-[1px] border-white/10 pointer-events-none z-30" />

                {/* Dynamic Island / Notch Area */}
                <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-[30%] h-7 md:h-9 bg-black rounded-full z-40 flex items-center justify-center gap-2 px-3">
                    {/* Camera Lens */}
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#1a1a1a] ring-1 ring-white/5" />
                    {/* Sensor */}
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#0f0f0f]" />
                </div>

                {/* Screen Content Area */}
                <div className="w-full h-full bg-black overflow-hidden relative">
                    {/* Status Bar Time/Signal (Fake) - Optional for realism */}
                    <div className="absolute top-5 md:top-7 left-8 text-white/80 text-[10px] md:text-xs font-semibold z-30 tracking-wide">
                        9:41
                    </div>
                    <div className="absolute top-5 md:top-7 right-8 flex gap-1.5 items-center z-30">
                        <div className="w-4 h-2.5 md:w-5 md:h-3 border border-white/60 rounded-[2px] relative">
                            <div className="absolute inset-[1px] bg-white/90 w-[80%]" />
                        </div>
                    </div>

                    {/* Actual Children Content */}
                    {children}
                </div>
            </div>

            {/* Outer Glow / Reflection for integration */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-white/5 to-transparent rounded-[4rem] blur-xl opacity-30 -z-10" />
        </div>
    );
}
