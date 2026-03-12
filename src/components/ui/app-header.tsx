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
        <header className="px-5 pt-14 pb-4 flex justify-between items-center sticky top-0 z-40 bg-transparent">
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                    <ZellaLogo size="sm" showText={true} />
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-yellow-400 border-2 border-b-4 border-yellow-600 px-3 py-1.5 rounded-xl shadow-inner">
                    <Trophy className="w-4 h-4 text-yellow-900 drop-shadow-sm" />
                    <span className="text-[14px] font-black text-yellow-900 drop-shadow-sm">{user?.xp || 0} XP</span>
                </div>
                <button
                    onClick={() => setIsAvatarOpen(true)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-95 active:translate-y-[2px] active:border-b-2 outline-none p-0.5 bg-white border-2 border-b-4 border-gray-300 shadow-sm ml-1 overflow-hidden"
                >
                    <div className={cn("w-full h-full rounded-lg flex items-center justify-center bg-gray-100", activeAvatarRecord.color)}>
                        {activeAvatarRecord.icon}
                    </div>
                </button>
            </div>

            <AvatarSelector isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
        </header>
    );
}
