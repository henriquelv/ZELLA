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
    id: string | null

    // Gamification
    lastLoginDate: string | null
    unlockedAvatars: string[]
    activeAvatar: string
    dailyQuizCompletedAt: string | null

    transactions: Transaction[]
    missions: Mission[]
    userMissions: UserMissionCompletion[]

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
    loadUserData: () => Promise<void>
    syncWithSupabase: (data: Partial<UserState>) => void
    saveMissionCompletion: (missionId: string, score: number, xpReward: number, coinsReward: number) => Promise<void>
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

export interface Mission {
    id: string
    title: string
    subtitle: string
    xp_reward: number
    coins_reward: number
    category: string
    icon: string
}

export interface UserMissionCompletion {
    mission_id: string
    completed_at: string
    score: number
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
            id: null,

            lastLoginDate: null,
            unlockedAvatars: ['default'],
            activeAvatar: 'default',
            dailyQuizCompletedAt: null,

            transactions: [],
            goals: [],
            missions: [],
            userMissions: [],

            completeOnboarding: (step, name) => set({ hasOnboarded: true, currentStep: step, name }),
            addXp: (amount) => {
                set((state) => {
                    const newXp = state.xp + amount;
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

                    if (t.type === 'expense') {
                        updatedGoals = updatedGoals.map(goal => {
                            if (!goal.completed && goal.category === 'spending' && goal.title.includes(t.category)) {
                                return { ...goal, completed: true, xpReward: 0, title: goal.title + " (Falhou⚠️)" };
                            }
                            return goal;
                        });
                    }

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

                    // Manual push for transaction table (profiles.transactions is now gone)
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
                transactions: [], goals: [], lastLoginDate: null, unlockedAvatars: ['default'], activeAvatar: 'default', dailyQuizCompletedAt: null,
                missions: [], userMissions: []
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
            syncWithSupabase: (data) => set((state) => ({ ...state, ...data })),

            loadUserData: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const userId = session.user.id;

                // 1. Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (profile) {
                    const typedProfile = profile as any;
                    set({
                        id: typedProfile.id || null,
                        name: typedProfile.name || get().name,
                        xp: typedProfile.xp ?? get().xp,
                        coins: typedProfile.coins ?? get().coins,
                        streak: typedProfile.streak ?? get().streak,
                        currentStep: typedProfile.current_step ?? get().currentStep,
                        activeAvatar: typedProfile.active_avatar || get().activeAvatar,
                        unlockedAvatars: typedProfile.unlocked_avatars || get().unlockedAvatars,
                        goals: typedProfile.goals || get().goals,
                        dailyQuizCompletedAt: typedProfile.daily_quiz_completed_at,
                        hasOnboarded: typedProfile.name ? true : get().hasOnboarded
                    });
                }

                // 2. Fetch Transactions
                const { data: txs } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date', { ascending: false });

                if (txs) {
                    set({
                        transactions: txs.map(t => ({
                            id: t.id,
                            amount: Number(t.amount),
                            category: t.category,
                            type: t.type,
                            date: t.date,
                            isAiGenerated: t.is_ai_generated
                        }))
                    });
                }

                // 3. Fetch Missions & completions
                const { data: missions } = await supabase.from('missions').select('*');
                const { data: userCompletions } = await supabase
                    .from('user_missions')
                    .select('*')
                    .eq('user_id', userId);

                if (missions) set({ missions });
                if (userCompletions) {
                    set({
                        userMissions: userCompletions.map(c => ({
                            mission_id: c.mission_id,
                            completed_at: c.completed_at,
                            score: c.score
                        }))
                    });
                }
            },

            saveMissionCompletion: async (missionId, score, xpReward, coinsReward) => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const userId = session.user.id;

                // Update Local State
                set(state => ({
                    xp: state.xp + xpReward,
                    coins: state.coins + coinsReward,
                    userMissions: [
                        ...state.userMissions.filter(m => m.mission_id !== missionId),
                        { mission_id: missionId, completed_at: new Date().toISOString(), score }
                    ]
                }));

                // Update Remote Data
                await supabase.from('user_missions').upsert({
                    user_id: userId,
                    mission_id: missionId,
                    score,
                    completed_at: new Date().toISOString()
                });

                // Profile sync will happen automatically via useUserStore.subscribe below
            }
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

                    // Logic for auto-advancing steps based on balance
                    const expenses = state.transactions.filter(t => t.type === 'expense');
                    const incomes = state.transactions.filter(t => t.type === 'income');
                    const totalExp = expenses.reduce((a, b) => a + Number(b.amount), 0);
                    const totalInc = incomes.reduce((a, b) => a + Number(b.amount), 0);
                    const balance = totalInc - totalExp;

                    let calculatedStep = 1;
                    if (balance > 10000) calculatedStep = 6;
                    else if (expenses.some(t => t.category.toLowerCase().includes('invest'))) calculatedStep = 5;
                    else if (balance > 3000) calculatedStep = 4;
                    else if (balance > 500) calculatedStep = 3;
                    else if (balance > 0) calculatedStep = 2;

                    // If manually set higher in onboarding, don't downgrade
                    const finalStep = Math.max(state.currentStep, calculatedStep);

                    await supabase.from('profiles').update({
                        xp: state.xp,
                        coins: state.coins,
                        streak: state.streak,
                        goals: state.goals,
                        daily_quiz_completed_at: state.dailyQuizCompletedAt,
                        active_avatar: state.activeAvatar,
                        unlocked_avatars: state.unlockedAvatars,
                        current_step: finalStep,
                    }).eq('id', userId);

                    if (finalStep !== state.currentStep) {
                        useUserStore.setState({ currentStep: finalStep });
                    }
                }
            }, 1500); // Debounce to prevent spamming the database
        }
    });
}
