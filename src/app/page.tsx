"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/10 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6 max-w-md"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-70 blur-lg animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background border shadow-xl mx-auto">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tighter font-heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Zella
        </h1>

        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
          Sua jornada para a <span className="text-foreground">liberdade financeira</span> começa com um único passo.
        </p>

        <div className="pt-8">
          <Link href="/onboarding">
            <Button size="lg" variant="premium" className="w-full text-lg group h-14 rounded-2xl">
              Começar Jornada
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Sem planilhas chatas. Apenas progresso real.
        </p>
      </motion.div>
    </main>
  );
}
