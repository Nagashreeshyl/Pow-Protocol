"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    BarChart3,
    CheckCircle2,
    Code2,
    Copy,
    Github,
    Loader2,
    Lock,
    QrCode,
    Share2,
    Shield,
    Zap,
    ArrowLeft,
    FileText,
    Users,
    AlertCircle,
    ArrowRight,
    ExternalLink,
} from "lucide-react";
import type { Verification } from "@/types";
import dynamic from "next/dynamic";
import { Variants } from "framer-motion";
import Navbar from "@/components/Navbar";

const RadarChart = dynamic(() => import("@/components/RadarChart"), { ssr: false });
const ScoreGauge = dynamic(() => import("@/components/ScoreGauge"), { ssr: false });

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ResultsPage() {
    const params = useParams();
    const [verification, setVerification] = useState<Verification | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [copied, setCopied] = useState(false);

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

    const generateQR = async () => {
        try {
            const QRCode = (await import("qrcode")).default;
            const url = `${window.location.origin}/badge/${params.id as string}`;
            const dataUrl = await QRCode.toDataURL(url, {
                width: 512,
                margin: 2,
                color: { dark: "#667EEA", light: "#F1F5F9" },
            });
            setQrDataUrl(dataUrl);
            setShowQR(true);
        } catch (err) {
            console.error("QR generation failed:", err);
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/badge/${params.id as string}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg">
                <div className="w-20 h-20 rounded-full shadow-nm-inset flex items-center justify-center mb-8">
                    <Loader2 size={32} className="animate-spin text-nm-accent" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] animate-pulse text-nm-muted">Decoding Protocol Data...</span>
            </div>
        );
    }

    if (!verification || !verification.scores) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg p-8 text-center uppercase">
                <div className="w-32 h-32 bg-nm-bg rounded-[40px] shadow-nm-extruded flex items-center justify-center mb-12 text-red-500">
                    <AlertCircle size={48} />
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-4 text-red-500">Incomplete</h1>
                <p className="text-lg font-bold text-nm-muted max-w-lg mb-12 tracking-tight">
                    Verification data for this node is corrupted or non-existent.
                </p>
                <Link href="/dashboard" className="btn-nm-primary no-underline text-xl h-20 px-12 shadow-nm-extruded">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const v = verification;
    const scores = v.scores!;
    const metrics = v.metrics;

    const scoreCategories = [
        { label: "Performance", icon: <Zap size={20} />, score: scores.performance },
        { label: "Scalability", icon: <BarChart3 size={20} />, score: scores.scalability },
        { label: "Security", icon: <Lock size={20} />, score: scores.security },
        { label: "Quality", icon: <Code2 size={20} />, score: scores.code_quality },
        { label: "Authentic", icon: <Shield size={20} />, score: scores.authenticity },
    ];

    return (
        <div className="min-h-screen bg-nm-bg text-nm-fg">
            <Navbar />

            <div className="max-w-7xl mx-auto py-24 px-6">
                {/* Navigation and Top Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-24">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-nm-accent uppercase group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-wrap gap-6 w-full lg:w-auto">
                        <button onClick={copyLink} className="h-16 px-8 rounded-2xl shadow-nm-extruded bg-nm-bg text-sm font-bold uppercase tracking-widest hover:shadow-nm-lifted active:shadow-nm-inset transition-all">
                            {copied ? "ID Copied" : "Copy Proof ID"}
                        </button>
                        <button onClick={generateQR} className="h-16 px-8 rounded-2xl shadow-nm-extruded bg-nm-bg text-sm font-bold uppercase tracking-widest hover:shadow-nm-lifted active:shadow-nm-inset transition-all">
                            QR Proof
                        </button>
                        <Link
                            href={`/badge/${params.id as string}`}
                            className="btn-nm-primary flex-1 lg:flex-none h-16 px-8 text-sm no-underline flex items-center justify-center gap-3 shadow-nm-extruded"
                        >
                            Public Proof <Share2 size={16} />
                        </Link>
                    </div>
                </div>

                {/* Massive Results Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-32">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-3 h-3 bg-nm-accent rounded-full shadow-[0_0_8px_rgba(102,126,234,0.4)]" />
                                <span className="text-xs font-bold tracking-widest text-nm-accent uppercase">
                                    Protocol_Verified_Result
                                </span>
                            </div>
                            <h1 className="font-display text-7xl lg:text-9xl font-black leading-[0.85] mb-12 tracking-tighter text-nm-fg uppercase">
                                {v.repo_name ? v.repo_name.replace('/', '\n') : "Unnamed\nRepo"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-widest text-nm-muted">
                                <span className="px-4 py-2 rounded-full shadow-nm-inset">
                                    {v.repo_url.split('/').pop()}
                                </span>
                                <span className="px-4 py-2 rounded-full shadow-nm-inset">
                                    {v.project_type.replace('_', ' ')}
                                </span>
                                <span className="px-4 py-2 rounded-full shadow-nm-inset">
                                    {new Date(v.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="bg-nm-bg p-12 w-full lg:w-[400px] rounded-[64px] shadow-nm-extruded text-center">
                            <span className="text-[10px] font-bold tracking-widest uppercase mb-4 block text-nm-muted">Overall Rating</span>
                            <div className="text-9xl font-display font-black tracking-tighter leading-none text-nm-accent mb-6">
                                {scores.overall}
                            </div>
                            <div className="text-xl font-bold uppercase tracking-widest py-4 rounded-full shadow-nm-inset text-nm-fg">
                                {getScoreLabel(scores.overall)} Status
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Visual Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    <div className="bg-nm-bg rounded-[64px] shadow-nm-extruded overflow-hidden flex items-center justify-center p-8">
                        <ScoreGauge score={scores.overall} size={350} />
                    </div>
                    <div className="bg-nm-bg rounded-[64px] shadow-nm-extruded overflow-hidden p-8 flex items-center justify-center">
                        <RadarChart scores={scores} />
                    </div>
                </div>

                {/* Score Categories Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-32">
                    {scoreCategories.map((cat) => (
                        <div key={cat.label} className="bg-nm-bg p-10 rounded-[40px] shadow-nm-extruded transition-all hover:shadow-nm-lifted group text-center">
                            <div className="w-14 h-14 mx-auto bg-nm-bg rounded-2xl shadow-nm-inset flex items-center justify-center text-nm-accent mb-8">
                                {cat.icon}
                            </div>
                            <div className="text-5xl font-display font-black tracking-tighter leading-none text-nm-fg mb-3">
                                {cat.score}
                            </div>
                            <div className="text-[10px] font-bold tracking-[0.2em] text-nm-muted uppercase">
                                {cat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Insights and Deep Data */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start mb-32">
                    {/* Repository Meta */}
                    <div className="space-y-12">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight pl-2">Metrics</h2>
                        <div className="space-y-6">
                            {[
                                { label: "Files", value: metrics?.files_analyzed, icon: <FileText size={18} /> },
                                { label: "Contributors", value: metrics?.contributors, icon: <Users size={18} /> },
                                { label: "Commits", value: metrics?.total_commits, icon: <Zap size={18} /> },
                                { label: "Lines", value: metrics?.lines_of_code?.toLocaleString(), icon: <Code2 size={18} /> },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-8 rounded-3xl shadow-nm-inset bg-nm-bg">
                                    <div className="flex items-center gap-4 text-nm-muted">
                                        <div className="text-nm-accent">{item.icon}</div>
                                        <span className="text-[10px] font-bold tracking-widest uppercase">{item.label}</span>
                                    </div>
                                    <span className="text-2xl font-black tracking-tighter text-nm-fg">{item.value || "—"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="lg:col-span-2 space-y-12">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight pl-4">Analysis Logs</h2>
                        {metrics && metrics.code_insights && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { label: "Strengths", data: metrics.code_insights.strengths, color: "text-nm-accent", icon: <CheckCircle2 size={16} /> },
                                    { label: "Weaknesses", data: metrics.code_insights.weaknesses, color: "text-red-500", icon: <AlertCircle size={16} /> },
                                    { label: "Advice", data: metrics.code_insights.recommendations, color: "text-nm-muted", icon: <Zap size={16} /> },
                                ].map((sect) => (
                                    <div key={sect.label} className="bg-nm-bg p-8 rounded-[40px] shadow-nm-extruded relative">
                                        <span className={`text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 mb-8 ${sect.color}`}>
                                            {sect.icon} {sect.label}
                                        </span>
                                        <ul className="space-y-6">
                                            {sect.data.map((item, i) => (
                                                <li key={i} className="text-xs font-bold uppercase tracking-tight leading-relaxed text-nm-muted pl-4 border-l-2 border-nm-accent/20">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Authenticity Matrix */}
                        <div className="p-12 rounded-[48px] shadow-nm-inset bg-nm-bg">
                            <h3 className="text-xl font-bold tracking-widest uppercase mb-12 text-center text-nm-fg">Authenticity_Matrix</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                {[
                                    { label: "History_Pattern", value: metrics?.authenticity_details?.commit_regularity },
                                    { label: "Human_Delta", value: metrics?.authenticity_details?.ai_detection },
                                    { label: "Style_Cohesion", value: metrics?.authenticity_details?.style_consistency },
                                    { label: "Core_Originality", value: metrics?.authenticity_details?.originality },
                                ].map((metric) => (
                                    <div key={metric.label}>
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-[10px] font-bold tracking-[0.2em] text-nm-muted uppercase">{metric.label}</span>
                                            <span className="text-2xl font-black tracking-tighter text-nm-fg">{metric.value ? `${metric.value}%` : '---'}</span>
                                        </div>
                                        <div className="h-3 w-full bg-nm-bg rounded-full shadow-nm-inset overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${metric.value || 0}%` }}
                                                className="h-full bg-nm-accent rounded-full shadow-[0_0_8px_rgba(102,126,234,0.3)]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* AI Breakdown Description */}
                            {metrics?.authenticity_details?.details && (
                                <div className="mt-8 p-6 bg-nm-bg rounded-3xl shadow-nm-extruded border border-nm-accent/10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Shield size={16} className="text-nm-accent" />
                                        <span className="text-[10px] font-bold tracking-widest text-nm-accent uppercase">AI Forensics Report</span>
                                    </div>
                                    <p className="text-sm font-medium text-nm-fg leading-relaxed">
                                        {metrics.authenticity_details.details}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Neumorphic QR Redesign */}
            <AnimatePresence>
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-nm-bg/90 flex items-center justify-center p-8 backdrop-blur-md"
                        onClick={() => setShowQR(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 40 }}
                            className="bg-nm-bg p-12 max-w-md w-full rounded-[64px] shadow-nm-lifted text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="font-display text-4xl font-extrabold tracking-tight uppercase mb-12 leading-none text-nm-fg">Immutable QR Proof</h3>
                            <div className="bg-nm-bg p-8 rounded-3xl shadow-nm-inset inline-block mb-12 w-full aspect-square flex items-center justify-center">
                                {qrDataUrl && <img src={qrDataUrl} alt="QR Proof" className="w-full h-full mix-blend-multiply opacity-80" />}
                            </div>
                            <p className="text-sm font-bold uppercase tracking-tight leading-relaxed mb-12 text-nm-muted px-4">
                                Scan this unique token to authenticate your work on the external grid.
                            </p>
                            <button
                                onClick={() => setShowQR(false)}
                                className="w-full h-20 btn-nm-primary text-xl shadow-nm-extruded"
                            >
                                Close Protocol
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
