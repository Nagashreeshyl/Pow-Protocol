"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Shield,
    Zap,
    Github,
    CheckCircle2,
    Loader2,
    Code2,
    BarChart3,
    Lock,
    ArrowRight,
} from "lucide-react";
import type { Verification } from "@/types";
import Marquee from "@/components/Marquee";
import Link from "next/link";

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } as any },
};

export default function BadgePage() {
    const params = useParams();
    const [verification, setVerification] = useState<Verification | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/verify/results/${params.id}`)
            .then((res) => res.json())
            .then((data) => {
                setVerification(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg">
                <div className="w-20 h-20 rounded-full shadow-nm-inset flex items-center justify-center mb-8">
                    <Loader2 size={32} className="animate-spin text-nm-accent" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] animate-pulse text-nm-muted">Decoding Proof...</span>
            </div>
        );
    }

    if (!verification || !verification.scores) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg p-8 text-center uppercase">
                <div className="w-32 h-32 bg-nm-bg rounded-[40px] shadow-nm-extruded flex items-center justify-center mb-12 text-red-500">
                    <Lock size={48} />
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-4 text-red-500">Unverified</h1>
                <p className="text-lg font-bold text-nm-muted max-w-lg mb-12 tracking-tight leading-relaxed">
                    This Proof_ID has not been validated by the protocol.
                </p>
                <Link href="/" className="btn-nm-primary no-underline text-xl h-20 px-12 shadow-nm-extruded">
                    Go to System_Core
                </Link>
            </div>
        );
    }

    const v = verification;
    const scores = v.scores!;

    return (
        <div className="min-h-screen bg-nm-bg text-nm-fg flex flex-col items-center justify-center overflow-hidden py-12 px-4 select-none">
            {/* Background Ambient Motion */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden flex flex-col justify-center">
                <div className="rotate-12 scale-150">
                    <Marquee speed={120}>
                        <span className="text-[15vh] font-black uppercase mx-8">Proof_Of_Work_Protocol_Verified_Authentic_Source_Code_Analysis_</span>
                    </Marquee>
                    <Marquee speed={80} direction="right">
                        <span className="text-[15vh] font-black uppercase mx-8">Security_Guaranteed_Blockchain_Ready_Immutable_Proof_</span>
                    </Marquee>
                </div>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="w-full max-w-4xl relative z-10"
            >
                {/* Main Badge Container - Tactile Redesign */}
                <div className="bg-nm-bg rounded-[64px] shadow-nm-lifted overflow-hidden border border-white/40">
                    {/* Header Marquee */}
                    <div className="bg-nm-bg border-b border-nm-border/50 py-3 shadow-nm-inset">
                        <Marquee speed={50}>
                            <span className="text-nm-accent font-bold uppercase tracking-widest text-[10px] mx-12">
                                Official Protocol Entry // ID: {v.id.toUpperCase()} // Status: {getScoreLabel(scores.overall)} Verified
                            </span>
                        </Marquee>
                    </div>

                    <div className="p-10 md:p-16">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            {/* Massive Score - Neumorphic Well */}
                            <div className="relative group/score">
                                <div className="absolute -inset-4 rounded-[64px] shadow-nm-inset bg-nm-bg transition-all group-hover/score:shadow-nm-deep-inset" />
                                <div className="relative flex flex-col items-center justify-center bg-nm-bg w-full md:w-80 aspect-square rounded-[56px] shadow-nm-extruded transform transition-transform duration-700 group-hover/score:scale-95 group-hover/score:shadow-nm-lifted border border-white/20">
                                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 text-nm-muted opacity-60">Rating_Level</span>
                                    <span className="font-display text-[10rem] md:text-[12rem] font-black tracking-tighter leading-none text-nm-accent">
                                        {scores.overall}
                                    </span>
                                    <div className="px-6 py-2 rounded-full shadow-nm-inset text-sm font-bold uppercase tracking-widest text-nm-fg mt-4">
                                        {getScoreLabel(scores.overall)}
                                    </div>
                                </div>
                            </div>

                            {/* Data Details */}
                            <div className="flex-1 space-y-12 w-full pt-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-nm-accent shadow-[0_0_8px_rgba(102,126,234,0.4)]" />
                                        <span className="text-[10px] font-bold tracking-[0.5em] text-nm-accent uppercase">Repository_Name</span>
                                    </div>
                                    <h2 className="font-display text-5xl font-black tracking-tighter leading-tight uppercase break-words text-nm-fg">
                                        {v.repo_name ? v.repo_name.replace('/', '\n') : "Unnamed"}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pb-10 border-b border-nm-border/30">
                                    <div>
                                        <span className="text-[9px] font-bold tracking-widest text-nm-muted uppercase mb-3 block">Specialization</span>
                                        <span className="text-lg font-bold uppercase tracking-tight flex items-center gap-2 text-nm-fg">
                                            <Code2 size={18} className="text-nm-accent" />
                                            {v.project_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold tracking-widest text-nm-muted uppercase mb-3 block">Synchronized</span>
                                        <span className="text-lg font-bold uppercase tracking-tight text-nm-fg">
                                            {new Date(v.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "PERF", score: scores.performance, icon: <Zap size={14} /> },
                                        { label: "SCALE", score: scores.scalability, icon: <BarChart3 size={14} /> },
                                        { label: "SEC", score: scores.security, icon: <Lock size={14} /> },
                                        { label: "QUAL", score: scores.code_quality, icon: <Code2 size={14} /> },
                                    ].map((m) => (
                                        <div key={m.label} className="p-5 rounded-2xl shadow-nm-inset bg-nm-bg flex flex-col items-center">
                                            <div className="text-xl font-black tracking-tighter text-nm-fg mb-1">{m.score}</div>
                                            <div className="text-[8px] font-bold tracking-[0.2em] text-nm-muted uppercase flex items-center gap-1.5 ">
                                                {m.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 pt-12 border-t border-nm-border/30 flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="text-[10px] font-bold uppercase tracking-wide leading-relaxed max-w-sm text-center md:text-left text-nm-muted">
                                This document serves as immutable proof of competence. Verified through deep code analysis and authenticity scrubbing.
                            </div>

                            <Link href="/" className="btn-nm-primary no-underline text-lg h-20 px-12 flex items-center gap-4 group/btn shadow-nm-extruded">
                                <span>Verify Your Own Code</span>
                                <ArrowRight className="group-hover/btn:translate-x-3 transition-transform duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-nm-muted font-bold text-[9px] uppercase tracking-[0.4em] gap-6 opacity-60">
                    <div className="flex items-center gap-2">
                        <Shield size={12} /> Proof_Of_Work_Protocol_v.1.0
                    </div>
                    <div className="px-5 py-2 rounded-full shadow-nm-inset">
                        Node_Type: Public_Ledger
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function getScoreLabel(score: number) {
    if (score >= 90) return "DIAMOND";
    if (score >= 75) return "GOLD";
    if (score >= 60) return "SILVER";
    if (score >= 40) return "BRONZE";
    return "INITIATE";
}
