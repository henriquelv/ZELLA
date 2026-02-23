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
    isAiGenerated?: boolean
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
                set((state) => {
                    const newTransactions = [t, ...state.transactions];
                    let xpGained = 0;
                    let updatedGoals = [...state.goals];

                    // --- Auto-Completion / Goal Tracking Logic ---
                    if (t.type === 'expense') {
                        // Check if this expense violates an active spending goal
                        updatedGoals = updatedGoals.map(goal => {
                            if (!goal.completed && goal.category === 'spending' && goal.title.includes(t.category)) {
                                // Simple logic: if they spend on a category they had a goal to avoid, they fail it.
                                // In a more complex app, we'd check if `t.amount` exceeds a threshold or if it's past the 7 days.
                                // For now, let's mark it completed but with 0 XP reward to show failure, or just keep it open but notify.
                                // Let's mark it as 'failed' by completing it but granting 0 XP. 
                                // Alternatively, we just don't grant XP here.
                                // Actually, let's just make it a visual thing for now, or reduce XP.
                                // To keep it simple: If they spend on that category, the goal is marked complete (failed) so it stops tracking.
                                return { ...goal, completed: true, xpReward: 0, title: goal.title + " (Falhou⚠️)" };
                            }
                            return goal;
                        });
                    }

                    // For incomes or other types, maybe auto-complete saving goals
                    if (t.type === 'income') {
                        updatedGoals = updatedGoals.map(goal => {
                            if (!goal.completed && goal.category === 'saving') {
                                xpGained += goal.xpReward;
                                return { ...goal, completed: true };
                            }
                            return goal;
                        });
                    }

                    const newXp = state.xp + xpGained;

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
                                name: t.category,
                                is_ai_generated: t.isAiGenerated || false
                            }).then();

                            if (xpGained > 0 || updatedGoals !== state.goals) {
                                supabase.from('profiles').update({
                                    xp: newXp,
                                    goals: updatedGoals
                                }).eq('id', data.session.user.id);
                            }
                        }
                    });

                    return {
                        transactions: newTransactions,
                        goals: updatedGoals,
                        xp: newXp
                    };
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


// ─────────────────────────────────────────────────────────────────────────────
// Hook de hidratação correto usando a API oficial do Zustand persist.
// Retorna o estado IMEDIATAMENTE — nunca retorna null.
// Páginas podem usar `user.hasOnboarded` sem qualquer PageLoader por hidratação.
// ─────────────────────────────────────────────────────────────────────────────
export function useUserStoreHydrated<T>(selector: (state: UserState) => T): T {
    return useUserStore(selector);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook para verificar se o store já foi hidratado do localStorage.
// Use isso APENAS quando você precisa de um guard antes de renderizar dados.
// ─────────────────────────────────────────────────────────────────────────────
export function useIsHydrated(): boolean {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => { setHydrated(true); }, []);
    return hydrated;
}

// Global Supabase Auto-Sync 
// Listens to Zustand changes and debounces an update to Supabase
if (typeof window !== 'undefined') {
    let syncTimeout: NodeJS.Timeout | null = null;
    let isInitialSync = true; // Prevent syncing back initial hydration

    useUserStore.subscribe((state, prevState) => {
        if (isInitialSync) {
            isInitialSync = false;
            return;
        }

        const fieldsChanged =
            state.xp !== prevState.xp ||
            state.coins !== prevState.coins ||
            state.streak !== prevState.streak ||
            state.transactions.length !== prevState.transactions.length ||
            state.goals.length !== prevState.goals.length ||
            state.dailyQuizCompletedAt !== prevState.dailyQuizCompletedAt ||
            state.activeAvatar !== prevState.activeAvatar ||
            state.unlockedAvatars.length !== prevState.unlockedAvatars.length;

        if (fieldsChanged) {
            if (syncTimeout) clearTimeout(syncTimeout);
            syncTimeout = setTimeout(async () => {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    const userId = data.session.user.id;
                    await supabase.from('profiles').update({
                        xp: state.xp,
                        coins: state.coins,
                        streak: state.streak,
                        transactions: state.transactions,
                        goals: state.goals,
                        daily_quiz_completed_at: state.dailyQuizCompletedAt,
                        active_avatar: state.activeAvatar,
                        unlocked_avatars: state.unlockedAvatars
                    }).eq('id', userId);
                }
            }, 1500); // Debounce to prevent spamming the database
        }
    });
}
