import { ZellaLogo } from "./logo";
import { motion } from "framer-motion";

export function PageLoader({ message = "Carregando..." }: { message?: string }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
            <motion.div
                animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.98, 1.02, 0.98]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            >
                <ZellaLogo size="lg" />
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
