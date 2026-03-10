"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Menu, X, Zap, LogOut, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    const links = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/verify", label: "Verify" },
    ];

    const handleSignOut = () => {
        signOut(auth);
    };

    return (
        <nav className="sticky top-0 z-50 bg-nm-bg/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo - Neumorphic Extruded */}
                <Link
                    href="/"
                    className="group flex items-center gap-3 no-underline active:scale-95 transition-transform"
                >
                    <div className="bg-nm-bg w-10 h-10 rounded-xl flex items-center justify-center shadow-nm-extruded transition-all group-hover:shadow-nm-lifted group-hover:-translate-y-0.5">
                        <Zap size={20} className="text-nm-accent fill-current" />
                    </div>
                    <span className="font-display font-extrabold text-xl tracking-tight text-nm-fg">
                        PoW <span className="text-nm-accent">Protocol</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-nm-bg p-1.5 rounded-full shadow-nm-inset-sm">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all no-underline ${pathname === link.href
                                    ? "bg-nm-bg shadow-nm-extruded text-nm-accent scale-[1.02]"
                                    : "text-nm-muted hover:text-nm-fg"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 ml-2">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-nm-bg rounded-2xl shadow-nm-inset-deep">
                                    <div className="w-2 h-2 rounded-full bg-nm-accent-secondary animate-nm-pulse shadow-[0_0_8px_rgba(56,178,172,0.4)]" />
                                    <span className="text-xs font-bold text-nm-muted">
                                        {user.email?.split("@")[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-10 h-10 flex items-center justify-center bg-nm-bg text-nm-muted hover:text-red-500 rounded-xl shadow-nm-extruded hover:shadow-nm-lifted transition-all active:shadow-nm-inset active:scale-95"
                                    aria-label="Sign Out"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="btn-nm-primary shadow-nm-extruded hover:shadow-nm-lifted"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile menu toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden w-12 h-12 flex items-center justify-center bg-nm-bg text-nm-fg rounded-2xl shadow-nm-extruded active:shadow-nm-inset transition-all"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-nm-bg p-8 shadow-nm-lifted animate-in fade-in slide-in-from-top-4 duration-300 rounded-b-[40px] mx-4 border-t border-white/5">
                    <div className="flex flex-col gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`h-16 flex items-center px-8 rounded-2xl text-xl font-bold no-underline transition-all ${pathname === link.href
                                    ? "bg-nm-bg shadow-nm-inset text-nm-accent"
                                    : "text-nm-fg shadow-nm-extruded active:shadow-nm-inset"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-8 pt-8 border-t border-nm-dark/10">
                            {user ? (
                                <div className="flex flex-col gap-4">
                                    <div className="px-8 py-4 bg-nm-bg rounded-2xl shadow-nm-inset-deep">
                                        <span className="text-sm font-bold text-nm-muted">
                                            Signed in as {user.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setMobileOpen(false);
                                        }}
                                        className="h-16 bg-nm-bg text-red-500 rounded-2xl font-bold shadow-nm-extruded active:shadow-nm-inset transition-all"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="btn-nm-primary h-16 w-full text-lg shadow-nm-extruded"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
