"use client";

import { useState, useEffect } from "react";
import { ZellaLogo } from "./logo";
import { Bell, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { useUserStoreHydrated, useUserStore } from "@/store/useStore";
import { AvatarSelector, AVATARS } from "./avatar-selector";
import { cn } from "@/lib/utils";

export function AppHeader() {
    const user = useUserStoreHydrated(s => s);
    const loadUserData = useUserStore(s => s.loadUserData);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const activeAvatarRecord = AVATARS.find(a => a.id === user?.activeAvatar) || AVATARS[0];

    return (
        <header className="px-5 pt-14 pb-4 flex justify-between items-center sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-black/[0.04]">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsAvatarOpen(true)}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-105 active:scale-95 outline-none p-[2.5px] bg-gradient-to-br from-[#2563eb] to-[#16a34a] shadow-md"
                >
                    <div className={cn("w-full h-full rounded-full flex items-center justify-center bg-white", activeAvatarRecord.color)}>
                        {activeAvatarRecord.icon}
                    </div>
                </button>
                <Link href="/profile" className="flex flex-col hover:opacity-80 transition-opacity">
                    <span className="font-heading font-bold text-[17px] leading-tight tracking-tight text-gray-900">
                        Olá, {user?.name?.split(" ")[0] || 'Explorer'}
                    </span>
                    <span className="text-[11px] text-[#2563eb] font-bold">Ver Perfil Completo</span>
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-black/[0.06] px-3.5 py-2 rounded-full shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span className="text-[12px] font-bold text-gray-700">{user?.xp || 0} XP</span>
                </div>
                <Button variant="ghost" size="icon" asChild className="rounded-full w-10 h-10 bg-white/70 backdrop-blur-sm border border-black/[0.06] shadow-sm hover:bg-white/90 active:scale-90 transition-all">
                    <Link href="/inbox">
                        <Bell className="w-[18px] h-[18px] text-gray-500" />
                    </Link>
                </Button>
            </div>

            <AvatarSelector isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
        </header>
    );
}
