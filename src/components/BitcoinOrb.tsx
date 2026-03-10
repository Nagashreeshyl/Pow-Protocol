"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function BitcoinOrb() {
    return (
        <div className="relative w-full h-[300px] md:h-[450px] flex items-center justify-center perspective-container">
            {/* Ambient Background Glow - Subtle Neumorphic Halo */}
            <div className="absolute inset-0 bg-nm-accent/5 blur-[120px] rounded-full scale-90" />

            {/* Outer Soft Ring */}
            <div className="absolute w-64 h-64 md:w-80 md:h-80 border border-nm-accent/10 rounded-full animate-orbit opacity-40 shadow-nm-inset" />

            {/* Middle Rotating Ring (Reverse) */}
            <div className="absolute w-48 h-48 md:w-64 md:h-64 border border-nm-accent/5 rounded-full animate-orbit-reverse opacity-20" />

            {/* Inner Ring (Tilted) */}
            <div className="absolute w-72 h-72 md:w-96 md:h-96 border border-nm-border/5 rounded-full rotate-45 animate-orbit opacity-10 shadow-nm-extruded" />

            {/* Central Neumorphic Core - Molded Design */}
            <motion.div
                className="relative z-10 w-24 h-24 md:w-32 md:h-32 bg-nm-bg rounded-full flex items-center justify-center shadow-nm-extruded border border-white/30"
                animate={{
                    scale: [1, 1.02, 1],
                    y: [0, -10, 0]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Inset Core Well */}
                <div className="absolute inset-4 rounded-full shadow-nm-inset bg-nm-bg flex items-center justify-center">
                    <Zap size={40} className="text-nm-accent fill-nm-accent/10 md:scale-110 drop-shadow-[0_0_8px_rgba(102,126,234,0.4)]" />
                </div>

                {/* Ambient Highlight */}
                <div className="absolute top-2 left-2 w-1/2 h-1/2 bg-white/20 rounded-full blur-xl" />
            </motion.div>

            {/* Floating Data Nodes - Soft Mono Nodes */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2.5 h-2.5 bg-nm-accent rounded-full shadow-[0_0_12px_rgba(102,126,234,0.3)]"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.6, 0],
                        x: [0, (i - 1) * 120, 0],
                        y: [0, (i % 2 === 0 ? 1 : -1) * 100, 0],
                    }}
                    transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        delay: i * 1.5,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
}
