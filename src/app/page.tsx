"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Zap,
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  Github,
  ArrowRight,
  Code2,
  Lock,
  Globe,
  Database,
} from "lucide-react";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import BitcoinOrb from "@/components/BitcoinOrb";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="bg-nm-bg text-nm-fg min-h-screen relative overflow-hidden selection:bg-nm-accent selection:text-white font-sans">
      <Navbar />

      {/* Hero Section - Neumorphic Treatment */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center max-w-7xl mx-auto px-6 py-32 text-center">
        {/* Background tactile decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[15%] left-[5%] w-64 h-64 rounded-full shadow-nm-inset animate-nm-float opacity-50" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full shadow-nm-extruded animate-nm-float opacity-40 [animation-delay:1s]" />
          <div className="absolute top-[40%] right-[5%] w-32 h-32 rounded-full shadow-nm-inset-deep opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-nm-bg rounded-full mb-12 shadow-nm-inset-sm cursor-default">
            <div className="w-2 h-2 rounded-full bg-nm-accent animate-nm-pulse" />
            <span className="text-xs font-bold text-nm-muted uppercase tracking-[0.2em]">
              Verification Protocol 2.0
            </span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tighter mb-10 max-w-5xl mx-auto text-nm-fg leading-[0.95] drop-shadow-sm">
            Quantify your technical <br />
            <span className="text-nm-accent">worth</span> with precision.
          </h1>

          <p className="max-w-2xl mx-auto text-xl md:text-2xl font-medium text-nm-muted leading-relaxed mb-16">
            Proof-of-Work Protocol is a tactile verification engine for engineers who value depth.
            Transform your history into a physically grounded proof of excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link href={user ? "/verify" : "/login"} className="btn-nm-primary h-16 px-12 group no-underline text-lg shadow-nm-extruded hover:shadow-nm-lifted">
              Get Started <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
            </Link>
            <Link href="#features" className="btn-nm-secondary h-16 px-12 text-lg no-underline shadow-nm-extruded">
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Sections - Neumorphic Cards */}
      <section id="features" className="py-48 px-6 bg-nm-bg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-32 text-center">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-nm-fg tracking-tight">Tactile Engineering</h2>
            <p className="text-nm-muted max-w-2xl mx-auto text-xl font-medium">
              We use dual-shadow depth and structural mapping to ensure your work is verified with a physically grounded confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {[
              {
                title: "Deep Analysis",
                desc: "Forensic scanning of repositories to uncover complex architecture and logic.",
                icon: <Database size={28} />,
              },
              {
                title: "Neural Audit",
                desc: "Advanced AI scoring that evaluates codebase health and best practices.",
                icon: <Zap size={28} />,
              },
              {
                title: "Technical Proof",
                desc: "Isolating genuine problem-solving from automated boilerplate and synthetic code.",
                icon: <Shield size={28} />,
              },
              {
                title: "Secure Storage",
                desc: "Every verification results in a permanent proof of competence, molded into the protocol.",
                icon: <Lock size={28} />,
              },
              {
                title: "Vector Mapping",
                desc: "Skill analysis across multiple dimensions, from systems to frontend architecture.",
                icon: <Globe size={28} />,
              },
              {
                title: "Real-time Pulse",
                desc: "Synchronous verification heartbeat with tactile review loops and low latency.",
                icon: <Clock size={28} />,
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-nm flex flex-col items-center text-center group cursor-default h-full p-12"
              >
                <div className="w-20 h-20 rounded-[20px] shadow-nm-inset-deep flex items-center justify-center mb-10 bg-nm-bg text-nm-accent transition-all group-hover:scale-110 group-hover:rotate-6">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold mb-6 text-nm-fg">
                  {feature.title}
                </h3>
                <p className="text-nm-muted text-lg leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero CTA - Tactile Pressed Section */}
      <section className="py-48 px-6">
        <div className="max-w-6xl mx-auto rounded-[64px] shadow-nm-inset-deep bg-nm-bg p-16 md:p-32 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display text-5xl md:text-7xl font-extrabold mb-10 text-nm-fg tracking-tighter">
              Build a trusted <br /> <span className="text-nm-accent">technical identity</span>.
            </h2>
            <p className="text-xl md:text-2xl text-nm-muted mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
              Stop telling people you're a senior engineer. <br /> Share a physically verifiable proof of your technical worth.
            </p>
            <div className="flex justify-center">
              <Link href={user ? "/verify" : "/login"} className="btn-nm-primary h-20 px-16 text-xl shadow-nm-extruded hover:shadow-nm-lifted">
                Initialize Protocol
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Soft & Tactile */}
      <footer className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 no-underline group active:scale-95 transition-all">
              <div className="bg-nm-bg w-12 h-12 rounded-2xl flex items-center justify-center shadow-nm-extruded group-hover:shadow-nm-lifted">
                <Zap size={24} className="text-nm-accent fill-current" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-nm-fg">
                PoW <span className="text-nm-accent">Protocol</span>
              </span>
            </Link>
            <p className="text-lg text-nm-muted max-w-md leading-relaxed font-medium">
              A physically grounded verification engine for the technical elite. Built with depth, tactile precision, and physics in mind.
              <br /><br />
              &copy; 2026 PoW Protocol. Molded by Design.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-20 md:gap-32">
            <div className="flex flex-col gap-6 font-medium">
              <span className="text-xs font-bold text-nm-accent uppercase tracking-widest mb-2">Platform</span>
              <Link href="/dashboard" className="text-nm-muted hover:text-nm-fg transition-colors no-underline">Dashboard</Link>
              <Link href="/verify" className="text-nm-muted hover:text-nm-fg transition-colors no-underline">Verify Work</Link>
              <Link href="/history" className="text-nm-muted hover:text-nm-fg transition-colors no-underline">Audit Logs</Link>
            </div>
            <div className="flex flex-col gap-6 font-medium">
              <span className="text-xs font-bold text-nm-accent uppercase tracking-widest mb-2">Manual</span>
              <Link href="/login" className="text-nm-muted hover:text-nm-fg transition-colors no-underline">Sign In</Link>
              <Link href="/signup" className="text-nm-muted hover:text-nm-fg transition-colors no-underline">Sign Up</Link>
              <Link href="/privacy" className="text-nm-muted hover:text-nm-fg transition-colors no-underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
