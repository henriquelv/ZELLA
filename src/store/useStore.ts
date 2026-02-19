import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useState, useEffect } from 'react'

interface UserState {
    hasOnboarded: boolean
    currentStep: number // 1 to 6
    xp: number
    coins: number
    streak: number
    name: string

    // Actions
    completeOnboarding: (step: number, name: string) => void
    addXp: (amount: number) => void
    addCoins: (amount: number) => void
    incrementStreak: () => void
    resetProgress: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            hasOnboarded: false,
            currentStep: 1,
            xp: 0,
            coins: 0,
            streak: 0,
            name: "",

            completeOnboarding: (step, name) => set({ hasOnboarded: true, currentStep: step, name }),
            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
            addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
            resetProgress: () => set({ hasOnboarded: false, currentStep: 1, xp: 0, coins: 0, streak: 0, name: "" }),
        }),
        {
            name: 'zella-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

// Helper hook to solve hydration mismatch in Next.js with persist
export function useUserStoreHydrated<T>(selector: (state: UserState) => T): T | null {
    const result = useUserStore(selector)
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    return hydrated ? result : null
}
