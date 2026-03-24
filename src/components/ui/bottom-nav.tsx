"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, GamepadIcon, Users, User, MapIcon, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/journey", label: "Trilha", icon: MapIcon },
        { href: "/finances", label: "Base", icon: Wallet },
        { href: "/games", label: "Jogos", icon: GamepadIcon },
        { href: "/missions", label: "Missões", icon: Target },
        { href: "/profile", label: "Perfil", icon: User },
    ];

    // Don't show on onboarding or splash
    if (pathname === "/" || pathname?.startsWith("/onboarding")) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
            <nav className="bg-white/90 backdrop-blur-lg border border-white/40 ring-1 ring-black/[0.03] rounded-[2rem] flex justify-around items-center h-[72px] px-2 shadow-2xl shadow-blue-900/10">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[60px] h-[60px] rounded-[1.5rem] transition-all relative overflow-hidden group",
                                isActive
                                    ? "text-blue-600"
                                    : "text-gray-400 hover:text-gray-600 active:scale-95"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-blue-50/80 rounded-[1.5rem] -z-10" />
                            )}

                            <Icon 
                                className={cn(
                                    "transition-all duration-300", 
                                    isActive ? "w-[26px] h-[26px] drop-shadow-sm mb-0.5" : "w-6 h-6 group-hover:scale-110"
                                )} 
                                strokeWidth={isActive ? 2.5 : 2} 
                            />
                            
                            <span className={cn(
                                "text-[10px] leading-none uppercase tracking-wider transition-all duration-300",
                                isActive ? "font-black" : "font-bold opacity-80"
                            )}>
                                {label}
                            </span>
                            
                            {/* Active Dot Indicator */}
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 shadow-sm" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
