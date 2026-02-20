"use client";

import { SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Trophy,
    Users,
    Search,
    UserPlus,
    Medal,
    Crown,
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "@/lib/utils";
import { useUserStoreHydrated } from "@/store/useStore";
import { AvatarSelector, AVATARS } from "@/components/ui/avatar-selector";
import { PageLoader } from "@/components/ui/page-loader";

// --- Types ---
interface SocialUser {
    id: string;
    name: string;
    xp: number;
    avatarId: string;
    isFriend: boolean;
    rank: number;
}

// --- Mock Data ---
const MOCK_USERS: SocialUser[] = [
    { id: "1", name: "Ana Clara", xp: 12500, avatarId: "alien", isFriend: true, rank: 1 },
    { id: "2", name: "João Pedro", xp: 11200, avatarId: "robot", isFriend: false, rank: 2 },
    { id: "3", name: "Mariana Silva", xp: 9800, avatarId: "lion", isFriend: true, rank: 3 },
    { id: "4", name: "Carlos Eduardo", xp: 8500, avatarId: "dog", isFriend: false, rank: 4 },
    { id: "5", name: "Fernanda Lima", xp: 7200, avatarId: "default", isFriend: true, rank: 5 },
];

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export default function SocialPage() {
    const router = useRouter();
    const currentUser = useUserStoreHydrated((state) => state);
    const [activeTab, setActiveTab] = useState<"ranking" | "friends">("ranking");
    const [searchQuery, setSearchQuery] = useState("");
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);

    if (!currentUser) {
        return <PageLoader message="Preparando ranking..." />;
    }

    // Merge current user into mock ranking for display
    const rankingList = [
        ...MOCK_USERS,
        {
            id: "me",
            name: currentUser.name || "Você",
            xp: currentUser.xp || 0,
            avatarId: currentUser.activeAvatar || "default",
            isFriend: false,
            rank: 99, // dynamic rank would be calculated in real app
        },
    ]
        .sort((a, b) => b.xp - a.xp)
        .map((u, i) => ({ ...u, rank: i + 1 }));

    const filteredList = rankingList.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-purple-500/10 via-background to-background -z-10 pointer-events-none" />

            {/* Header */}
            <header className="px-6 pt-12 pb-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">Social</h1>
                        <p className="text-sm text-muted-foreground">Comunidade Zella</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-muted/50 rounded-2xl p-1 grid grid-cols-2 gap-1 border border-white/5">
                    <button
                        onClick={() => setActiveTab("ranking")}
                        className={cn(
                            "py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            activeTab === "ranking"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <Trophy className="w-4 h-4" />
                        Ranking
                    </button>
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={cn(
                            "py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            activeTab === "friends"
                                ? "bg-background shadow-sm text-primary"
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Amigos
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuários..."
                        className="pl-9 bg-card/50 border-white/10 rounded-xl h-11"
                        value={searchQuery}
                        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <main className="px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {filteredList.map((user) => {
                            const isMe = user.id === "me";
                            const isTop3 = user.rank <= 3;

                            return (
                                <motion.div
                                    key={user.id}
                                    variants={staggerItem}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
                                        isMe
                                            ? "bg-primary/10 border-primary/30"
                                            : "bg-card border-border"
                                    )}
                                >
                                    {/* Rank Badge */}
                                    <div className="w-8 flex justify-center shrink-0">
                                        {user.rank === 1 ? (
                                            <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
                                        ) : user.rank === 2 ? (
                                            <Medal className="w-6 h-6 text-slate-300" />
                                        ) : user.rank === 3 ? (
                                            <Medal className="w-6 h-6 text-amber-600" />
                                        ) : (
                                            <span className="text-sm font-bold text-muted-foreground">
                                                #{user.rank}
                                            </span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div
                                        onClick={() => isMe && setAvatarModalOpen(true)}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg transition-all",
                                            AVATARS.find(a => a.id === user.avatarId)?.color || "bg-primary",
                                            isMe && "cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        )}>
                                        {AVATARS.find(a => a.id === user.avatarId)?.icon || "👤"}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-bold truncate", isMe && "text-primary")}>
                                            {user.name} {isMe && "(Você)"}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            {user.xp.toLocaleString()} XP
                                        </p>
                                    </div>

                                    {/* Action */}
                                    {!isMe && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </main>

            <AvatarSelector isOpen={isAvatarModalOpen} onClose={() => setAvatarModalOpen(false)} />
        </div>
    );
}
