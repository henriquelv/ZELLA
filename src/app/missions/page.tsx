"use client";

import { useState } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { missions } from "@/data/missions";
import { Coins, Clock, Zap, Filter, ChevronRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUserStoreHydrated } from "@/store/useStore";

const FILTERS = ["Todos", "1 min", "5 min", "15 min"];

export default function MissionsPage() {
    const [activeFilter, setActiveFilter] = useState("Todos");
    const user = useUserStoreHydrated((state) => state);

    if (!user) return <div className="min-h-screen bg-background" />;

    const filteredMissions = activeFilter === "Todos"
        ? missions
        : missions.filter(m => m.time === activeFilter);

    return (
        <div className="min-h-screen bg-background pb-24 relative">
            {/* Header */}
            <div className="px-6 pt-12 pb-4 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/40">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold font-heading">Central de Missões</h1>
                    <Badge variant="secondary" className="gap-1 px-3 py-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span>Nível {Math.floor(user.xp / 100) + 1}</span>
                    </Badge>
                </div>

                {/* Chip Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                activeFilter === filter
                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mission List */}
            <main className="px-4 py-6 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredMissions.map((mission, index) => (
                        <motion.div
                            key={mission.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                            <Link href={mission.actionUrl || "#"}>
                                <Card className="border-0 shadow-sm hover:shadow-md transition-all active:scale-[0.98] bg-gradient-to-r from-card to-card/50 overflow-hidden relative group">
                                    {/* Decoration */}
                                    <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent group-hover:bg-primary transition-colors" />

                                    <CardContent className="p-4 flex gap-4 items-center">
                                        {/* Icon Box */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                                            mission.category === "quick" ? "bg-blue-500/10 text-blue-500" :
                                                mission.category === "debt" ? "bg-red-500/10 text-red-500" :
                                                    mission.category === "future" ? "bg-emerald-500/10 text-emerald-500" :
                                                        "bg-purple-500/10 text-purple-500"
                                        )}>
                                            <mission.icon className="w-6 h-6 stroke-[2]" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-sm truncate pr-2">{mission.title}</h3>
                                                {mission.difficulty === "Difícil" && (
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-red-500/30 text-red-500">
                                                        Hard
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                                {mission.description}
                                            </p>

                                            {/* Meta Tags */}
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                                                <div className="flex items-center gap-1 text-primary">
                                                    <Coins className="w-3 h-3" />
                                                    <span>+{mission.coins}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{mission.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Icon */}
                                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredMissions.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Nenhuma missão encontrada para este tempo.</p>
                        <Button variant="link" onClick={() => setActiveFilter("Todos")}>
                            Ver todas
                        </Button>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
