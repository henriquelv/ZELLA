import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { supabase } from '@/lib/supabase'

interface UserState {
    hasOnboarded: boolean
    currentStep: number // 1 to n
    xp: number
    coins: number
    streak: number
    name: string

    // Gamification
    lastLoginDate: string | null
    unlockedAvatars: string[]
    activeAvatar: string
    dailyQuizCompletedAt: string | null

    transactions: Transaction[]

    // Actions
    completeOnboarding: (step: number, name: string) => void
    addXp: (amount: number) => void
    addCoins: (amount: number) => void
    incrementStreak: () => void
    addTransaction: (transaction: Transaction) => void
    resetProgress: () => void

    // Gamification Actions
    checkAndApplyStreak: () => void
    setActiveAvatar: (avatarId: string) => void
    unlockAvatar: (avatarId: string, cost: number) => boolean
    completeDailyQuiz: (xpReward: number) => void

    // Goals / Metas
    goals: Goal[]
    addGoal: (goal: Goal) => void
    toggleGoal: (id: string) => void

    // Supabase Sync
    syncWithSupabase: (data: Partial<UserState>) => void
}

export interface Transaction {
    id: string
    amount: number
    category: string
    type: 'expense' | 'income'
    date: string
}

export interface Goal {
    id: string
    title: string
    description: string
    category: 'saving' | 'spending' | 'investing' | 'habit'
    createdAt: string
    completed: boolean
    xpReward: number
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            hasOnboarded: false,
            currentStep: 1,
            xp: 0,
            coins: 0,
            streak: 0,
            name: "",

            lastLoginDate: null,
            unlockedAvatars: ['default'],
            activeAvatar: 'default',
            dailyQuizCompletedAt: null,

            transactions: [],
            goals: [],

            completeOnboarding: (step, name) => set({ hasOnboarded: true, currentStep: step, name }),
            addXp: (amount) => {
                set((state) => {
                    const newXp = state.xp + amount;
                    // Background sync
                    supabase.auth.getSession().then(({ data }) => {
                        if (data.session) {
                            supabase.from('profiles').update({ xp: newXp }).eq('id', data.session.user.id);
                        }
                    });
                    return { xp: newXp };
                });
            },
            addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
            addTransaction: (t) => {
                set((state) => ({ transactions: [t, ...state.transactions] }));
                // Background sync
                supabase.auth.getSession().then(({ data }) => {
                    if (data.session) {
                        supabase.from('transactions').insert({
                            id: t.id,
                            user_id: data.session.user.id,
                            amount: t.amount,
                            category: t.category,
                            type: t.type,
                            date: t.date,
                            name: t.category // Basic fallback
                        }).then();
                    }
                });
            },
            resetProgress: () => set({
                hasOnboarded: false, currentStep: 1, xp: 0, coins: 0, streak: 0, name: "",
                transactions: [], goals: [], lastLoginDate: null, unlockedAvatars: ['default'], activeAvatar: 'default', dailyQuizCompletedAt: null
            }),

            checkAndApplyStreak: () => {
                const today = format(new Date(), 'yyyy-MM-dd');
                const lastLogin = get().lastLoginDate;

                if (!lastLogin) {
                    set({ lastLoginDate: today, streak: 1 });
                    return;
                }

                if (lastLogin !== today) {
                    const daysDiff = differenceInDays(new Date(today), new Date(lastLogin));
                    if (daysDiff === 1) {
                        set({ lastLoginDate: today, streak: get().streak + 1 });
                    } else if (daysDiff > 1) {
                        // Lost streak
                        set({ lastLoginDate: today, streak: 1 });
                    }
                }
            },
            setActiveAvatar: (avatarId) => set({ activeAvatar: avatarId }),
            unlockAvatar: (avatarId, cost) => {
                const state = get();
                if (state.xp >= cost && !state.unlockedAvatars.includes(avatarId)) {
                    set({
                        xp: state.xp - cost,
                        unlockedAvatars: [...state.unlockedAvatars, avatarId]
                    });
                    return true;
                }
                return false;
            },
            completeDailyQuiz: (xpReward) => {
                const today = format(new Date(), 'yyyy-MM-dd');
                set((state) => ({
                    dailyQuizCompletedAt: today,
                    xp: state.xp + xpReward
                }));
            },
            addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
            toggleGoal: (id) => set((state) => ({
                goals: state.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
            })),
            syncWithSupabase: (data) => set((state) => ({ ...state, ...data }))
        }),
        {
            name: 'zella-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

// To preserve instant load while waiting for hydration, we can return the unhydrated initial state first.
// However, since persist causes a hydration error if UI differs, we handle Skeleton/Loading states inside the component.
export function useUserStoreHydrated<T>(selector: (state: UserState) => T): T | null {
    const result = useUserStore(selector)
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setHydrated(true)
    }, [])

    return hydrated ? result : null
}
