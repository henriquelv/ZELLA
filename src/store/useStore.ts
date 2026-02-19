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

    transactions: Transaction[]

    // Actions
    completeOnboarding: (step: number, name: string) => void
    addXp: (amount: number) => void
    addCoins: (amount: number) => void
    incrementStreak: () => void
    addTransaction: (transaction: Transaction) => void
    resetProgress: () => void
}

export interface Transaction {
    id: string
    amount: number
    category: string
    type: 'expense' | 'income'
    date: string
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
            transactions: [],

            completeOnboarding: (step, name) => set({ hasOnboarded: true, currentStep: step, name }),
            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
            addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
            addTransaction: (t) => set((state) => ({ transactions: [t, ...state.transactions] })),
            resetProgress: () => set({ hasOnboarded: false, currentStep: 1, xp: 0, coins: 0, streak: 0, name: "", transactions: [] }),
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
