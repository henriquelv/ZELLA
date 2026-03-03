"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { ZellaLogo } from "@/components/ui/logo";
import { ZLogoScene } from "@/components/ui/3d-scenes";

interface UserProfile {
  id: string;
  name?: string;
  xp: number;
  coins?: number;
  streak: number;
  current_step: number;
  active_avatar: string;
  unlocked_avatars?: string[];
  transactions?: any[];
  goals?: any[];
  daily_quiz_completed_at?: string | null;
}


export default function SplashPage() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [targetPath, setTargetPath] = useState<string>("");

  useEffect(() => {
    const prepareSession = async () => {
      const { data } = await supabase.auth.getSession();
      let destination = "/onboarding";

      if (data.session) {
        // Sync profile in background
        supabase.from('profiles').select('*').eq('id', data.session.user.id).single().then((res: any) => {
          const profile = res.data as UserProfile | null;
          if (profile) {
            useUserStore.getState().syncWithSupabase({
              xp: profile.xp,
              coins: profile.coins || 0,
              streak: profile.streak,
              currentStep: profile.current_step,
              activeAvatar: profile.active_avatar,
              unlockedAvatars: profile.unlocked_avatars || ['default'],
              name: profile.name || "",
              transactions: profile.transactions || [],
              goals: profile.goals || [],
              dailyQuizCompletedAt: profile.daily_quiz_completed_at || null,
            });
          }
        });

        const hasOnboarded = useUserStore.getState().hasOnboarded;
        destination = hasOnboarded ? "/dashboard" : "/onboarding";
      }

      setTargetPath(destination);

      // Wait 3 seconds before starting the exit animation
      setTimeout(() => {
        setIsLeaving(true);
      }, 3000);
    };

    prepareSession();
  }, []);

  const handleExitComplete = () => {
    if (targetPath) {
      router.replace(targetPath);
    }
  };



  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!isLeaving && (
        <motion.main
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
          transition={{ duration: 1 }}
          className="flex min-h-screen flex-col items-center justify-center bg-background text-center relative overflow-hidden aurora"
        >
          {/* Top Bar Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />

          {/* Background Elements */}
          <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
            <ZLogoScene size={1200} />
          </div>

          <div className="absolute top-1/4 -right-20 w-[60%] h-[60%] bg-[var(--zella-blue)]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -left-20 w-[60%] h-[60%] bg-[var(--zella-green)]/8 rounded-full blur-[120px] pointer-events-none" />

          {/* Logo/Branding Container */}
          <div className="relative z-10 space-y-16 max-w-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-10">
                <div className="glass p-6 rounded-[2.5rem] shadow-2xl relative z-10 rotate-3 hover:rotate-0 transition-transform duration-700">
                  <ZellaLogo size="xl" />
                </div>
                <motion.div
                  className="absolute inset-[10%] border-2 border-primary/20 rounded-[2.5rem]"
                  animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="-mt-4 flex flex-col items-center"
              >
                <div className="text-glow">
                  <ZellaLogo size="lg" showText />
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Copy - EPIC TONE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-black font-heading leading-none tracking-tighter">
                Evolua sua conta.<br />
                <span className="zella-gradient-text italic">Liberte seu legado.</span>
              </h1>
              <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.3em] mt-4">
                Sincronizando com a Matriz Zella
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="flex flex-col items-center pt-4"
            >
              <div className="flex gap-3">
                {[0, 0.15, 0.3].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: d }}
                    className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-12 text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.5em]"
          >
            ZELLA &copy; 2026 / PROJETO MATRIZ
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
