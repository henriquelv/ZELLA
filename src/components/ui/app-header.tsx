"use client";

import { useState, useEffect, useRef } from "react";
import { ZellaLogo } from "./logo";
import { Bell, Trophy, ChevronDown, ShieldAlert, CheckCircle2, Waves, Compass, Crown, Gem } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { AvatarSelector, AVATARS } from "./avatar-selector";
import { cn } from "@/lib/utils";

const DEGRAUS = [
    { level: 1, name: "Sobrevivente", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
    { level: 2, name: "Organizando", icon: Compass, color: "text-orange-500", bg: "bg-orange-50" },
    { level: 3, name: "Controlador", icon: Waves, color: "text-blue-500", bg: "bg-blue-50" },
    { level: 4, name: "Construtor", icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-50" },
    { level: 5, name: "Estrategista", icon: Crown, color: "text-amber-500", bg: "bg-amber-50" },
    { level: 6, name: "Mestre", icon: Gem, color: "text-emerald-500", bg: "bg-emerald-50" },
];

export function AppHeader() {
    const user = useUserStoreHydrated(s => s);
    const loadUserData = useUserStore(s => s.loadUserData);
    const setCurrentStep = useUserStore(s => s.setCurrentStep);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
    
    // Close dropdown on click outside
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLevelSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const activeAvatarRecord = AVATARS.find(a => a.id === user?.activeAvatar) || AVATARS[0];
    const currentDegrau = DEGRAUS.find(d => d.level === (user?.currentStep || 1)) || DEGRAUS[0];

    return (
        <header className="px-5 pt-14 pb-4 flex justify-between items-center sticky top-0 z-40 bg-transparent">
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                    <ZellaLogo size="sm" showText={false} />
                </Link>

                {/* Level Selector Dropdown */}
                <button 
                    onClick={() => setIsLevelSelectorOpen(!isLevelSelectorOpen)}
                    className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 ring-1 ring-black/[0.03] px-3 py-1.5 rounded-2xl shadow-sm hover:bg-white/80 transition-all active:scale-95"
                >
                    <currentDegrau.icon className={cn("w-4 h-4 drop-shadow-sm", currentDegrau.color)} />
                    <span className="text-[13px] font-black text-gray-800 drop-shadow-sm truncate max-w-[90px]">
                        {currentDegrau.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500 opacity-70" />
                </button>

                {isLevelSelectorOpen && (
                    <div className="absolute top-[120%] left-0 w-48 bg-white/90 backdrop-blur-xl border border-white/50 ring-1 ring-black/[0.05] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 origin-top-left animate-in fade-in zoom-in-95 duration-200">
                        {DEGRAUS.map((degrau) => (
                            <button
                                key={degrau.level}
                                onClick={() => {
                                    setCurrentStep(degrau.level);
                                    setIsLevelSelectorOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all",
                                    user?.currentStep === degrau.level ? "bg-gray-50/80 ring-1 ring-black/[0.02]" : ""
                                )}
                            >
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shadow-sm", degrau.bg)}>
                                    <degrau.icon className={cn("w-4 h-4", degrau.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-gray-800 leading-tight">Arena {degrau.level}</span>
                                    <span className="text-[10px] text-gray-500 font-medium leading-none">{degrau.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-white/40 ring-1 ring-black/[0.03] px-3 py-1.5 rounded-2xl shadow-sm">
                    <Trophy className="w-4 h-4 text-orange-500 drop-shadow-sm" />
                    <span className="text-[14px] font-black text-gray-800 drop-shadow-sm">{user?.xp || 0} <span className="text-[10px] text-gray-400 font-bold uppercase">XP</span></span>
                </div>
                <button
                    onClick={() => setIsAvatarOpen(true)}
                    className="w-11 h-11 rounded-[1rem] flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-95 outline-none p-0.5 bg-white/80 backdrop-blur-md border border-white/50 ring-1 ring-black/[0.03] shadow-sm ml-1 overflow-hidden"
                >
                    <div className={cn("w-full h-full rounded-[0.75rem] flex items-center justify-center bg-gray-50", activeAvatarRecord.color)}>
                        {activeAvatarRecord.icon}
                    </div>
                </button>
            </div>

            <AvatarSelector isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
        </header>
    );
}
