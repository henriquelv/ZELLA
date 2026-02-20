import { ZellaLogo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

export function AppHeader() {
    return (
        <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border/50">
            <div className="flex items-center gap-3">
                <ZellaLogo size="sm" />
                <span className="font-heading font-bold text-lg tracking-tight">Zella</span>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/inbox">
                        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Link>
                </Button>
                <ThemeToggle />
            </div>
        </header>
    );
}
