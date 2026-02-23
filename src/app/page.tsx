"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { ZellaLogo } from "@/components/ui/logo";
import { ZLogoScene } from "@/components/ui/3d-scenes";


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
        supabase.from('profiles').select('*').eq('id', data.session.user.id).single().then(({ data: profile }) => {
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
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
          className="flex min-h-screen flex-col items-center justify-center bg-white text-center relative overflow-hidden"
        >
          {/* Dynamic Blue/White Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-primary to-emerald-400" />

          {/* Background 3D Depth */}
          <div className="absolute inset-0 z-0 opacity-40 grayscale-[0.5] mix-blend-multiply">
            <ZLogoScene size={600} />
          </div>

          <div className="absolute top-20 -right-16 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-20 -left-16 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Logo/Branding Container */}
          <div className="relative z-10 space-y-12 max-w-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <ZellaLogo size="xl" />
                <motion.div
                  className="absolute inset-0 border-4 border-primary/30 rounded-full"
                  animate={{ scale: [0.9, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="-mt-8"
              >
                <ZellaLogo size="md" showText />
              </motion.div>
            </motion.div>

            {/* Hero Copy - EPIC TONE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-black font-heading leading-tight tracking-tighter">
                Evolua sua conta.<br />
                <span className="text-primary italic">Conquiste sua liberdade.</span>
              </h1>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex gap-2">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                      backgroundColor: ["#2563eb", "#60a5fa", "#2563eb"]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: d }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                ))}
              </div>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] animate-pulse">
                Sincronizando Matriz
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-10 text-[10px] text-blue-900/40 font-bold uppercase tracking-[0.5em]"
          >
            ZELLA &copy; 2026
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
