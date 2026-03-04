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
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
            <nav className="bg-white/80 backdrop-blur-xl border-t border-black/[0.06] flex justify-around items-center h-[72px] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[56px] py-2 transition-colors",
                                isActive
                                    ? "text-[#2563eb]"
                                    : "text-gray-400 active:text-gray-600"
                            )}
                        >
                            {isActive ? (
                                <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
                                    <Icon className="h-[20px] w-[20px]" strokeWidth={2.2} />
                                </div>
                            ) : (
                                <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
                            )}
                            <span className={cn(
                                "text-[10px] font-semibold leading-none",
                                isActive && "font-bold"
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
