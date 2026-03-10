"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const confirmSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem("emailForSignIn");

                if (!email) {
                    setStatus("error");
                    setError("Email not found in local storage. Please restart login on this device.");
                    return;
                }

                try {
                    await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem("emailForSignIn");
                    setStatus("success");
                    setTimeout(() => router.push("/dashboard"), 2000);
                } catch (err: any) {
                    setStatus("error");
                    setError(err.message || "Authentication Failed");
                }
            } else {
                router.push("/login");
            }
        };

        confirmSignIn();
    }, [router]);

    return (
        <div className="min-h-screen bg-nm-bg text-nm-fg">
            <Navbar />

            <div className="flex flex-col items-center justify-center min-vh-80 p-8">
                <div className="max-w-xl w-full card-nm p-12 text-center relative overflow-hidden rounded-[48px]">
                    {/* Background Progress Bar Well */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-nm-bg shadow-nm-inset">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-full bg-nm-accent shadow-[0_0_8px_rgba(102,126,234,0.4)]"
                        />
                    </div>

                    {status === "verifying" && (
                        <div className="space-y-10 py-8">
                            <div className="w-24 h-24 rounded-full shadow-nm-inset flex items-center justify-center mx-auto mb-10">
                                <Loader2 size={40} className="animate-spin text-nm-accent" />
                            </div>
                            <div className="space-y-6">
                                <h1 className="font-display text-4xl font-black tracking-tight uppercase leading-none text-nm-fg">
                                    Synchronizing Protocol
                                </h1>
                                <p className="text-sm font-bold text-nm-muted uppercase tracking-widest animate-pulse">
                                    Verifying secure link challenge...
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-10 py-8">
                            <div className="w-24 h-24 rounded-full shadow-nm-extruded flex items-center justify-center mx-auto mb-10 text-nm-accent">
                                <Shield size={40} />
                            </div>
                            <div className="space-y-6">
                                <h1 className="font-display text-4xl font-black tracking-tight uppercase leading-none text-nm-accent">
                                    Access Granted
                                </h1>
                                <p className="text-sm font-bold text-nm-fg uppercase tracking-widest">
                                    Identity confirmed. Redirecting...
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-10 py-8">
                            <div className="w-24 h-24 rounded-full shadow-nm-extruded flex items-center justify-center mx-auto mb-10 text-red-500">
                                <AlertCircle size={40} />
                            </div>
                            <div className="space-y-6">
                                <h1 className="font-display text-4xl font-black tracking-tight uppercase leading-none text-red-500">
                                    Failure
                                </h1>
                                <p className="text-xs font-bold text-nm-muted uppercase tracking-tight max-w-xs mx-auto leading-relaxed">
                                    {error}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/login")}
                                className="btn-nm-primary h-16 px-10 text-lg shadow-nm-extruded mt-4"
                            >
                                Re-initialize Login
                            </button>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-nm-border/30 text-nm-muted font-bold text-[9px] uppercase tracking-[0.4em] opacity-40">
                        POW_PROTOCOL_V1 // AUTH_SEQUENCE_092
                    </div>
                </div>
            </div>
        </div>
    );
}
