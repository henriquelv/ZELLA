import * as React from "react"


import { cn } from "@/lib/utils"

// Needs @radix-ui/react-progress, but we can build a simple one without it to save an install if we want,
// but for quality, using atomic CSS is fine. Let's build a simple custom one to avoid extra Radix install for now if we can,
// but Radix is standard. Let's try to simulate Radix API but with simple div for speed/less deps, 
// OR just install radix-progress. 
// User wants speed. Let's use a simple div implementation that looks great.

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number, indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative h-4 w-full overflow-hidden rounded-full bg-secondary/20",
            className
        )}
        {...props}
    >
        <div
            className={cn("h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out", indicatorClassName)}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
