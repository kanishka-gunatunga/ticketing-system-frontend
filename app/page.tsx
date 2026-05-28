"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../utils/auth";
import { Shield, ArrowRight, Activity, CheckCircle, Clock, MessageSquare } from "lucide-react";

export default function Home() {
    const user = useCurrentUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"client" | "l1" | "l2">("client");

    useEffect(() => {
        if (user) {
            router.replace("/leads");
        }
    }, [user, router]);

    const personas = {
        client: {
            label: "Client",
            badge: "Seamless Submissions",
            title: "Clients & Partners Portal",
            description: "Submit technical inquiries, upload diagnostic evidence, and track real-time ticket progress in one place.",
            features: ["Direct Incident Registration", "Multiple Evidence Attachments", "Dedicated L1 Chat Channel", "Instant Status Updates"],
        },
        l1: {
            label: "L1 Agent",
            badge: "Fast Triage & Response",
            title: "L1 Support Representative",
            description: "Claim tickets from the queue, assess user impact, and escalate complex issues to specialist L2 engineers.",
            features: ["Self-Assign Queue System", "Triage & Impact Assessment", "Direct Client Chat Hub", "One-Click L2 Escalation"],
        },
        l2: {
            label: "L2 Engineer",
            badge: "Deep Incident Resolution",
            title: "L2 Product Engineer Portal",
            description: "Receive complex escalations, inspect product licenses, review full audit trails, and resolve deep platform issues.",
            features: ["Escalated Inquiries Pipeline", "Platform License Verification", "Full System Journey Audit", "SLA-driven Resolution"],
        },
    };

    const features = [
        { icon: <Activity size={20} />, title: "Dynamic SLA Matrix", desc: "Urgency tags adjust automatically to preserve SLA compliance across all product lines." },
        { icon: <Shield size={20} />, title: "L1/L2 Pipelines", desc: "Structured escalation queues with built-in handover flows between support tiers." },
        { icon: <Clock size={20} />, title: "Immutable Audit Log", desc: "Every ticket event, assignment and status change is logged chronologically." },
        { icon: <MessageSquare size={20} />, title: "Live Chat Channel", desc: "Real-time messaging between clients and agents with file attachment support." },
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>

            {/* ── NAVBAR ── */}
            <nav style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                            <Activity size={18} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, letterSpacing: "0.05em", color: "#0f172a" }}>DIGITRUST</p>
                            <p style={{ margin: 0, fontSize: 10, color: "#64748b", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ticketing System</p>
                        </div>
                    </div>

                    {/* Status + Auth */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }}></span>
                            <span style={{ color: "#475569", fontWeight: 500 }}>All Systems Operational</span>
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            style={{ padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#475569", backgroundColor: "transparent", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#f1f5f9"; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "transparent"; }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
                {/* Icon Badge */}
                {/* <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, backgroundColor: "#dc2626", color: "#fff", marginBottom: 24, boxShadow: "0 4px 24px rgba(220,38,38,0.18)" }}>
                    <Shield size={28} />
                </div> */}

                {/* Label */}
                <div style={{ display: "inline-block", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#dc2626", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
                    High-Assurance Incidents Portal
                </div>

                {/* Heading */}
                <h1 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.15, color: "#0f172a" }}>
                    Digitrust <span style={{ color: "#dc2626" }}>Ticketing System</span>
                </h1>

                {/* Sub */}
                <p style={{ margin: "0 auto 36px", fontSize: 17, color: "#64748b", lineHeight: 1.7, maxWidth: 580, fontWeight: 400 }}>
                    A secure, multi-tier enterprise support platform connecting clients, L1 helpdesks, and L2 engineers — all under strict SLA management.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <button
                        onClick={() => router.push("/login")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", backgroundColor: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 15, borderRadius: 12, border: "none", cursor: "pointer", boxShadow: "0 2px 12px rgba(220,38,38,0.20)" }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#b91c1c"; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "#dc2626"; }}
                    >
                        Access Secure Portal <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={() => router.push("/register")}
                        style={{ padding: "13px 28px", backgroundColor: "#ffffff", color: "#334155", fontWeight: 600, fontSize: 15, borderRadius: 12, border: "1px solid #e2e8f0", cursor: "pointer" }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#f8fafc"; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "#ffffff"; }}
                    >
                        Register Portal
                    </button>
                </div>
            </section>

            {/* ── ROLE SELECTOR ── */}
            <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 64px" }}>
                <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 24, padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    {/* Section Header */}
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#dc2626", letterSpacing: "0.08em", textTransform: "uppercase" }}>Interactive Guide</p>
                        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Select Your Role</h2>
                        <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Explore how Digitrust adapts to your specific workflow.</p>
                    </div>

                    {/* Tab Switcher */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, backgroundColor: "#f1f5f9", borderRadius: 14, padding: 6, marginBottom: 24, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
                        {(["client", "l1", "l2"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "10px 8px",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    backgroundColor: activeTab === tab ? "#ffffff" : "transparent",
                                    color: activeTab === tab ? "#0f172a" : "#64748b",
                                    boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                }}
                            >
                                {personas[tab].label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", backgroundColor: "#f8fafc", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0" }}>
                        {/* Left */}
                        <div style={{ flex: "1 1 280px" }}>
                            <span style={{ display: "inline-block", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 20, padding: "2px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                                {personas[activeTab].badge}
                            </span>
                            <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{personas[activeTab].title}</h3>
                            <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{personas[activeTab].description}</p>
                        </div>
                        {/* Right */}
                        <div style={{ flex: "1 1 220px", backgroundColor: "#ffffff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
                            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Features Included</p>
                            {personas[activeTab].features.map((f, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <CheckCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURE GRID ── */}
            <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 80px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    {features.map((f, i) => (
                        <div key={i} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", marginBottom: 16 }}>
                                {f.icon}
                            </div>
                            <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{f.title}</p>
                            <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>© {new Date().getFullYear()} Digitrust. All rights reserved.</p>
                    {/* <div style={{ display: "flex", gap: 24 }}>
                        {["Security Protocol", "SLA Agreement", "System Status"].map(link => (
                            <span key={link} style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer" }}
                                onMouseEnter={e => { (e.target as HTMLElement).style.color = "#475569"; }}
                                onMouseLeave={e => { (e.target as HTMLElement).style.color = "#94a3b8"; }}
                            >{link}</span>
                        ))}
                    </div> */}
                </div>
            </footer>
        </div>
    );
}
