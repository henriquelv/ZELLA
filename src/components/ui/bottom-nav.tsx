"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, GamepadIcon, Target, Wallet, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/finances", label: "Controle", icon: Wallet },
        { href: "/missions", label: "Missões", icon: GamepadIcon },
        { href: "/metas", label: "Metas", icon: Target },
        { href: "/shop", label: "Loja", icon: ShoppingBag },
    ];

    // Don't show on onboarding or login
    if (pathname === "/" || pathname?.startsWith("/onboarding")) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/90 backdrop-blur-lg pb-safe-area z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
            <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-95 group",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <span className="absolute -top-0.5 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary),0.5)]" />
                            )}
                            <Icon
                                className={cn(
                                    "h-6 w-6 transition-all duration-200",
                                    isActive ? "fill-primary/20 scale-110" : "group-hover:scale-105"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={cn("text-[10px] font-medium transition-colors", isActive && "font-bold")}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
