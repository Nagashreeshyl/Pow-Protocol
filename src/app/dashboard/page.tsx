"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
    Plus,
    BarChart3,
    CheckCircle2,
    Clock,
    Zap,
    AlertCircle,
    Loader2,
    ArrowRight,
    Github,
    LogOut,
    Shield,
    Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            fetch(`/api/verify/list?userId=${user.uid}`)
                .then((res) => res.json())
                .then((data) => {
                    setVerifications(data.verifications || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg text-nm-fg">
                <div className="w-20 h-20 rounded-full shadow-nm-inset flex items-center justify-center mb-8">
                    <Loader2 size={32} className="animate-spin text-nm-accent" />
                </div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] animate-pulse text-nm-muted">Protocol Synchronization...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-nm-bg p-8 text-center">
                <div className="w-32 h-32 bg-nm-bg rounded-[40px] shadow-nm-extruded flex items-center justify-center mb-12">
                    <Lock className="text-nm-muted" size={48} />
                </div>
                <h1 className="font-display text-6xl font-extrabold tracking-tighter mb-4 text-nm-fg uppercase">Denied</h1>
                <p className="text-lg font-bold text-nm-muted uppercase max-w-lg mb-12 tracking-tight">
                    Security clearance missing. Authenticate to access the console.
                </p>
                <Link href="/login" className="btn-nm-primary no-underline text-xl h-20 px-12 shadow-nm-extruded">
                    Login to Proceed
                </Link>
            </div>
        );
    }

    const completed = verifications.filter((v) => v.status === "completed");
    const averageScore = completed.length > 0
        ? Math.round(completed.reduce((acc, v) => acc + (v.scores?.overall || 0), 0) / completed.length)
        : 0;

    const stats = [
        { label: "Verifications", value: verifications.length, icon: <Zap size={24} /> },
        { label: "Avg. Score", value: averageScore, icon: <BarChart3 size={24} /> },
        { label: "Repo Verified", value: completed.length, icon: <CheckCircle2 size={24} /> },
        { label: "Pending", value: verifications.length - completed.length, icon: <Clock size={24} /> },
    ];

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

        // Open the custom modal instead of native confirm
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!user || !itemToDelete) return;

        const id = itemToDelete;

        try {
            const res = await fetch(`/api/verify/delete?id=${id}&userId=${user.uid}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setVerifications((prev) => prev.filter((v) => v.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete report");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the report");
        } finally {
            setItemToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-nm-bg text-nm-fg relative">
            <Navbar />

            <div className="max-w-7xl mx-auto py-24 px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 bg-nm-accent rounded-full animate-nm-pulse shadow-[0_0_8px_rgba(102,126,234,0.4)]" />
                            <span className="text-xs font-bold tracking-widest text-nm-accent uppercase">
                                Node Status: Active
                            </span>
                        </div>
                        <h1 className="font-display text-8xl font-black leading-[0.8] tracking-tighter text-nm-fg">
                            CONTROL <br /> <span className="text-nm-accent">CONSOLE</span>
                        </h1>
                        <p className="text-xl font-medium text-nm-muted mt-8 max-w-2xl leading-relaxed">
                            Managing <span className="text-nm-fg font-bold">{verifications.length}</span> technical proof entries in the distributed protocol.
                        </p>
                    </div>

                    <Link href="/verify" className="btn-nm-primary no-underline text-2xl h-24 px-10 shadow-nm-extruded flex items-center gap-4 group">
                        <span>Initiate Scan</span>
                        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-nm-bg p-10 rounded-[40px] shadow-nm-extruded relative overflow-hidden group hover:shadow-nm-lifted transition-all">
                            <div className="w-14 h-14 bg-nm-bg rounded-2xl shadow-nm-inset flex items-center justify-center text-nm-accent mb-8">
                                {stat.icon}
                            </div>
                            <div className="text-7xl font-display font-black tracking-tighter leading-none text-nm-fg mb-4">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold tracking-[0.2em] text-nm-muted uppercase">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Verification Protocol History */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between pl-2">
                        <h2 className="font-display text-4xl font-extrabold tracking-tight">System Logs</h2>
                        <div className="px-6 py-2 rounded-full shadow-nm-inset text-[10px] font-bold tracking-widest text-nm-muted uppercase">
                            {verifications.length} Entries Found
                        </div>
                    </div>

                    <div className="space-y-6">
                        {verifications.length > 0 ? (
                            verifications.map((v) => (
                                <div
                                    key={v.id}
                                    className="card-nm group hover:shadow-nm-lifted transition-all p-8 flex flex-col md:flex-row md:items-center justify-between gap-8"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 bg-nm-bg rounded-2xl shadow-nm-inset flex items-center justify-center text-nm-fg group-hover:text-nm-accent transition-colors">
                                            <Github size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold tracking-tight text-nm-fg mb-2">
                                                {v.repo_name || v.repo_url.split("/").pop()}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold tracking-widest text-nm-muted uppercase">
                                                <span className="flex items-center gap-2">
                                                    <Clock size={12} />
                                                    {new Date(v.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="px-3 py-1 rounded-full shadow-nm-inset text-nm-accent-secondary">
                                                    {v.project_type.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12">
                                        {v.status === "completed" ? (
                                            <>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-bold tracking-widest text-nm-muted uppercase mb-1">Score Verified</div>
                                                    <div className="text-4xl font-display font-black text-nm-accent tracking-tighter">
                                                        {v.scores?.overall}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/results/${v.id}`}
                                                    className="w-16 h-16 bg-nm-bg rounded-2xl shadow-nm-extruded flex items-center justify-center text-nm-fg hover:text-nm-accent hover:shadow-nm-lifted active:shadow-nm-inset transition-all"
                                                >
                                                    <ArrowRight size={28} />
                                                </Link>
                                            </>
                                        ) : v.status === "failed" ? (
                                            <div className="flex items-center gap-3 text-red-500 font-bold tracking-tighter text-lg uppercase px-6 py-3 rounded-2xl shadow-nm-inset">
                                                <AlertCircle size={20} />
                                                Failed
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/verify?jobId=${v.id}`}
                                                className="flex items-center gap-3 text-nm-accent font-bold tracking-tighter text-lg uppercase px-6 py-3 rounded-2xl shadow-nm-inset animate-pulse"
                                            >
                                                <Loader2 size={20} className="animate-spin" />
                                                In Progress
                                            </Link>
                                        )}

                                        {/* Delete Action */}
                                        <button
                                            onClick={(e) => handleDelete(e, v.id)}
                                            className="w-16 h-16 bg-nm-bg rounded-2xl shadow-nm-extruded flex items-center justify-center text-red-500 hover:shadow-nm-lifted active:shadow-nm-inset transition-all"
                                            title="Delete Entry"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-nm-bg p-32 rounded-[64px] shadow-nm-inset text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-nm-bg rounded-3xl shadow-nm-extruded flex items-center justify-center mb-12">
                                    <Shield size={48} className="text-nm-muted opacity-40" />
                                </div>
                                <h3 className="text-4xl font-display font-extrabold tracking-tight text-nm-fg mb-4 uppercase">Protocol Empty</h3>
                                <p className="text-lg font-medium text-nm-muted max-w-sm mb-12">
                                    No recorded verification entries found in the shared ledger.
                                </p>
                                <Link
                                    href="/verify"
                                    className="btn-nm-primary no-underline text-xl h-20 px-12 shadow-nm-extruded"
                                >
                                    Initiate First Scan
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Neumorphic Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-nm-bg/80 backdrop-blur-md"
                        onClick={() => setItemToDelete(null)}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md bg-nm-bg p-10 rounded-[40px] shadow-nm-lifted border border-white/20"
                    >
                        <div className="w-20 h-20 mx-auto bg-nm-bg rounded-full shadow-nm-inset flex items-center justify-center mb-8">
                            <Trash2 size={32} className="text-red-500" />
                        </div>

                        <h3 className="font-display text-3xl font-black text-center text-nm-fg mb-4 uppercase tracking-tight">
                            Confirm Deletion
                        </h3>

                        <p className="text-center text-nm-muted font-bold text-sm leading-relaxed mb-10 px-4">
                            Are you sure you want to permanently delete this report? This action cannot be reversed and the proof will be lost from the ledger.
                        </p>

                        <div className="flex items-center gap-6 justify-center">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="h-14 px-8 rounded-2xl shadow-nm-inset font-bold text-nm-muted uppercase tracking-wider text-sm hover:shadow-nm-extruded transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="h-14 px-8 rounded-2xl shadow-nm-extruded bg-nm-bg font-bold text-red-500 uppercase tracking-wider text-sm hover:shadow-nm-lifted active:shadow-nm-inset transition-all border border-red-500/10"
                            >
                                Delete File
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function Lock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
