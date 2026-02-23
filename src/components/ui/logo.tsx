"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
}

export function ZellaLogo({ className, size = "md", showText = true }: LogoProps) {
    const dims = { sm: 32, md: 44, lg: 72, xl: 110 };
    const d = dims[size];

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Z icon: matches the Zella logo — blue top swoosh + green bottom swoosh */}
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                style={{ width: d, height: d }}
                className="relative shrink-0"
            >
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    width={d}
                    height={d}
                >
                    <defs>
                        <linearGradient id="blue-grad" x1="0" y1="0" x2="100" y2="60" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#60c6f5" />
                            <stop offset="100%" stopColor="#1a4fc8" />
                        </linearGradient>
                        <linearGradient id="green-grad" x1="0" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#4ade80" />
                            <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                    </defs>
                    {/* Top blue swoosh — upper Z stroke */}
                    <path
                        d="M10 15 Q30 5 70 18 L82 30 Q60 22 20 34 Z"
                        fill="url(#blue-grad)"
                    />
                    {/* Middle connector diagonal */}
                    <path
                        d="M78 28 L52 55 Q48 59 44 62 L22 68"
                        stroke="url(#blue-grad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Bottom green swoosh — lower Z stroke */}
                    <path
                        d="M18 70 Q45 80 78 68 L82 80 Q56 94 12 84 Z"
                        fill="url(#green-grad)"
                    />
                </svg>
                {/* Glow */}
                <div className="absolute inset-0 -z-10 blur-xl opacity-30 bg-gradient-to-tr from-blue-500 to-green-400 rounded-full" />
            </motion.div>

            {showText && (
                <div className={cn("font-heading font-extrabold tracking-tight", {
                    "text-lg": size === "sm",
                    "text-2xl": size === "md",
                    "text-4xl": size === "lg",
                    "text-6xl": size === "xl",
                })}>
                    <span className="text-[#1a4fc8] dark:text-[#60a5fa]">Z</span>
                    <span className="text-foreground">ELLA</span>
                </div>
            )}
        </div>
    );
}
