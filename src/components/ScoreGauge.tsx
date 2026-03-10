"use client";

import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
    score: number;
    size?: number;
}

export default function ScoreGauge({ score, size = 300 }: ScoreGaugeProps) {
    const [offset, setOffset] = useState(0);
    const strokeWidth = 20;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const progressOffset = ((100 - score) / 100) * circumference;
        setOffset(progressOffset);
    }, [score, circumference]);

    return (
        <div className="relative flex items-center justify-center p-12">
            <div className={`relative flex items-center justify-center rounded-full shadow-nm-inset bg-nm-bg`} style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(148, 163, 184, 0.1)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#667EEA"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset: offset,
                            transition: "stroke-dashoffset 2s cubic-bezier(0.19, 1, 0.22, 1)",
                            filter: "drop-shadow(0 0 4px rgba(102, 126, 234, 0.4))"
                        }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display text-8xl font-black tracking-tighter leading-none text-nm-fg mb-1">
                        {score}
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-nm-muted uppercase">
                        Verified_Score
                    </span>
                </div>
            </div>

            {/* Decorative Accents */}
            <div className="absolute top-6 left-6 text-[10px] font-bold text-nm-muted/40 uppercase tracking-widest">
                Protocol_Gauge_v1.1
            </div>
            <div className="absolute bottom-6 right-6 text-[10px] font-bold text-nm-muted/40 uppercase tracking-widest">
                Scale_1:100
            </div>
        </div>
    );
}
