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
        <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2">
            <nav className="bg-white border-2 border-b-4 border-gray-200 rounded-2xl flex justify-around items-center h-[76px] px-2 shadow-lg relative">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 min-w-[54px] h-[64px] rounded-xl transition-all relative",
                                isActive
                                    ? "bg-[#2563eb] text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)] border-2 border-[#1e3a8a] -translate-y-2 z-10"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95"
                            )}
                        >
                            {isActive && (
                                <div className="absolute -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-[#1e3a8a] border-r-8 border-r-transparent"></div>
                            )}

                            <Icon 
                                className={cn(
                                    "transition-all", 
                                    isActive ? "w-6 h-6 mb-0.5 drop-shadow-md" : "w-6 h-6"
                                )} 
                                strokeWidth={isActive ? 2.5 : 2} 
                            />
                            
                            <span className={cn(
                                "text-[10px] leading-none uppercase tracking-wider font-heading",
                                isActive ? "font-black drop-shadow-md" : "font-bold"
                            )}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
