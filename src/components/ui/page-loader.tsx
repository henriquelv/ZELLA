"use client";

import { motion } from "framer-motion";
import { ZLogoScene } from "./3d-scenes";
import { ZellaLogo } from "./logo";

export function PageLoader({ message = "Carregando..." }: { message?: string }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-center justify-center"
            >
                <div className="absolute inset-0 z-0">
                    <ZLogoScene size={150} />
                </div>
                <div className="relative z-10 scale-125">
                    <ZellaLogo size="md" showText={false} />
                </div>
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground font-medium uppercase tracking-widest text-xs"
            >
                {message}
            </motion.p>
        </div>
    );
}
