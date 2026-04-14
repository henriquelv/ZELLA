"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Map, Target, Gamepad2, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Início", icon: Home },
        { href: "/finances", label: "Finanças", icon: Wallet },
        { href: "/journey", label: "Trilha", icon: Map },
        { href: "/missions", label: "Missões", icon: Target },
        { href: "/games", label: "Games", icon: Gamepad2 },
        { href: "/store", label: "Loja", icon: ShoppingBag },
        { href: "/profile", label: "Perfil", icon: User },
    ];

    if (pathname === "/" || pathname?.startsWith("/onboarding")) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-3">
            <nav className="bg-white/95 border border-white/40 ring-1 ring-black/[0.03] rounded-[1.75rem] flex justify-between items-center h-[64px] px-1.5 shadow-2xl shadow-blue-900/10">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 h-[54px] rounded-[1.25rem] transition-all relative overflow-hidden group px-0.5",
                                isActive
                                    ? "text-blue-600"
                                    : "text-gray-400 hover:text-gray-600 active:scale-95"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-blue-50/80 rounded-[1.25rem] -z-10" />
                            )}

                            <Icon
                                className={cn(
                                    "transition-all duration-300",
                                    isActive ? "w-[22px] h-[22px]" : "w-[20px] h-[20px] group-hover:scale-110"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />

                            <span className={cn(
                                "text-[9px] leading-none transition-all duration-300 truncate max-w-full",
                                isActive ? "font-black" : "font-semibold opacity-70"
                            )}>
                                {label}
                            </span>

                            {isActive && (
                                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-600 shadow-sm" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
