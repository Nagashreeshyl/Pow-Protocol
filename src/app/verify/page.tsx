"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Github,
    Zap,
    Shield,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Code2,
    Database,
    BarChart3,
    Globe,
    Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function VerifyContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const existingJobId = searchParams.get("jobId");

    const [repoUrl, setRepoUrl] = useState("");
    const [projectType, setProjectType] = useState<"web_app" | "api" | "full_stack">("web_app");
    const [status, setStatus] = useState<"idle" | "pending" | "cloning" | "analyzing" | "scoring" | "completed" | "failed">("idle");
    const [statusMessage, setStatusMessage] = useState("");
    const [jobId, setJobId] = useState<string | null>(existingJobId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (existingJobId) {
            setStatus("pending");
            startPolling(existingJobId);
        }
    }, [existingJobId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!repoUrl) return;

        setError(null);
        setStatus("pending");
        setStatusMessage("INITIALIZING PROTOCOL...");

        try {
            const res = await fetch("/api/verify/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repoUrl,
                    projectType,
                    userId: user.uid,
                }),
            });

            const data = await res.json();
            if (data.error) {
                setError(data.error);
                setStatus("idle");
            } else {
                setJobId(data.jobId);
                startPolling(data.jobId);
            }
        } catch (err) {
            setError("PROTOCOL_SUBMISSION_FAILED");
            setStatus("idle");
        }
    };

    const startPolling = (id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/verify/status/${id}`);
                const data = await res.json();

                if (data.status === "completed") {
                    clearInterval(interval);
                    setStatus("completed");
                    setStatusMessage("PROTOCOL_VERIFICATION_COMPLETE");
                    setTimeout(() => router.push(`/results/${id}`), 1500);
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    setStatus("failed");
                    setError("SECURITY_SCAN_FAILED: CHECK REPO URL");
                } else {
                    setStatus(data.status);
                    setStatusMessage(data.message);
                }
            } catch (err) {
                clearInterval(interval);
                setStatus("failed");
                setError("CONNECTION_LOST_TO_PROTOCOL_GRID");
            }
        }, 2000);
    };

    const steps = [
        { id: "cloning", label: "GH_CORE_SYNC", icon: <Github size={24} /> },
        { id: "analyzing", label: "LLM_CODE_SCAN", icon: <Zap size={24} /> },
        { id: "scoring", label: "KINETIC_SCORING", icon: <BarChart3 size={24} /> },
    ];

    const getStepStatus = (id: string) => {
        const statusOrder = ["pending", "cloning", "analyzing", "scoring", "completed"];
        const currentIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(id);

        if (status === "completed") return "complete";
        if (status === "failed") return "failed";
        if (currentIndex > stepIndex) return "complete";
        if (currentIndex === stepIndex) return "active";
        return "pending";
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg">
                <div className="w-20 h-20 rounded-full shadow-nm-inset flex items-center justify-center mb-8">
                    <Loader2 size={32} className="animate-spin text-nm-accent" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] animate-pulse text-nm-muted">Synchronizing...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg p-8 text-center uppercase">
                <div className="w-32 h-32 bg-nm-bg rounded-[40px] shadow-nm-extruded flex items-center justify-center mb-12">
                    <Lock className="text-nm-muted" size={48} />
                </div>
                <h1 className="font-display text-6xl font-extrabold tracking-tighter mb-4 text-nm-fg">Denied</h1>
                <p className="text-lg font-bold text-nm-muted max-w-lg mb-12 tracking-tight">
                    Security clearance missing. Authenticate to access the scanner.
                </p>
                <Link href="/login" className="btn-nm-primary no-underline text-xl h-20 px-12 shadow-nm-extruded">
                    Login to Proceed
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nm-bg text-nm-fg">
            <Navbar />

            <div className="max-w-7xl mx-auto py-24 px-6 overflow-hidden">
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-24">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-3 h-3 bg-nm-accent rounded-full animate-nm-pulse shadow-[0_0_8px_rgba(102,126,234,0.4)]" />
                        <span className="text-xs font-bold tracking-widest text-nm-accent uppercase">
                            Terminal v2.1: Active
                        </span>
                    </div>
                    <h1 className="font-display text-8xl font-black leading-[0.8] mb-8 tracking-tighter uppercase">
                        Initiate <br /> <span className="text-nm-accent">Deep Scan</span>
                    </h1>
                    <p className="text-xl font-medium text-nm-muted uppercase tracking-tight max-w-2xl leading-relaxed">
                        Provide repository access token or public URL to generate immutable proof of work.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    {/* Left - Visual Drama */}
                    <div className="hidden lg:block">
                        <div className="sticky top-40 space-y-12">
                            <div className="p-12 rounded-[48px] shadow-nm-extruded bg-nm-bg relative overflow-hidden group">
                                <Shield size={120} className="text-nm-accent opacity-10 absolute -right-8 -bottom-8 group-hover:rotate-12 transition-transform duration-500" />
                                <h3 className="font-display text-4xl font-extrabold tracking-tight mb-6 uppercase">Security Layer</h3>
                                <p className="text-nm-muted font-bold uppercase tracking-tight leading-tight text-sm">
                                    The scanner accesses code structures without persisting source data. Only the scoring vector is committed to the ledger.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-10 rounded-3xl shadow-nm-inset bg-nm-bg text-center">
                                    <span className="text-[10px] font-bold tracking-widest text-nm-accent block mb-2 uppercase">GH_API</span>
                                    <span className="text-2xl font-black tracking-tighter uppercase text-nm-fg">Connected</span>
                                </div>
                                <div className="p-10 rounded-3xl shadow-nm-inset bg-nm-bg text-center">
                                    <span className="text-[10px] font-bold tracking-widest text-nm-accent block mb-2 uppercase">AI_Engine</span>
                                    <span className="text-2xl font-black tracking-tighter uppercase text-nm-fg">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Interaction */}
                    <AnimatePresence mode="wait">
                        {status === "idle" || status === "failed" ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSubmit}
                                className="space-y-12"
                            >
                                {/* Repo URL Input */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold tracking-[0.2em] text-nm-accent uppercase block ml-1">
                                        Repository_URL (GitHub)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="HTTPS://GITHUB.COM/OWNER/REPO"
                                        required
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                        className="input-nm text-lg h-20 uppercase"
                                    />
                                </div>

                                {/* Project Type Selection */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold tracking-[0.2em] text-nm-accent uppercase block ml-1">
                                        Specialization_Core
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: "web_app", label: "WEB_UI", icon: <Globe size={20} /> },
                                            { id: "api", label: "API_SERVICES", icon: <Database size={20} /> },
                                            { id: "full_stack", label: "FULL_PIPELINE", icon: <Code2 size={20} /> },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setProjectType(type.id as any)}
                                                className={`flex flex-col items-center justify-center gap-4 py-8 rounded-2xl transition-all ${projectType === type.id
                                                    ? "shadow-nm-inset text-nm-accent"
                                                    : "shadow-nm-extruded text-nm-muted hover:text-nm-fg"
                                                    }`}
                                            >
                                                {type.icon}
                                                <span className="font-bold text-[10px] tracking-widest uppercase">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-6 bg-red-500/10 rounded-2xl shadow-nm-inset text-red-500 font-bold uppercase tracking-tighter text-center">
                                        Error: {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-nm-primary w-full h-24 text-2xl group shadow-nm-extruded flex items-center justify-center gap-4 mt-8"
                                >
                                    <span>Run System Protocol</span>
                                    <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform duration-300" />
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex flex-col justify-center min-h-[400px]"
                            >
                                <div className="space-y-12">
                                    <div className="flex items-center gap-8">
                                        <div className="w-20 h-20 rounded-3xl shadow-nm-inset flex items-center justify-center text-nm-accent animate-nm-pulse">
                                            <Zap size={32} className="fill-current" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-4xl font-extrabold tracking-tight uppercase mb-2">System Operating</h3>
                                            <p className="text-lg font-bold text-nm-accent uppercase tracking-widest animate-pulse">
                                                {statusMessage}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        {/* Progress Track */}
                                        <div className="h-4 w-full rounded-full shadow-nm-inset bg-nm-bg overflow-hidden p-1">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: status === "completed" ? "100%" :
                                                        status === "scoring" ? "80%" :
                                                            status === "analyzing" ? "50%" :
                                                                status === "cloning" ? "20%" : "10%"
                                                }}
                                                className="h-full bg-nm-accent rounded-full shadow-[0_0_12px_rgba(102,126,234,0.4)] transition-all duration-1000"
                                            />
                                        </div>

                                        {/* Step Indicators */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {steps.map((step) => {
                                                const s = getStepStatus(step.id);
                                                return (
                                                    <div key={step.id} className={`p-8 rounded-2xl transition-all duration-500 flex flex-col items-center gap-6 ${s === "complete" ? "shadow-nm-inset bg-nm-bg" :
                                                        s === "active" ? "shadow-nm-extruded bg-nm-bg ring-2 ring-nm-accent/20" :
                                                            "shadow-nm-extruded opacity-30 grayscale"
                                                        }`}>
                                                        <div className={`${s === "active" || s === "complete" ? "text-nm-accent" : "text-nm-muted"}`}>
                                                            {s === "complete" ? <CheckCircle2 size={32} /> : step.icon}
                                                        </div>
                                                        <span className={`text-[10px] font-bold tracking-widest uppercase text-center ${s === "active" ? "text-nm-accent" : "text-nm-muted"}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
                <Loader2 size={40} className="animate-spin text-[var(--color-accent)]" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
