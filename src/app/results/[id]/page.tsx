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
    Briefcase,
    Activity,
    ThermometerSun,
    AlertTriangle,
    Skull,
    Target,
    Network,
    Cpu,
    History,
    Calendar,
    GitBranch,
    Play,
    Star
} from "lucide-react";
import type { Verification } from "@/types";
import dynamic from "next/dynamic";
import { Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import MermaidChart from "@/components/MermaidChart";
import * as QRCode from "qrcode";

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
    const [reanalyzing, setReanalyzing] = useState(false);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const toggleCard = (cardId: string) => {
        setExpandedCard(expandedCard === cardId ? null : cardId);
    };

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
            const url = `${window.location.origin}/badge/${params.id as string}`;
            const dataUrl = await QRCode.toDataURL(url, {
                width: 512,
                margin: 2,
                color: { dark: "#000000", light: "#FFFFFF" },
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

    const handleReanalyze = async () => {
        if (!verification) return;
        setReanalyzing(true);
        try {
            const parts = verification.repo_url.split('/');
            const owner = parts[parts.length - 2];
            const repo = parts[parts.length - 1];

            await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: params.id,
                    owner,
                    repo,
                    repoUrl: verification.repo_url,
                    projectType: verification.project_type
                })
            });

            // Refresh data
            const res = await fetch(`/api/verify/results/${params.id}`);
            const data = await res.json();
            setVerification(data);
        } catch (err) {
            console.error("Re-analysis failed:", err);
        } finally {
            setReanalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg">
                <div className="w-20 h-20 rounded-full shadow-nm-inset flex items-center justify-center mb-8">
                    <Loader2 size={32} className="animate-spin text-nm-accent" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] animate-pulse text-nm-muted mb-16">Decoding Protocol Data...</span>
                <div className="w-full max-w-3xl space-y-6 px-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 w-full bg-nm-bg shadow-nm-inset rounded-2xl flex items-center p-6 gap-6 opacity-50">
                            <div className="w-12 h-12 rounded-full bg-black/5 animate-pulse" />
                            <div className="flex flex-col gap-2 w-full">
                                <div className="h-4 bg-black/5 animate-pulse rounded w-1/3" />
                                <div className="h-3 bg-black/5 animate-pulse rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
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
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-24 no-print">
                    <Link href="/dashboard" className="flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-nm-accent uppercase group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to Dashboard
                    </Link>
                    <div className="flex flex-wrap gap-6 w-full lg:w-auto">
                        <button onClick={copyLink} className="h-16 px-8 rounded-2xl shadow-nm-extruded bg-nm-bg text-sm font-bold uppercase tracking-widest hover:shadow-nm-lifted active:shadow-nm-inset transition-all">{copied ? "ID Copied" : "Copy Proof ID"}</button>
                        <button onClick={generateQR} className="h-16 px-8 rounded-2xl shadow-nm-extruded bg-nm-bg text-sm font-bold uppercase tracking-widest hover:shadow-nm-lifted active:shadow-nm-inset transition-all">QR Proof</button>
                        <button onClick={handleReanalyze} disabled={reanalyzing} className="h-16 px-8 rounded-2xl shadow-nm-extruded bg-nm-bg text-sm font-bold uppercase tracking-widest hover:shadow-nm-lifted active:shadow-nm-inset transition-all disabled:opacity-50">
                            {reanalyzing ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
                            {reanalyzing ? "Analyzing..." : "Re-Run Analysis"}
                        </button>
                        <Link href={`/badge/${params.id as string}`} className="btn-nm-primary flex-1 lg:flex-none h-16 px-8 text-sm no-underline flex items-center justify-center gap-3 shadow-nm-extruded">Public Proof <Share2 size={16} /></Link>
                    </div>
                </div>

                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-32">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="w-3 h-3 bg-nm-accent rounded-full shadow-[0_0_8px_rgba(102,126,234,0.4)]" />
                                <span className="text-xs font-bold tracking-widest text-nm-accent uppercase">Protocol_Verified_Result</span>
                            </div>
                            <h1 className="font-display text-7xl lg:text-9xl font-black leading-[0.85] mb-12 tracking-tighter text-nm-fg uppercase">{metrics?.project_name || v.repo_name?.split('/').pop() || "Unnamed Repo"}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-widest text-nm-muted">
                                <span className="px-4 py-2 rounded-full shadow-nm-inset">{v.repo_url.split('/').pop()}</span>
                                <span className="px-4 py-2 rounded-full shadow-nm-inset">{v.project_type.replace('_', ' ')}</span>
                                <span className="px-4 py-2 rounded-full shadow-nm-inset">{new Date(v.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="bg-nm-bg p-12 w-full lg:w-[400px] rounded-[64px] shadow-nm-extruded text-center">
                            <span className="text-[10px] font-bold tracking-widest uppercase mb-4 block text-nm-muted">Overall Rating</span>
                            <div className="text-9xl font-display font-black tracking-tighter leading-none text-nm-accent mb-6">{scores.overall}</div>
                            <div className="text-xl font-bold uppercase tracking-widest py-4 rounded-full shadow-nm-inset text-nm-fg">{getScoreLabel(scores.overall)} Status</div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    <div className="bg-nm-bg rounded-[64px] shadow-nm-extruded overflow-hidden flex items-center justify-center p-8"><ScoreGauge score={scores.overall} size={350} /></div>
                    <div className="bg-nm-bg rounded-[64px] shadow-nm-extruded overflow-hidden p-8 flex items-center justify-center"><RadarChart scores={scores} /></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-32">
                    {scoreCategories.map((cat) => (
                        <div key={cat.label} className="bg-nm-bg p-10 rounded-[40px] shadow-nm-extruded transition-all hover:shadow-nm-lifted group text-center">
                            <div className="w-14 h-14 mx-auto bg-nm-bg rounded-2xl shadow-nm-inset flex items-center justify-center text-nm-accent mb-8">{cat.icon}</div>
                            <div className="text-5xl font-display font-black tracking-tighter leading-none text-nm-fg mb-3">{cat.score}</div>
                            <div className="text-[10px] font-bold tracking-[0.2em] text-nm-muted uppercase">{cat.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start mb-32">
                    <div className="space-y-12">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight pl-2 text-nm-fg">Metrics</h2>
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

                    <div className="lg:col-span-2 space-y-12">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight pl-4 text-nm-fg">Analysis Logs</h2>
                        {metrics?.code_insights && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { label: "Strengths", data: metrics.code_insights.strengths, color: "text-nm-accent", icon: <CheckCircle2 size={16} /> },
                                    { label: "Weaknesses", data: metrics.code_insights.weaknesses, color: "text-red-500", icon: <AlertCircle size={16} /> },
                                    { label: "Advice", data: metrics.code_insights.recommendations, color: "text-nm-muted", icon: <Zap size={16} /> },
                                ].map((sect) => (
                                    <div key={sect.label} className="bg-nm-bg p-8 rounded-[40px] shadow-nm-extruded relative">
                                        <span className={`text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 mb-8 ${sect.color}`}>{sect.icon} {sect.label}</span>
                                        <ul className="space-y-6">
                                            {sect.data.map((item: string, i: number) => (
                                                <li key={i} className="text-xs font-bold uppercase tracking-tight leading-relaxed text-nm-muted pl-4 border-l-2 border-nm-accent/20">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                            <span className="text-2xl font-black tracking-tighter text-nm-fg">{(metric.value !== undefined && metric.value !== null) ? `${metric.value}%` : '---'}</span>
                                        </div>
                                        <div className="h-3 w-full bg-nm-bg rounded-full shadow-nm-inset overflow-hidden p-0.5">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${metric.value || 0}%` }} className="h-full bg-nm-accent rounded-full shadow-[0_0_8px_rgba(102,126,234,0.3)]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {metrics?.authenticity_details?.details && (
                                <div className="mt-8 p-6 bg-nm-bg rounded-3xl shadow-nm-extruded border border-nm-accent/10">
                                    <div className="flex items-center gap-3 mb-3"><Shield size={16} className="text-nm-accent" /> <span className="text-[10px] font-bold tracking-widest text-nm-accent uppercase">AI Forensics Report</span></div>
                                    <p className="text-sm font-medium text-nm-fg leading-relaxed">{metrics.authenticity_details.details}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-32 space-y-6">
                    <h2 className="font-display text-4xl font-extrabold tracking-tight pl-2 mb-10 text-nm-fg">Verification Insights</h2>

                    {/* 1. Code Authenticity */}
                    {metrics?.authenticity && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('authenticity')}>
                                <div className="flex items-center gap-4 text-nm-fg">
                                    <div className={`p-3 rounded-full ${metrics.authenticity.human >= 90 ? 'bg-green-500/10 text-green-500' : metrics.authenticity.human < 70 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}><ThermometerSun size={24} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">Code Authenticity</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1 flex items-center gap-2">{metrics.authenticity.human}% Human-Written {metrics.authenticity.human >= 90 ? '🟢' : metrics.authenticity.human < 70 ? '🔴' : '🟡'}</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'authenticity' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>{expandedCard === 'authenticity' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-2 mt-2">
                                        {metrics.authenticity.evidence.map((item: string, idx: number) => (<div key={idx} className="flex items-center gap-2 text-sm text-nm-fg font-medium"><span className="text-blue-500">•</span> {item}</div>))}
                                    </div>
                                </motion.div>
                            )}</AnimatePresence>
                        </div>
                    )}

                    {/* 2. Bug Detection */}
                    {metrics?.bugs && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('bugs')}>
                                <div className="flex items-center gap-4 text-nm-fg">
                                    <div className={`p-3 rounded-full ${metrics.bugs.length === 0 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}><Activity size={24} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">Code Issues Found</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">{metrics.bugs.length} Issues Detected ⚠️</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'bugs' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>{expandedCard === 'bugs' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-3">
                                        {metrics.bugs.length === 0 ? (<p className="text-sm text-nm-fg font-bold">No issues detected. ✅</p>) : (
                                            metrics.bugs.map((bug: any, idx: number) => (
                                                <div key={idx} className="bg-black/10 p-4 rounded-lg text-nm-fg flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="text-xs font-bold text-nm-accent">{bug.file}:{bug.line}</div>
                                                        <div className="text-sm text-nm-muted">{bug.desc}</div>
                                                    </div>
                                                    <a
                                                        href={`${data.repo_url}/blob/main/${bug.file}#L${bug.line}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl shadow-nm-extruded hover:shadow-nm-inset text-nm-accent transition-all"
                                                        title="View Source"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}</AnimatePresence>
                        </div>
                    )}

                    {/* 3. Language & Stack */}
                    {metrics?.language && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('language')}>
                                <div className="flex items-center gap-4 text-nm-fg">
                                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500"><Code2 size={24} /></div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">Language & Stack</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1 uppercase tracking-wider">Primary: {metrics.language.primary} ({(metrics.language.confidence * 100).toFixed(0)}%)</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'language' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>{expandedCard === 'language' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-4 text-nm-fg">
                                        <div className="text-sm font-bold uppercase tracking-[0.2em] text-nm-muted">Package Dependencies</div>
                                        <div className="flex flex-wrap gap-2">
                                            {metrics.language.deps.map((dep: string) => (<span key={dep} className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-500/20">{dep}</span>))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}</AnimatePresence>
                        </div>
                    )}

                    {/* 4. Deployment Status */}
                    {metrics?.deploy && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('deployment')}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${metrics.deploy.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {metrics.deploy.status === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Deployment Status</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">{metrics.deploy.status === 'success' ? `✅ Success: ${metrics.deploy.duration}` : `${metrics.deploy.errors} Failures Detected 🚨`}</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'deployment' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'deployment' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5">
                                            <p className="text-sm text-nm-fg font-medium">{metrics.deploy.status === 'success' ? 'Vercel Deployment verified. All checks passed.' : 'Critical failures detected in build logs. Analysis required.'}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 5. Professionalism */}
                    {metrics?.professionalism && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('professionalism')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Professionalism Metrics</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">Score: {metrics.professionalism.score}/100</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'professionalism' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'professionalism' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                            <div className="bg-black/10 p-4 rounded-xl text-center">
                                                <div className="text-[10px] text-nm-muted uppercase font-black mb-1">Prettier Clean</div>
                                                <div className="text-xl font-black text-nm-fg">{metrics.professionalism.prettier}%</div>
                                            </div>
                                            <div className="bg-black/10 p-4 rounded-xl text-center">
                                                <div className="text-[10px] text-nm-muted uppercase font-black mb-1">Structure</div>
                                                <div className="text-xl font-black text-nm-fg">{metrics.professionalism.score > 80 ? 'EXPERT' : 'STANDARD'}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 6. Credentials Scan */}
                    {metrics?.credentials && (
                        <div className="overflow-hidden border-l-4 border-red-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('credentials')}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${metrics.credentials.count > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        <Skull size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Credential Scanner</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">{metrics.credentials.count > 0 ? `${metrics.credentials.count} Exposed Secrets 🚨` : '0 Exposed Secrets ✅'}</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'credentials' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'credentials' && metrics.credentials.count > 0 && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-4">
                                            {metrics.credentials.details.map((cred: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-2 p-3 rounded bg-red-400/5 border border-red-500/20">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-mono text-red-400">
                                                            {cred.file}:{cred.line}
                                                        </span>
                                                        <a
                                                            href={`${data.repo_url}/blob/main/${cred.file}#L${cred.line}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] font-bold text-nm-accent hover:underline uppercase"
                                                        >
                                                            View Source <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-nm-muted truncate opacity-60">
                                                        {cred.preview}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 7. Timeline */}
                    {metrics?.timeline && (
                        <div className="overflow-hidden border-l-4 border-nm-accent bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('timeline')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-nm-accent/10 text-nm-accent">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Execution Replay</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">{metrics.timeline.length} Development Events</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'timeline' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'timeline' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-8 pt-4 border-t border-white/5">
                                            <div className="relative pl-8 border-l border-nm-muted/20 space-y-8 ml-2">
                                                {metrics.timeline.map((event: any, idx: number) => (
                                                    <div key={idx} className="relative group/item">
                                                        <div className="absolute -left-[37.5px] top-1 p-1 bg-white rounded-full border border-nm-muted/20 group-hover/item:border-nm-accent transition-colors">
                                                            {event.type === 'commit' ? <GitBranch size={12} className="text-blue-500" /> : <Calendar size={12} className="text-purple-500" />}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-nm-muted uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</div>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="text-sm font-bold text-nm-fg">{event.label}</div>
                                                            {event.url && (
                                                                <a
                                                                    href={event.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 rounded-lg shadow-nm-extruded hover:shadow-nm-inset text-nm-muted hover:text-nm-accent transition-all"
                                                                    title="View on GitHub"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                            )}
                                                        </div>
                                                        {event.message && (
                                                            <div className="text-[10px] text-nm-muted mt-1 italic truncate opacity-70">
                                                                {event.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 8. Project Impact */}
                    {metrics?.impact && (
                        <div className="overflow-hidden border-l-4 border-yellow-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('impact')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                                        <Star size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Project Impact</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">Score: {metrics.impact.score}/100</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'impact' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'impact' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5">
                                            <ul className="space-y-3">
                                                <li className="flex items-center gap-2 text-nm-muted text-sm"><span className="text-green-500">•</span> {metrics.impact.metrics.stars} GitHub stars</li>
                                                <li className="flex items-center gap-2 text-nm-muted text-sm"><span className="text-green-500">•</span> {metrics.impact.metrics.forks} forks</li>
                                                <li className="flex items-center gap-2 text-nm-muted text-sm"><span className="text-green-500">•</span> {metrics.impact.metrics.contributors} contributors</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 9. Verified Skills */}
                    {metrics?.skills && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('skills')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Verified Skills</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">{metrics.skills.length} Technology Signatures Extracted</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'skills' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'skills' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                            {metrics.skills.map((skill: string, i: number) => (
                                                <span key={i} className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded text-sm text-nm-fg">✓ {skill}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 10. Architecture Diagram */}
                    {metrics?.architecture && (
                        <div className="overflow-hidden border-l-4 border-purple-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('architecture')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                                        <Network size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">System Architecture</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">Interactive Flow Graph</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'architecture' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'architecture' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5 overflow-x-auto">
                                            <MermaidChart chart={metrics.architecture} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* 11. Code Quality */}
                    {metrics?.quality && (
                        <div className="overflow-hidden border-l-4 border-blue-400 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
                            <div className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors" onClick={() => toggleCard('quality')}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                                        <Cpu size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-nm-fg">Code Quality Report</h3>
                                        <div className="text-sm font-medium text-nm-muted mt-1">Grade: {metrics.quality.grade} | Maintainability: {metrics.quality.maintainability}</div>
                                    </div>
                                </div>
                                <ArrowRight className={`text-nm-muted transition-transform ${expandedCard === 'quality' ? 'rotate-90' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {expandedCard === 'quality' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <div className="px-6 pb-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                                            <div className="bg-black/10 p-4 rounded-xl text-center">
                                                <div className="text-[10px] text-nm-muted uppercase font-black mb-1">Complexity</div>
                                                <div className="text-xl font-black text-nm-fg">{metrics.quality.complexity}</div>
                                            </div>
                                            <div className="bg-black/10 p-4 rounded-xl text-center">
                                                <div className="text-[10px] text-nm-muted uppercase font-black mb-1">Duplication</div>
                                                <div className="text-xl font-black text-nm-fg">{metrics.quality.duplication}%</div>
                                            </div>
                                            <div className="bg-black/10 p-4 rounded-xl text-center">
                                                <div className="text-[10px] text-nm-muted uppercase font-black mb-1">Coverage</div>
                                                <div className="text-xl font-black text-nm-fg">{metrics.quality.coverage}%</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mt-20 mb-10 no-print">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.print()}
                        className="bg-nm-fg text-nm-bg px-10 py-5 rounded-full font-black uppercase tracking-tighter text-lg shadow-nm-extruded hover:shadow-nm-lifted active:shadow-nm-inset transition-all flex items-center gap-3"
                    >
                        <FileText size={20} />
                        Export_As_PDF
                    </motion.button>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showQR && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-nm-bg/95 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                            <h2 className="text-3xl font-black tracking-tighter text-black uppercase mb-8 text-nm-fg">Verification_Hash</h2>
                            <div className="flex justify-center mb-10 p-8 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-200">
                                {qrDataUrl ? <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" /> : <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg" />}
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Verification ID: {v.id}</p>
                            <button onClick={() => setShowQR(false)} className="w-full py-5 bg-black text-white font-black uppercase tracking-tighter rounded-full">Close_Terminal</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function getScoreLabel(score: number) {
    if (score >= 90) return "PLATINUM";
    if (score >= 80) return "GOLD";
    if (score >= 70) return "SILVER";
    return "BRONZE";
}
