"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, User, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Home", icon: Home },
        { href: "/journey", label: "Jornada", icon: Map },
        { href: "/missions", label: "Missões", icon: Trophy },
        { href: "/profile", label: "Perfil", icon: User },
    ];

    // Don't show on onboarding or login
    if (pathname === "/" || pathname.startsWith("/onboarding")) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md pb-safe-area">
            <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
