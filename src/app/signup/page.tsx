"use client";

import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendSignInLinkToEmail
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Lock, Mail, Chrome } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to create account");
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            if (err.code === "auth/unauthorized-domain") {
                setError("DOMAIN_NOT_AUTHORIZED: Please add " + window.location.hostname + " to Firebase Authorized Domains.");
            } else {
                setError(err.message || "Google Authentication failed");
            }
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError("PLEASE_ENTER_EMAIL_FIRST");
            return;
        }
        setLoading(true);
        setError(null);

        const actionCodeSettings = {
            url: `${window.location.origin}/auth/callback`,
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setEmailSent(true);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || "Failed to send magic link");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-nm-bg text-nm-fg font-sans relative overflow-hidden selection:bg-nm-accent selection:text-white">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[15%] right-[5%] w-64 h-64 rounded-full shadow-nm-inset opacity-40 animate-nm-float" />
                <div className="absolute bottom-[10%] left-[5%] w-80 h-80 rounded-full shadow-nm-extruded opacity-30 animate-nm-float" />
            </div>

            <Navbar />

            <div className="flex flex-col lg:flex-row-reverse min-h-[calc(100vh-80px)] relative z-10">
                {/* Left Side (Visual Storytelling) - Neumorphic Style */}
                <div className="hidden lg:flex lg:w-5/12 bg-nm-bg p-16 flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-nm-bg rounded-2xl flex items-center justify-center shadow-nm-extruded">
                            <Zap size={28} className="text-nm-accent fill-current" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-nm-fg">
                            Registration Core
                        </span>
                    </div>

                    <div className="relative z-10">
                        <h1 className="font-display text-7xl font-extrabold leading-tight text-nm-fg tracking-tighter mb-8">
                            Join the <br /> <span className="text-nm-accent">Protocol</span>.
                        </h1>
                        <p className="text-nm-muted font-medium max-w-sm leading-relaxed text-xl">
                            Initialize your technical credentials and join the global network of verified code proofs.
                        </p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-6 p-8 rounded-[32px] bg-nm-bg shadow-nm-extruded">
                            <div className="w-14 h-14 rounded-full shadow-nm-inset flex items-center justify-center text-nm-accent-secondary">
                                <div className="w-3 h-3 bg-nm-accent-secondary rounded-full animate-nm-pulse shadow-[0_0_8px_rgba(56,178,172,0.4)]" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-nm-accent uppercase tracking-widest block mb-1">Nodes Online</span>
                                <span className="font-bold text-xl text-nm-fg">14,292 Active Peers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Container */}
                <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 relative">
                    <div className="w-full max-w-lg bg-nm-bg p-10 md:p-16 rounded-[48px] shadow-nm-extruded relative">
                        {emailSent ? (
                            <div className="text-center space-y-12 animate-in fade-in zoom-in duration-500">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-nm-bg rounded-full shadow-nm-inset flex items-center justify-center text-nm-accent">
                                        <Mail size={48} />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-10 h-10 bg-nm-bg rounded-full shadow-nm-extruded flex items-center justify-center text-nm-accent-secondary">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-extrabold tracking-tight">Check your mail</h2>
                                    <p className="text-nm-muted text-lg leading-relaxed font-medium">
                                        We sent a secure sign-in link to <br />
                                        <span className="text-nm-accent font-bold">{email}</span>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-sm font-bold text-nm-accent hover:text-nm-fg transition-colors active:scale-95"
                                >
                                    Back to signup
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="mb-12">
                                    <h1 className="font-display text-5xl font-extrabold tracking-tighter mb-4 text-nm-fg">Generate Identity</h1>
                                    <p className="text-nm-muted text-lg font-medium">
                                        Initialize a new node in the verification protocol.
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={loading}
                                        className="w-full h-16 flex items-center justify-center gap-4 bg-nm-bg rounded-2xl shadow-nm-extruded hover:shadow-nm-lifted active:shadow-nm-inset transition-all font-bold text-nm-fg"
                                    >
                                        <Chrome size={20} className="text-nm-accent" />
                                        <span>Register with Google</span>
                                    </button>
                                </div>

                                <div className="relative mb-10">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full h-px bg-nm-muted/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-6 bg-nm-bg text-nm-muted font-bold uppercase tracking-widest text-[10px]">
                                            or create manually
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-nm-fg pl-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input-nm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center mb-1 pl-1">
                                            <label className="block text-sm font-bold text-nm-fg">
                                                Security Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleMagicLink}
                                                className="text-xs font-bold text-nm-accent hover:text-nm-fg transition-colors"
                                            >
                                                Use Magic Link
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="input-nm"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 rounded-2xl shadow-nm-inset text-red-600 font-bold text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-nm-primary w-full h-16 text-lg mt-6 shadow-nm-extruded hover:shadow-nm-lifted active:scale-95"
                                    >
                                        {loading ? "Processing..." : "Register Identity"}
                                    </button>
                                </form>

                                <div className="mt-12 text-center">
                                    <p className="text-nm-muted mb-4 font-bold text-xs uppercase tracking-widest">
                                        Already in the grid?
                                    </p>
                                    <Link href="/login" className="text-nm-accent font-extrabold text-2xl no-underline hover:text-nm-fg transition-colors block active:scale-95">
                                        Authorize Existing Node
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
