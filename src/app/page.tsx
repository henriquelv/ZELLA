"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { ZellaLogo } from "@/components/ui/logo";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const ZLogoScene = dynamic(
  () => import("@/components/ui/3d-scenes").then(m => ({ default: m.ZLogoScene })),
  { ssr: false, loading: () => <ZellaLogo size="lg" /> }
);


export default function SplashPage() {
  const router = useRouter();
  const user = useUserStoreHydrated((state) => state);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start redirect timer immediately — don't wait for Supabase
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();

      // Sync profile in background (non-blocking)
      if (data.session) {
        const { user: authUser } = data.session;
        supabase.from('profiles').select('*').eq('id', authUser.id).single().then(({ data: profile }) => {
          if (profile) {
            useUserStore.getState().syncWithSupabase({
              xp: profile.xp,
              streak: profile.streak,
              currentStep: profile.current_step,
              activeAvatar: profile.active_avatar,
              unlockedAvatars: profile.unlocked_avatars || ['default'],
              name: profile.name || ""
            });
          }
        });
        // Navigate immediately while profile syncs in background
        if (user && user.hasOnboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/auth");
      }
      setLoading(false);
    }, 1200); // Reduced from 2s to 1.2s

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
          {/* 3D spinning Z Logo */}
          <ZLogoScene size={220} />
          {/* Text brand below */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="-mt-4"
          >
            <ZellaLogo size="md" showText />
          </motion.div>
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
