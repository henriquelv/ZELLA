"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useUserStoreHydrated } from "@/store/useStore";
// Import Button just for type safety if needed, though not used in splash
import { Button } from "@/components/ui/button";

export default function SplashPage() {
  const router = useRouter();
  const user = useUserStoreHydrated((state) => state);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load / "Respire" moment
    const timer = setTimeout(() => {
      setLoading(false);

      // Navigation Logic
      if (user && user.hasOnboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }, 2500); // 2.5s for the "breath" effect

    return () => clearTimeout(timer);
  }, [user, router]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/5 pointer-events-none" />

      {/* Pulsing Glow behind Logo */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 space-y-8">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary to-emerald-300 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 mb-6">
              <Sparkles className="text-background w-10 h-10" />
            </div>
          </div>

          <h1 className="text-4xl font-bold font-heading tracking-tight text-foreground">
            Zella
          </h1>
        </motion.div>

        {/* Microcopy with Fade In */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="space-y-2"
        >
          <p className="text-lg font-medium text-muted-foreground">
            Respire...
          </p>
          <p className="text-sm text-muted-foreground/60">
            Estamos preparando seu próximo passo.
          </p>
        </motion.div>
      </div>

      {/* Footer slogan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 text-xs text-muted-foreground/40 font-medium uppercase tracking-widest"
      >
        Dinheiro sob controle, mente em paz
      </motion.div>
    </main>
  );
}
