"use client";

import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";

interface ArenaEffectsProps {
    level: number;
}

// Deterministic "random-looking" helper — rand() calls are wrapped in useMemo
// per Arena component so they only fire on mount, not on every render.
function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}

// ─── ARENA 1: SOBREVIVÊNCIA — Rachaduras, poeira, tremor ─────────────────────
function Arena1Effects() {
    const dustParticles = useMemo(
        () =>
            [...Array(5)].map(() => ({
                size: randomRange(2, 6),
                left: `${randomRange(0, 100)}%`,
                top: `${randomRange(0, 100)}%`,
                bgAlpha: randomRange(0.15, 0.4),
                yPeak: randomRange(-70, -30),
                xPeak: randomRange(-10, 10),
                duration: randomRange(3, 7),
                delay: randomRange(0, 3),
            })),
        []
    );

    return (
        <>
            {/* Dark red gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-red-900/10 to-orange-950/15" />

            {/* Animated red dust particles */}
            {dustParticles.map((p, i) => (
                <motion.div
                    key={`dust-${i}`}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                        background: `rgba(239, 68, 68, ${p.bgAlpha})`,
                    }}
                    animate={{
                        y: [0, p.yPeak, 0],
                        x: [0, p.xPeak, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* SVG Cracks overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 400 900" preserveAspectRatio="none">
                {/* Main vertical crack */}
                <motion.path
                    d="M 50 0 L 55 80 L 48 120 L 60 200 L 52 280 L 58 350 L 45 420 L 55 500"
                    stroke="#ef4444"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                />
                {/* Branch cracks */}
                <motion.path
                    d="M 55 80 L 90 100 L 110 95"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                />
                <motion.path
                    d="M 48 120 L 20 150 L 10 180"
                    stroke="#dc2626"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
                />
                {/* Right side crack */}
                <motion.path
                    d="M 350 100 L 340 180 L 355 250 L 345 320 L 360 400"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
                />
                <motion.path
                    d="M 340 180 L 310 200 L 290 195"
                    stroke="#dc2626"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 2, ease: "easeOut" }}
                />
                {/* Bottom crack web */}
                <motion.path
                    d="M 200 700 L 180 750 L 190 800 L 170 850 L 200 900"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                />
                <motion.path
                    d="M 180 750 L 140 770 L 120 800"
                    stroke="#b91c1c"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
                />
                <motion.path
                    d="M 190 800 L 230 820 L 260 810"
                    stroke="#b91c1c"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 3, ease: "easeOut" }}
                />
            </svg>

            {/* Pulsing danger glow at edges */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-24 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Subtle screen shake on load */}
            <motion.div
                className="absolute inset-0"
                animate={{ x: [0, -1, 1, -0.5, 0.5, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
            />
        </>
    );
}

// ─── ARENA 2: ORGANIZAÇÃO — Engrenagens + Grid ──────────────────────────────
function Arena2Effects() {
    const dots = useMemo(
        () =>
            [...Array(3)].map(() => ({
                left: `${randomRange(15, 85)}%`,
                top: `${randomRange(10, 90)}%`,
                duration: randomRange(4, 7),
                delay: randomRange(0, 4),
            })),
        []
    );

    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-yellow-50/60" />

            {/* Rotating gear outlines */}
            <motion.svg
                className="absolute top-[5%] right-[-5%] w-48 h-48 opacity-[0.06]"
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                <path
                    d="M50 10 L55 20 L65 15 L62 27 L72 28 L65 38 L75 42 L65 48 L72 58 L62 55 L65 65 L55 60 L50 70 L45 60 L35 65 L38 55 L28 58 L35 48 L25 42 L35 38 L28 28 L38 27 L35 15 L45 20 Z"
                    stroke="#f97316"
                    strokeWidth="1.5"
                    fill="none"
                />
                <circle cx="50" cy="40" r="10" stroke="#f97316" strokeWidth="1" fill="none" />
            </motion.svg>

            <motion.svg
                className="absolute bottom-[15%] left-[-3%] w-32 h-32 opacity-[0.05]"
                viewBox="0 0 100 100"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
                <path
                    d="M50 10 L55 20 L65 15 L62 27 L72 28 L65 38 L75 42 L65 48 L72 58 L62 55 L65 65 L55 60 L50 70 L45 60 L35 65 L38 55 L28 58 L35 48 L25 42 L35 38 L28 28 L38 27 L35 15 L45 20 Z"
                    stroke="#ea580c"
                    strokeWidth="2"
                    fill="none"
                />
            </motion.svg>

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Floating orange dots */}
            {dots.map((d, i) => (
                <motion.div
                    key={`org-${i}`}
                    className="absolute w-2 h-2 rounded-full bg-orange-400/20"
                    style={{
                        left: d.left,
                        top: d.top,
                    }}
                    animate={{
                        y: [0, -15, 0],
                        opacity: [0.15, 0.4, 0.15],
                    }}
                    transition={{
                        duration: d.duration,
                        repeat: Infinity,
                        delay: d.delay,
                    }}
                />
            ))}
        </>
    );
}

// ─── ARENA 3: ESTABILIDADE — Ondas de água calma ────────────────────────────
function Arena3Effects() {
    const drops = useMemo(
        () =>
            [...Array(4)].map(() => ({
                size: randomRange(4, 10),
                left: `${randomRange(10, 90)}%`,
                yPeak: randomRange(-200, -80),
                duration: randomRange(3, 6),
                delay: randomRange(0, 5),
            })),
        []
    );

    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-sky-50/30 to-cyan-50/40" />

            {/* Multiple wave layers */}
            <svg className="absolute bottom-24 left-0 w-full h-40 opacity-[0.08]" viewBox="0 0 1200 200" preserveAspectRatio="none">
                <motion.path
                    d="M0 120 Q150 80 300 120 Q450 160 600 120 Q750 80 900 120 Q1050 160 1200 120 L1200 200 L0 200 Z"
                    fill="#3b82f6"
                    animate={{
                        d: [
                            "M0 120 Q150 80 300 120 Q450 160 600 120 Q750 80 900 120 Q1050 160 1200 120 L1200 200 L0 200 Z",
                            "M0 120 Q150 160 300 120 Q450 80 600 120 Q750 160 900 120 Q1050 80 1200 120 L1200 200 L0 200 Z",
                            "M0 120 Q150 80 300 120 Q450 160 600 120 Q750 80 900 120 Q1050 160 1200 120 L1200 200 L0 200 Z",
                        ],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
            <svg className="absolute bottom-20 left-0 w-full h-32 opacity-[0.05]" viewBox="0 0 1200 200" preserveAspectRatio="none">
                <motion.path
                    d="M0 140 Q200 100 400 140 Q600 180 800 140 Q1000 100 1200 140 L1200 200 L0 200 Z"
                    fill="#0ea5e9"
                    animate={{
                        d: [
                            "M0 140 Q200 100 400 140 Q600 180 800 140 Q1000 100 1200 140 L1200 200 L0 200 Z",
                            "M0 140 Q200 180 400 140 Q600 100 800 140 Q1000 180 1200 140 L1200 200 L0 200 Z",
                            "M0 140 Q200 100 400 140 Q600 180 800 140 Q1000 100 1200 140 L1200 200 L0 200 Z",
                        ],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </svg>

            {/* Water droplet particles rising */}
            {drops.map((d, i) => (
                <motion.div
                    key={`drop-${i}`}
                    className="absolute rounded-full bg-blue-400/15"
                    style={{
                        width: d.size,
                        height: d.size,
                        left: d.left,
                        bottom: '15%',
                    }}
                    animate={{
                        y: [0, d.yPeak],
                        opacity: [0.3, 0],
                        scale: [1, 0.5],
                    }}
                    transition={{
                        duration: d.duration,
                        repeat: Infinity,
                        delay: d.delay,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Horizontal shimmer line */}
            <motion.div
                className="absolute top-[30%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
                animate={{ opacity: [0.1, 0.4, 0.1], scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
        </>
    );
}

// ─── ARENA 4: SEGURANÇA — Escudo hexagonal + energia ────────────────────────
function Arena4Effects() {
    const hexes = useMemo(
        () =>
            [...Array(3)].map(() => ({
                size: randomRange(20, 50),
                left: `${randomRange(0, 90)}%`,
                top: `${randomRange(20, 80)}%`,
                duration: randomRange(6, 10),
                delay: randomRange(0, 5),
            })),
        []
    );

    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/70 via-violet-50/30 to-fuchsia-50/40" />

            {/* Hexagonal shield pattern */}
            <svg className="absolute top-[10%] left-1/2 -translate-x-1/2 w-72 h-72 opacity-[0.06]" viewBox="0 0 200 200">
                <motion.polygon
                    points="100,10 178,55 178,145 100,190 22,145 22,55"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.9, 1, 0.9], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.polygon
                    points="100,30 162,65 162,135 100,170 38,135 38,65"
                    stroke="#7c3aed"
                    strokeWidth="1"
                    fill="none"
                    animate={{ scale: [1, 0.95, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.polygon
                    points="100,50 145,75 145,125 100,150 55,125 55,75"
                    stroke="#9333ea"
                    strokeWidth="0.8"
                    fill="none"
                    animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
            </svg>

            {/* Small floating hexagons */}
            {hexes.map((h, i) => (
                <motion.svg
                    key={`hex-${i}`}
                    className="absolute opacity-[0.04]"
                    width={h.size}
                    height={h.size}
                    viewBox="0 0 40 40"
                    style={{
                        left: h.left,
                        top: h.top,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 60, 0],
                        opacity: [0.03, 0.07, 0.03],
                    }}
                    transition={{
                        duration: h.duration,
                        repeat: Infinity,
                        delay: h.delay,
                    }}
                >
                    <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" stroke="#a855f7" strokeWidth="1.5" fill="none" />
                </motion.svg>
            ))}

            {/* Energy pulse ring */}
            <motion.div
                className="absolute top-[15%] left-1/2 -translate-x-1/2 w-48 h-48 border border-purple-400/10 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </>
    );
}

// ─── ARENA 5: LIBERDADE — Raios dourados + estrelas brilhantes ──────────────
function Arena5Effects() {
    const stars = useMemo(
        () =>
            [...Array(5)].map(() => ({
                left: `${randomRange(5, 95)}%`,
                top: `${randomRange(5, 90)}%`,
                duration: randomRange(2, 5),
                delay: randomRange(0, 4),
            })),
        []
    );

    return (
        <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-yellow-50/30 to-orange-50/40" />

            {/* Radial golden rays */}
            <motion.div
                className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] opacity-[0.04]"
                style={{
                    background: `
                        conic-gradient(
                            from 0deg at 50% 100%,
                            transparent 0deg,
                            rgba(245,158,11,0.4) 15deg,
                            transparent 30deg,
                            transparent 45deg,
                            rgba(245,158,11,0.3) 60deg,
                            transparent 75deg,
                            transparent 90deg,
                            rgba(245,158,11,0.4) 105deg,
                            transparent 120deg,
                            transparent 135deg,
                            rgba(245,158,11,0.3) 150deg,
                            transparent 165deg,
                            transparent 180deg,
                            rgba(245,158,11,0.4) 195deg,
                            transparent 210deg,
                            transparent 225deg,
                            rgba(245,158,11,0.3) 240deg,
                            transparent 255deg,
                            transparent 270deg,
                            rgba(245,158,11,0.4) 285deg,
                            transparent 300deg,
                            transparent 315deg,
                            rgba(245,158,11,0.3) 330deg,
                            transparent 345deg,
                            transparent 360deg
                        )
                    `,
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />

            {/* Twinkling stars */}
            {stars.map((s, i) => (
                <motion.div
                    key={`star-${i}`}
                    className="absolute"
                    style={{
                        left: s.left,
                        top: s.top,
                    }}
                    animate={{
                        scale: [0.5, 1.2, 0.5],
                        opacity: [0.1, 0.5, 0.1],
                    }}
                    transition={{
                        duration: s.duration,
                        repeat: Infinity,
                        delay: s.delay,
                    }}
                >
                    <svg width="8" height="8" viewBox="0 0 12 12">
                        <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#f59e0b" opacity="0.3" />
                    </svg>
                </motion.div>
            ))}

            {/* Golden shimmer line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </>
    );
}

// ─── ARENA 6: DOMÍNIO — Aurora boreal + cristais ────────────────────────────
function Arena6Effects() {
    const crystals = useMemo(
        () =>
            [...Array(4)].map(() => ({
                left: `${randomRange(10, 90)}%`,
                top: `${randomRange(10, 85)}%`,
                duration: randomRange(5, 9),
                delay: randomRange(0, 5),
            })),
        []
    );

    return (
        <>
            {/* Aurora gradient layers */}
            <motion.div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    background: `linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2), rgba(168,85,247,0.15), rgba(16,185,129,0.2))`,
                    backgroundSize: '400% 400%',
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary aurora wave */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[50%] opacity-[0.05]"
                style={{
                    background: `linear-gradient(180deg, rgba(6,182,212,0.4), transparent)`,
                }}
                animate={{ opacity: [0.03, 0.08, 0.03] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Crystal-like diamond particles */}
            {crystals.map((c, i) => (
                <motion.div
                    key={`crystal-${i}`}
                    className="absolute"
                    style={{
                        left: c.left,
                        top: c.top,
                    }}
                    animate={{
                        y: [0, -25, 0],
                        rotate: [0, 45, 0],
                        opacity: [0.1, 0.35, 0.1],
                    }}
                    transition={{
                        duration: c.duration,
                        repeat: Infinity,
                        delay: c.delay,
                    }}
                >
                    <svg width="10" height="14" viewBox="0 0 10 14">
                        <polygon points="5,0 10,5 5,14 0,5" fill="rgba(16,185,129,0.3)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
                    </svg>
                </motion.div>
            ))}

            {/* Pulsing emerald ring */}
            <motion.div
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-64 border border-emerald-400/8 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0, 0.08] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-64 border border-teal-400/5 rounded-full"
                animate={{ scale: [1.1, 1.5, 1.1], opacity: [0.05, 0, 0.05] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
        </>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export const ArenaEffects = memo(function ArenaEffects({ level }: ArenaEffectsProps) {
    const EffectsComponent = useMemo(() => {
        switch (level) {
            case 1: return Arena1Effects;
            case 2: return Arena2Effects;
            case 3: return Arena3Effects;
            case 4: return Arena4Effects;
            case 5: return Arena5Effects;
            case 6: return Arena6Effects;
            default: return Arena1Effects;
        }
    }, [level]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <EffectsComponent />
        </div>
    );
});
