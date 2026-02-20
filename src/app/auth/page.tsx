"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZellaLogo } from "@/components/ui/logo";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push("/dashboard"); // Or wherever the protected route is
            } else {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: email.split("@")[0] // Default name
                        }
                    }
                });
                if (error) throw error;

                if (data?.session) {
                    router.push("/onboarding"); // Start onboarding if auto-logged in
                } else {
                    setError("Verifique seu email para confirmar a conta!");
                }
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro na autenticação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-primary/10 to-background -z-10" />
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <ZellaLogo size="lg" />
                    </div>
                    <h1 className="text-3xl font-bold font-heading">
                        {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isLogin ? "Faça login para continuar sua jornada." : "Comece a gamificar suas finanças hoje."}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl text-center font-medium border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                            <Input
                                type="email"
                                placeholder="Seu melhor email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12 h-14 rounded-2xl bg-card border-border/50 focus-visible:ring-primary/50"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                            <Input
                                type="password"
                                placeholder="Senha segura"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12 h-14 rounded-2xl bg-card border-border/50 focus-visible:ring-primary/50"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all relative overflow-hidden group"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                {isLogin ? "Entrar na Conta" : "Começar Agora"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="text-center pt-4">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                        {isLogin ? "Ainda não tem conta? Clique aqui" : "Já tem uma conta? Faça login"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
