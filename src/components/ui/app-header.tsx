"use client";

import { useState } from "react";
import { ZellaLogo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Bell, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { useUserStoreHydrated } from "@/store/useStore";
import { AvatarSelector, AVATARS } from "./avatar-selector";
import { cn } from "@/lib/utils";

export function AppHeader() {
    const user = useUserStoreHydrated(s => s);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);

    const activeAvatarRecord = AVATARS.find(a => a.id === user?.activeAvatar) || AVATARS[0];

    return (
        <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsAvatarOpen(true)}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform hover:scale-105 active:scale-95 outline-none border border-border/50 ring-2 ring-primary/20",
                        activeAvatarRecord.color
                    )}
                >
                    {activeAvatarRecord.icon}
                </button>
                <div className="flex flex-col">
                    <span className="font-heading font-bold text-sm leading-tight tracking-tight">Zella</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user?.name || 'Explorer'}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1 bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs font-bold">{user?.xp || 0}</span>
                </div>
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/inbox">
                        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Link>
                </Button>
                <ThemeToggle />
            </div>

            <AvatarSelector isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
        </header>
    );
}
