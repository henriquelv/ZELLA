import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { supabase } from '@/lib/supabase'

export interface UserState {
    hasOnboarded: boolean
    currentStep: number // Corresponde ao "Degrau" (1 a 6)
    level: number
    xp: number
    coins: number
    streak: number
    name: string
    id: string | null

    // Métricas Financeiras (v2)
    revenue: number
    fixedCosts: number
    totalBalance: number

    // Índices (calculados)
    ie: number // Índice de Eficiência
    is: number // Índice de Sobrevivência
    idMetric: number // Índice de Drenos (evitando conflito com id)
    rs: number // Reserva de Segurança (meses)

    // Gamification
    lastLoginDate: string | null
    unlockedAvatars: string[]
    activeAvatar: string
    dailyQuizCompletedAt: string | null
    dailyCoinsEarned: number // Reset diário para capping

    transactions: Transaction[]
    missions: Mission[]
    userMissions: UserMissionCompletion[]

    // Actions
    completeOnboarding: (step: number, name: string, initialRevenue?: number) => void
    addXp: (amount: number) => void
    addCoins: (amount: number) => void
    incrementStreak: () => void
    addTransaction: (transaction: Transaction) => void
    setFinancialData: (revenue: number, fixedCosts: number) => void
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

    calculateMetricsFromTransactions: () => void
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
    missionId: string
    completedAt: string
    score: number
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            hasOnboarded: false as boolean,
            currentStep: 1,
            level: 1,
            xp: 0,
            coins: 0,
            streak: 0,
            name: "",
            id: null,

            revenue: 0,
            fixedCosts: 0,
            totalBalance: 0,
            ie: 0,
            is: 0,
            idMetric: 0,
            rs: 0,

            lastLoginDate: null,
            unlockedAvatars: ['default'],
            activeAvatar: 'default',
            dailyQuizCompletedAt: null,
            dailyCoinsEarned: 0,

            transactions: [],
            goals: [],
            missions: [],
            userMissions: [],

            completeOnboarding: (step: number, name: string, initialRevenue?: number) =>
                set({ hasOnboarded: true, currentStep: step, name, revenue: initialRevenue || 0 }),

            addXp: (amount: number) => {
                set((state: UserState) => {
                    const newXp = state.xp + amount;
                    // xp(n) = 100 * (n^1.2)
                    let currentLevel = state.level;
                    let xpNeeded = Math.floor(100 * Math.pow(currentLevel, 1.2));

                    let tempXp = newXp;
                    let tempLevel = currentLevel;

                    while (tempXp >= xpNeeded && tempLevel < 100) {
                        tempXp -= xpNeeded;
                        tempLevel++;
                        xpNeeded = Math.floor(100 * Math.pow(tempLevel, 1.2));
                    }

                    return { xp: tempXp, level: tempLevel };
                });
            },
            addCoins: (amount: number) => set((state: UserState) => {
                const canEarn = Math.max(0, 50 - state.dailyCoinsEarned);
                const actualGain = Math.min(amount, canEarn);
                return {
                    coins: state.coins + actualGain,
                    dailyCoinsEarned: state.dailyCoinsEarned + actualGain
                };
            }),
            incrementStreak: () => set((state: UserState) => ({ streak: state.streak + 1 })),
            setFinancialData: (revenue: number, fixedCosts: number) => set({ revenue, fixedCosts }),
            addTransaction: (t: Transaction) => {
                set((state: UserState) => {
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
                    (async () => {
                        const { data } = await supabase.auth.getSession();
                        if (data.session) {
                            await supabase.from('transactions').insert({
                                id: t.id,
                                user_id: data.session.user.id,
                                amount: t.amount,
                                category: t.category,
                                type: t.type,
                                date: t.date,
                                name: t.category,
                                is_ai_generated: t.isAiGenerated || false
                            });
                        }
                    })();

                    return {
                        transactions: newTransactions,
                        goals: updatedGoals,
                        xp: newXp
                    };
                });
                get().calculateMetricsFromTransactions();
            },
            resetProgress: () => set({
                hasOnboarded: false, currentStep: 1, level: 1, xp: 0, coins: 0, streak: 0, name: "",
                revenue: 0, fixedCosts: 0, totalBalance: 0, ie: 0, is: 0, idMetric: 0, rs: 0,
                transactions: [], goals: [], lastLoginDate: null, unlockedAvatars: ['default'],
                activeAvatar: 'default', dailyQuizCompletedAt: null, dailyCoinsEarned: 0,
                missions: [], userMissions: []
            }),

            calculateMetricsFromTransactions: () => {
                set((state: UserState) => {
                    if (state.revenue === 0) return state;

                    const now = new Date();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);

                    const recentTransactions = state.transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);

                    let incoming = 0;
                    let survivalExpenses = 0;
                    let lifestyleExpenses = 0;
                    let drainExpenses = 0;

                    const activeRevenue = state.revenue; // Base is fixed revenue month

                    recentTransactions.forEach(t => {
                        if (t.type === 'income') {
                            incoming += t.amount;
                        } else {
                            const cat = t.category;
                            if (['Alimentação', 'Saúde', 'Moradia', 'Transporte', 'Educação'].includes(cat)) {
                                survivalExpenses += t.amount;
                            } else if (['Lazer', 'Roupas', 'Tecnologia'].includes(cat)) {
                                lifestyleExpenses += t.amount;
                            } else if (['Assinaturas', 'Festas'].includes(cat)) {
                                drainExpenses += t.amount;
                            } else {
                                lifestyleExpenses += t.amount; // default fallback
                            }
                        }
                    });

                    const totalExpenses = survivalExpenses + lifestyleExpenses + drainExpenses;
                    const endBalance = activeRevenue - totalExpenses;

                    const ie = (endBalance / activeRevenue) * 100;
                    const is = (survivalExpenses / activeRevenue) * 100;
                    const idMetric = (drainExpenses / activeRevenue) * 100;

                    const rs = state.fixedCosts > 0 ? (state.totalBalance / state.fixedCosts) : 0;

                    let newStep = 1;

                    if (rs >= 6 && ie > 20 && idMetric < 5) newStep = 6;
                    else if (rs >= 3 && ie > 15 && idMetric < 7) newStep = 5;
                    else if (rs >= 1 && ie > 10 && idMetric < 10 && is <= 70) newStep = 4;
                    else if (rs >= 0.5 && ie > 5 && idMetric < 15 && is <= 75) newStep = 3;
                    else if (ie > 0 && idMetric <= 20 && is <= 80) newStep = 2;
                    else newStep = 1;

                    // Fallback to highest previously unlocked if fallback rules apply, but here we just assign to keep strict LogicaBack.
                    // Ideally we only update if better.
                    return { ie, is, idMetric, rs, currentStep: newStep };
                });
            },

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
            setActiveAvatar: (avatarId: string) => set({ activeAvatar: avatarId }),
            unlockAvatar: (avatarId: string, cost: number) => {
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
            completeDailyQuiz: (xpReward: number) => {
                const today = format(new Date(), 'yyyy-MM-dd');
                set((state: UserState) => ({
                    dailyQuizCompletedAt: today,
                    xp: state.xp + xpReward
                }));
            },
            addGoal: (goal: Goal) => set((state: UserState) => ({ goals: [goal, ...state.goals] })),
            toggleGoal: (id: string) => set((state: UserState) => ({
                goals: state.goals.map((g: Goal) => g.id === id ? { ...g, completed: !g.completed } : g)
            })),
            syncWithSupabase: (data: Partial<UserState>) => set((state: UserState) => ({ ...state, ...data })),

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
                    const typedProfile = profile as {
                        id: string;
                        name: string;
                        xp: number;
                        level: number;
                        coins: number;
                        streak: number;
                        current_step: number;
                        active_avatar: string;
                        unlocked_avatars: string[];
                        goals: any[];
                        daily_quiz_completed_at: string | null;
                        revenue: number;
                        fixed_costs: number;
                        ie: number;
                        is: number;
                        id_metric: number;
                        rs: number;
                        total_balance: number;
                        daily_coins_earned: number;
                    };
                    set({
                        id: typedProfile.id || null,
                        name: typedProfile.name || get().name,
                        xp: typedProfile.xp ?? get().xp,
                        level: typedProfile.level ?? get().level,
                        coins: typedProfile.coins ?? get().coins,
                        streak: typedProfile.streak ?? get().streak,
                        currentStep: typedProfile.current_step ?? get().currentStep,
                        activeAvatar: typedProfile.active_avatar || get().activeAvatar,
                        unlockedAvatars: typedProfile.unlocked_avatars || get().unlockedAvatars,
                        goals: typedProfile.goals || get().goals,
                        dailyQuizCompletedAt: typedProfile.daily_quiz_completed_at,

                        revenue: typedProfile.revenue ?? get().revenue,
                        fixedCosts: typedProfile.fixed_costs ?? get().fixedCosts,
                        ie: typedProfile.ie ?? get().ie,
                        is: typedProfile.is ?? get().is,
                        idMetric: typedProfile.id_metric ?? get().idMetric,
                        rs: typedProfile.rs ?? get().rs,
                        totalBalance: typedProfile.total_balance ?? get().totalBalance,
                        dailyCoinsEarned: typedProfile.daily_coins_earned ?? get().dailyCoinsEarned,

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
                        transactions: txs.map((t: any) => ({
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
                        userMissions: userCompletions.map((c: any) => ({
                            missionId: c.mission_id,
                            completedAt: c.completed_at,
                            score: c.score
                        }))
                    });
                }
            },

            saveMissionCompletion: async (missionId: string, score: number, xpReward: number, coinsReward: number) => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const userId = session.user.id;

                // Use internal actions to respect capping and level logic
                get().addXp(xpReward);
                get().addCoins(coinsReward);

                set((state: UserState) => ({
                    userMissions: [
                        ...state.userMissions.filter((m: UserMissionCompletion) => m.missionId !== missionId),
                        { missionId: missionId, completedAt: new Date().toISOString(), score }
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

    useUserStore.subscribe((state: UserState, prevState: UserState) => {
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

                    // 1. TRINDADE DE CATEGORIZAÇÃO (v2)
                    const survivors = ["aluguel", "conta", "mercado", "remédio", "transporte trabalho", "escola"];
                    const lifestyle = ["restaurante", "streaming", "academia", "lazer", "viagem", "educação"];
                    const drains = ["juros", "multa", "tarifa", "assinatura esquecida", "aposta", "impulsiva", "rotativo"];

                    const isSurvivor = (cat: string) => survivors.some(s => cat.toLowerCase().includes(s));
                    const isLifestyle = (cat: string) => lifestyle.some(l => cat.toLowerCase().includes(l));
                    const isDrain = (cat: string) => drains.some(d => cat.toLowerCase().includes(d));

                    const expenses = state.transactions.filter(t => t.type === 'expense');
                    const incomes = state.transactions.filter(t => t.type === 'income');

                    const totalInc = incomes.reduce((acc: number, cur: Transaction) => acc + Number(cur.amount), 0);
                    const totalExp = expenses.reduce((acc: number, cur: Transaction) => acc + Number(cur.amount), 0);

                    const expSurvivor = expenses.filter(t => isSurvivor(t.category)).reduce((acc: number, cur: Transaction) => acc + Number(cur.amount), 0);
                    const expLifestyle = expenses.filter(t => isLifestyle(t.category)).reduce((acc: number, cur: Transaction) => acc + Number(cur.amount), 0);
                    const expDrain = expenses.filter(t => isDrain(t.category)).reduce((acc: number, cur: Transaction) => acc + Number(cur.amount), 0);

                    const balance = totalInc - totalExp;
                    const revenue = state.revenue || totalInc || 1; // Avoid div by zero

                    // Cálculos de Métricas
                    const IE = (balance / revenue) * 100;
                    const IS = (expSurvivor / revenue) * 100;
                    const ID = (expDrain / revenue) * 100;
                    const RS = state.fixedCosts > 0 ? balance / state.fixedCosts : 0;

                    // 2. LÓGICA DE DEGRAU (Thresholds v2)
                    let calculatedStep = 1;

                    // Degrau 2 - Organizando
                    if (RS >= 0 && IE > 0 && ID <= 20 && IS <= 80) calculatedStep = 2;
                    // Degrau 3 - Controlador
                    if (RS >= 0.5 && IE > 5 && ID < 15 && IS <= 75) calculatedStep = 3;
                    // Degrau 4 - Construtor
                    if (RS >= 1 && IE > 10 && ID < 10 && IS <= 70) calculatedStep = 4;
                    // Degrau 5 - Estrategista
                    if (RS >= 3 && IE > 15 && ID < 7 && expenses.some(t => t.category.toLowerCase().includes('invest'))) calculatedStep = 5;
                    // Degrau 6 - Mestre
                    if (RS >= 6 && IE > 20 && ID < 5) calculatedStep = 6;

                    // If manually set higher in onboarding or has checkpoint, respect
                    const finalStep = Math.max(state.currentStep, calculatedStep);

                    await supabase.from('profiles').update({
                        xp: state.xp,
                        level: state.level,
                        coins: state.coins,
                        streak: state.streak,
                        goals: state.goals,
                        daily_quiz_completed_at: state.dailyQuizCompletedAt,
                        active_avatar: state.activeAvatar,
                        unlocked_avatars: state.unlockedAvatars,
                        current_step: finalStep,
                        ie: IE,
                        is: IS,
                        id_metric: ID,
                        rs: RS,
                        total_balance: balance
                    }).eq('id', userId);

                    // Update Internal Calculated State
                    useUserStore.setState({
                        ie: IE,
                        is: IS,
                        idMetric: ID,
                        rs: RS,
                        totalBalance: balance,
                        currentStep: finalStep
                    });
                }
            }, 1500);
        }
    });
}
