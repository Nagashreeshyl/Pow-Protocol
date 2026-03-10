"use client";

import React from "react";
import FastMarquee from "react-fast-marquee";

interface MarqueeProps {
    children: React.ReactNode;
    speed?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    className?: string;
    autoFill?: boolean;
}

export default function Marquee({
    children,
    speed = 100,
    direction = "left",
    pauseOnHover = false,
    className = "",
    autoFill = true,
}: MarqueeProps) {
    return (
        <div className={`w-full overflow-hidden bg-transparent ${className}`}>
            <FastMarquee
                speed={speed}
                direction={direction}
                pauseOnHover={pauseOnHover}
                gradient={false}
                autoFill={autoFill}
            >
                <div className="flex items-center">
                    {children}
                </div>
            </FastMarquee>
        </div>
    );
}
