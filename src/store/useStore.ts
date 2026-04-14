import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { supabase } from '@/lib/supabase'

export interface UserState {
    hasOnboarded: boolean
    currentStep: number // Corresponde ao "Degrau" (1 a 5)
    currentPhase: number // Fases dentro do Degrau (1 a 3)
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
    // Personalização persistida
    activeCharacter: string // id do personagem 3D escolhido (panda, fox, lion, robot, dragon)
    unlockedCharacters: string[]
    activeTheme: string // id do tema visual ativo (classic, ember, ocean, forest, galaxy, elite)
    unlockedThemes: string[]
    activeTitle: string | null
    unlockedTitles: string[]
    dailyQuizCompletedAt: string | null
    dailyCoinsEarned: number // Reset diário para capping
    inventory: {
        freezeStreak: number
        xpMultiplier: number
    }

    transactions: Transaction[]
    missions: Mission[]
    userMissions: UserMissionCompletion[]

    // Actions
    completeOnboarding: (step: number, name: string, initialRevenue?: number, initialFixedCosts?: number) => void
    setCurrentStep: (step: number) => void
    addXp: (amount: number) => void
    addCoins: (amount: number) => void
    spendCoins: (amount: number, itemType: "freezeStreak" | "xpMultiplier" | "avatar" | "character" | "theme" | "title" | "generic") => boolean
    setUserId: (id: string) => void
    deleteTransaction: (id: string) => Promise<void>
    updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>
    incrementStreak: () => void
    addTransaction: (transaction: Transaction) => void
    setFinancialData: (revenue: number, fixedCosts: number) => void
    resetProgress: () => void

    // Gamification Actions
    checkAndApplyStreak: () => void
    setActiveAvatar: (avatarId: string) => void
    unlockAvatar: (avatarId: string, cost: number) => boolean
    completeDailyQuiz: (xpReward: number) => void

    // Personalização (Character + Theme + Title)
    setActiveCharacter: (characterId: string) => void
    unlockCharacter: (characterId: string, cost: number) => boolean
    setActiveTheme: (themeId: string) => void
    unlockTheme: (themeId: string, cost: number) => boolean
    setActiveTitle: (titleId: string | null) => void
    unlockTitle: (titleId: string, cost: number) => boolean

    // Goals / Metas
    goals: Goal[]
    addGoal: (goal: Goal) => void
    toggleGoal: (id: string) => void

    // Supabase Sync
    loadUserData: () => Promise<void>
    syncWithSupabase: (data: Partial<UserState>) => void
    saveMissionCompletion: (missionId: string, score: number, xpReward: number, coinsReward: number) => Promise<void>

    calculateMetricsFromTransactions: () => void
    generateContextualGoals: () => Promise<void>
    evaluateGoalsExpiry: () => void
}

export interface Transaction {
    id: string
    amount: number
    category: string
    type: 'expense' | 'income'
    date: string
    description?: string
    isAiGenerated?: boolean
}

export interface Goal {
    id: string
    title: string
    description: string
    category: 'saving' | 'spending' | 'investing' | 'habit'
    createdAt: string
    completed: boolean
    failed?: boolean
    xpReward: number
    // Campos de rastreamento automático
    conditionType?: 'spending_limit' | 'no_spending' | 'register_income' | null
    targetCategory?: string | null // Categoria monitorada
    targetAmount?: number | null   // Limite de gastos (para spending_limit)
    spentSoFar?: number            // Acumulado de gasto (calculado)
    progressCount?: number         // Contador geral de progresso
    targetCount?: number           // Meta numérica (ex: registrar 3 transações)
    startDate?: string             // Data de início para janela de 7 dias
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
            currentPhase: 1,
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
            activeCharacter: 'panda',
            unlockedCharacters: ['panda'],
            activeTheme: 'classic',
            unlockedThemes: ['classic'],
            activeTitle: null,
            unlockedTitles: [],
            dailyQuizCompletedAt: null,
            dailyCoinsEarned: 0,
            inventory: {
                freezeStreak: 0,
                xpMultiplier: 0
            },

            transactions: [],
            goals: [],
            missions: [],
            userMissions: [],

            completeOnboarding: (step: number, name: string, initialRevenue?: number, initialFixedCosts?: number) =>
                set({ hasOnboarded: true, currentStep: step, currentPhase: 1, name, revenue: initialRevenue || 0, fixedCosts: initialFixedCosts || 0 }),

            setCurrentStep: (step: number) => set({ currentStep: step }),

            addXp: (amount: number) => {
                set((state: UserState) => {
                    const newXp = state.xp + amount;
                    // xp(n) = 100 * (n^1.2)
                    const currentLevel = state.level;
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
            spendCoins: (amount: number, itemType: "freezeStreak" | "xpMultiplier" | "avatar" | "character" | "theme" | "title" | "generic") => {
                let success = false;
                set((state: UserState) => {
                    if (state.coins >= amount) {
                        success = true;
                        const newInventory = { ...state.inventory };
                        if (itemType === "freezeStreak") newInventory.freezeStreak += 1;
                        if (itemType === "xpMultiplier") newInventory.xpMultiplier += 1;
                        return {
                            coins: state.coins - amount,
                            inventory: newInventory
                        };
                    }
                    return state;
                });
                return success;
            },
            setUserId: (id: string) => set({ id }),
            incrementStreak: () => set((state: UserState) => ({ streak: state.streak + 1 })),
            setFinancialData: (revenue: number, fixedCosts: number) => set({ revenue, fixedCosts }),
            addTransaction: (t: Transaction) => {
                set((state: UserState) => {
                    const newTransactions = [t, ...state.transactions];
                    let xpGained = 0;
                    let updatedGoals = state.goals.map(goal => {
                        if (goal.completed || goal.failed) return goal;

                        const now = new Date();
                        const startDate = goal.startDate ? new Date(goal.startDate) : null;
                        const isWithinWindow = !startDate || (now.getTime() - startDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;

                        if (!isWithinWindow) return goal;

                        // --- spending_limit: Falha se gastar MAIS que o limite na categoria ---
                        if (goal.conditionType === 'spending_limit' && goal.targetCategory && t.type === 'expense') {
                            if (t.category === goal.targetCategory) {
                                const newSpent = (goal.spentSoFar || 0) + t.amount;
                                if (goal.targetAmount && newSpent > goal.targetAmount) {
                                    // Falhou — ultrapassou o limite
                                    return { ...goal, failed: true, completed: true, spentSoFar: newSpent, xpReward: 0, title: goal.title + " (Falhou⚠️)" };
                                }
                                return { ...goal, spentSoFar: newSpent };
                            }
                        }

                        // --- no_spending: Falha se fizer qualquer gasto na categoria ---
                        if (goal.conditionType === 'no_spending' && goal.targetCategory && t.type === 'expense') {
                            if (t.category === goal.targetCategory) {
                                return { ...goal, failed: true, completed: true, xpReward: 0, title: goal.title + " (Falhou⚠️)" };
                            }
                        }

                        // --- register_income: Completa ao registrar uma receita ---
                        if (goal.conditionType === 'register_income' && t.type === 'income') {
                            const newCount = (goal.progressCount || 0) + 1;
                            const target = goal.targetCount || 1;
                            if (newCount >= target) {
                                xpGained += goal.xpReward;
                                return { ...goal, completed: true, progressCount: newCount };
                            }
                            return { ...goal, progressCount: newCount };
                        }

                        // --- Legado: metas de 'saving' genéricas (sem conditionType) ---
                        if (!goal.conditionType && goal.category === 'saving' && t.type === 'income') {
                            xpGained += goal.xpReward;
                            return { ...goal, completed: true };
                        }

                        return goal;
                    });

                    const newXp = state.xp + xpGained;

                    (async () => {
                        const { data } = await supabase.auth.getSession();
                        if (!data.session) return;
                        const { error } = await supabase.from('transactions').insert({
                            id: t.id,
                            user_id: data.session.user.id,
                            amount: t.amount,
                            category: t.category,
                            type: t.type,
                            date: t.date,
                            description: t.description || null,
                            is_ai_generated: t.isAiGenerated || false
                        });
                        if (error) console.error('[ZELLA] transaction insert failed:', error.message);
                    })();

                    return {
                        transactions: newTransactions,
                        goals: updatedGoals,
                        xp: newXp
                    };
                });
                get().calculateMetricsFromTransactions();
            },
            deleteTransaction: async (id: string) => {
                set((state: UserState) => ({
                    transactions: state.transactions.filter(t => t.id !== id)
                }));
                try {
                    await supabase.from('transactions').delete().eq('id', id);
                } catch (e) {
                    console.error('[ZELLA] deleteTransaction failed:', (e as Error).message);
                }
                get().calculateMetricsFromTransactions();
            },
            updateTransaction: async (id: string, patch: Partial<Transaction>) => {
                set((state: UserState) => ({
                    transactions: state.transactions.map(t => t.id === id ? { ...t, ...patch } : t)
                }));
                try {
                    const payload: Record<string, unknown> = {};
                    if (patch.amount !== undefined) payload.amount = patch.amount;
                    if (patch.category !== undefined) payload.category = patch.category;
                    if (patch.type !== undefined) payload.type = patch.type;
                    if (patch.date !== undefined) payload.date = patch.date;
                    if (patch.description !== undefined) payload.description = patch.description;
                    await supabase.from('transactions').update(payload).eq('id', id);
                } catch (e) {
                    console.error('[ZELLA] updateTransaction failed:', (e as Error).message);
                }
                get().calculateMetricsFromTransactions();
            },
            resetProgress: () => set({
                hasOnboarded: false, currentStep: 1, currentPhase: 1, level: 1, xp: 0, coins: 0, streak: 0, name: "",
                revenue: 0, fixedCosts: 0, totalBalance: 0, ie: 0, is: 0, idMetric: 0, rs: 0,
                transactions: [], goals: [], lastLoginDate: null, unlockedAvatars: ['default'],
                activeAvatar: 'default', dailyQuizCompletedAt: null, dailyCoinsEarned: 0,
                activeCharacter: 'panda', unlockedCharacters: ['panda'],
                activeTheme: 'classic', unlockedThemes: ['classic'],
                activeTitle: null, unlockedTitles: [],
                inventory: { freezeStreak: 0, xpMultiplier: 0 },
                missions: [], userMissions: []
            }),

            generateContextualGoals: async () => {
                const state = get();
                if (state.transactions.length < 5) return; // Precisa ter histórico mínimo

                // Evitar spam de goals: Só gera se não tiver goals 'habit' ativos
                const hasActiveHabitGoal = state.goals.some(g => !g.completed && g.category === 'habit');
                if (hasActiveHabitGoal) return;

                try {
                    const res = await fetch('/api/generate-goals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            transactions: state.transactions.slice(0, 30), // Mandar só as 30 mais recentes
                            revenue: state.revenue,
                            fixedCosts: state.fixedCosts
                        })
                    });

                    if (!res.ok) throw new Error("Falha ao gerar metas.");
                    
                    const goalData = await res.json();
                    
                    if (goalData && goalData.title) {
                        get().addGoal({
                            id: crypto.randomUUID(),
                            title: goalData.title,
                            description: goalData.description,
                            category: goalData.category || 'habit',
                            xpReward: goalData.xpReward || 150,
                            completed: false,
                            failed: false,
                            conditionType: goalData.conditionType || null,
                            targetCategory: goalData.targetCategory || null,
                            targetAmount: goalData.targetAmount || null,
                            spentSoFar: 0,
                            progressCount: 0,
                            targetCount: goalData.targetCount || 1,
                            startDate: new Date().toISOString(),
                            createdAt: new Date().toISOString()
                        });
                    }
                } catch (error) {
                    console.error("Erro no generateContextualGoals:", error);
                }
            },

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
                    let newPhase = 1;

                    if (rs >= 3 && ie > 15 && idMetric < 7) {
                        newStep = 5;
                        if (rs >= 6 && ie >= 20 && idMetric < 5) newPhase = 3;
                        else if (rs >= 4 && ie >= 18) newPhase = 2;
                        else newPhase = 1;
                    } else if (rs >= 1 && ie > 10 && idMetric < 10 && is <= 70) {
                        newStep = 4;
                        if (rs >= 2.5 && ie > 14) newPhase = 3;
                        else if (rs >= 2 && ie > 12) newPhase = 2;
                        else newPhase = 1;
                    } else if (rs >= 0.5 && ie > 5 && idMetric < 15 && is <= 75) {
                        newStep = 3;
                        if (rs >= 0.9 && ie > 9) newPhase = 3;
                        else if (rs >= 0.7 && ie > 7) newPhase = 2;
                        else newPhase = 1;
                    } else if (ie > 0 && idMetric <= 20 && is <= 80) {
                        newStep = 2;
                        if (ie > 4 && is <= 76) newPhase = 3;
                        else if (ie > 2 && is <= 78) newPhase = 2;
                        else newPhase = 1;
                    } else {
                        newStep = 1;
                        if (idMetric <= 25 && is <= 85) newPhase = 3;
                        else if (idMetric <= 30 && is <= 90) newPhase = 2;
                        else newPhase = 1;
                    }

                    // Behavioral Checkpoints (LogicaBack)
                    // Progression is locked if habits are not formed.
                    if (newStep > state.currentStep) {
                        const requiredStreak = [0, 7, 14, 21, 30][state.currentStep - 1] || 0;
                        if (state.streak < requiredStreak) {
                            newStep = state.currentStep;
                            newPhase = 3; // Maxed out phase in current step waiting for streak
                        }
                    }

                    // Strict no-downgrade logic unless things go extremely bad? 
                    // LogicaBack states users CAN be downgraded if they lose their financial health. 
                    // However, we shouldn't immediately downgrade if it's just a week of bad spending.
                    // For now, we trust the 30-day moving average.
                    
                    return { ie, is, idMetric, rs, currentStep: newStep, currentPhase: newPhase };
                });
                get().generateContextualGoals();
            },
            // A nova versão de `generateContextualGoals` já está definida acima.
            evaluateGoalsExpiry: () => {
                const now = new Date();
                let xpGained = 0;
                set((state: UserState) => {
                    const updatedGoals = state.goals.map(goal => {
                        if (goal.completed || goal.failed || !goal.startDate || !goal.conditionType) return goal;
                        const start = new Date(goal.startDate);
                        const elapsed = now.getTime() - start.getTime();
                        const sevenDays = 7 * 24 * 60 * 60 * 1000;
                        // Se passou 7 dias e a meta ainda não falhou → Sucesso!
                        if (elapsed >= sevenDays) {
                            if (goal.conditionType === 'spending_limit' || goal.conditionType === 'no_spending') {
                                xpGained += goal.xpReward;
                                return { ...goal, completed: true };
                            }
                        }
                        return goal;
                    });
                    return { goals: updatedGoals };
                });
                if (xpGained > 0) get().addXp(xpGained);
            },
            checkAndApplyStreak: () => {
                const today = format(new Date(), 'yyyy-MM-dd');
                const lastLogin = get().lastLoginDate;

                if (!lastLogin) {
                    set({ lastLoginDate: today, streak: 1 });
                    get().evaluateGoalsExpiry();
                    return;
                }

                if (lastLogin !== today) {
                    const daysDiff = differenceInDays(new Date(today), new Date(lastLogin));
                    if (daysDiff === 1) {
                        set({ lastLoginDate: today, streak: get().streak + 1 });
                    } else if (daysDiff > 1) {
                        set({ lastLoginDate: today, streak: 1 });
                    }
                    // Avalia vencimento de metas ao abrir o app
                    get().evaluateGoalsExpiry();
                }
            },
            setActiveAvatar: (avatarId: string) => set({ activeAvatar: avatarId }),
            unlockAvatar: (avatarId: string, cost: number) => {
                const state = get();
                if (state.unlockedAvatars.includes(avatarId)) return false;
                if (state.coins < cost) return false;
                set({
                    coins: state.coins - cost,
                    unlockedAvatars: [...state.unlockedAvatars, avatarId],
                    activeAvatar: avatarId
                });
                return true;
            },
            setActiveCharacter: (characterId: string) => set({ activeCharacter: characterId }),
            unlockCharacter: (characterId: string, cost: number) => {
                const state = get();
                if (state.unlockedCharacters.includes(characterId)) return false;
                if (state.coins < cost) return false;
                set({
                    coins: state.coins - cost,
                    unlockedCharacters: [...state.unlockedCharacters, characterId],
                    activeCharacter: characterId,
                });
                return true;
            },
            setActiveTheme: (themeId: string) => set({ activeTheme: themeId }),
            unlockTheme: (themeId: string, cost: number) => {
                const state = get();
                if (state.unlockedThemes.includes(themeId)) return false;
                if (state.coins < cost) return false;
                set({
                    coins: state.coins - cost,
                    unlockedThemes: [...state.unlockedThemes, themeId],
                    activeTheme: themeId,
                });
                return true;
            },
            setActiveTitle: (titleId: string | null) => set({ activeTitle: titleId }),
            unlockTitle: (titleId: string, cost: number) => {
                const state = get();
                if (state.unlockedTitles.includes(titleId)) return false;
                if (state.coins < cost) return false;
                set({
                    coins: state.coins - cost,
                    unlockedTitles: [...state.unlockedTitles, titleId],
                    activeTitle: titleId,
                });
                return true;
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
                    const p = profile as Record<string, any>;
                    set({
                        id: p.id || null,
                        name: p.name || get().name,
                        xp: p.xp ?? get().xp,
                        level: p.level ?? get().level,
                        coins: p.coins ?? get().coins,
                        streak: p.streak ?? get().streak,
                        currentStep: p.current_step ?? get().currentStep,
                        currentPhase: p.current_phase ?? get().currentPhase,
                        activeAvatar: p.active_avatar || get().activeAvatar,
                        unlockedAvatars: p.unlocked_avatars || get().unlockedAvatars,
                        activeCharacter: p.active_character || get().activeCharacter,
                        unlockedCharacters: p.unlocked_characters || get().unlockedCharacters,
                        activeTheme: p.active_theme || get().activeTheme,
                        unlockedThemes: p.unlocked_themes || get().unlockedThemes,
                        activeTitle: p.active_title ?? get().activeTitle,
                        unlockedTitles: p.unlocked_titles || get().unlockedTitles,
                        inventory: p.inventory || get().inventory,
                        goals: p.goals || get().goals,
                        dailyQuizCompletedAt: p.daily_quiz_completed_at,
                        lastLoginDate: p.last_login_date || get().lastLoginDate,

                        revenue: p.revenue ?? get().revenue,
                        fixedCosts: p.fixed_costs ?? get().fixedCosts,
                        ie: p.ie ?? get().ie,
                        is: p.is_metric ?? get().is,
                        idMetric: p.id_metric ?? get().idMetric,
                        rs: p.rs ?? get().rs,
                        totalBalance: p.total_balance ?? get().totalBalance,
                        dailyCoinsEarned: p.daily_coins_earned ?? get().dailyCoinsEarned,

                        hasOnboarded: p.has_onboarded ?? (p.name ? true : get().hasOnboarded)
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
                            description: t.description || undefined,
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
            state.name !== prevState.name ||
            state.hasOnboarded !== prevState.hasOnboarded ||
            state.currentPhase !== prevState.currentPhase ||
            state.revenue !== prevState.revenue ||
            state.fixedCosts !== prevState.fixedCosts ||
            state.transactions.length !== prevState.transactions.length ||
            state.goals.length !== prevState.goals.length ||
            state.dailyQuizCompletedAt !== prevState.dailyQuizCompletedAt ||
            state.activeAvatar !== prevState.activeAvatar ||
            state.unlockedAvatars.length !== prevState.unlockedAvatars.length ||
            state.activeCharacter !== prevState.activeCharacter ||
            state.unlockedCharacters.length !== prevState.unlockedCharacters.length ||
            state.activeTheme !== prevState.activeTheme ||
            state.unlockedThemes.length !== prevState.unlockedThemes.length ||
            state.activeTitle !== prevState.activeTitle ||
            state.unlockedTitles.length !== prevState.unlockedTitles.length ||
            state.inventory.freezeStreak !== prevState.inventory.freezeStreak ||
            state.inventory.xpMultiplier !== prevState.inventory.xpMultiplier ||
            state.lastLoginDate !== prevState.lastLoginDate;

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

                    const { error: upErr } = await supabase.from('profiles').update({
                        name: state.name,
                        xp: state.xp,
                        level: state.level,
                        coins: state.coins,
                        streak: state.streak,
                        revenue: state.revenue,
                        fixed_costs: state.fixedCosts,
                        has_onboarded: state.hasOnboarded,
                        current_phase: state.currentPhase,
                        goals: state.goals,
                        daily_quiz_completed_at: state.dailyQuizCompletedAt,
                        daily_coins_earned: state.dailyCoinsEarned,
                        last_login_date: state.lastLoginDate,
                        active_avatar: state.activeAvatar,
                        unlocked_avatars: state.unlockedAvatars,
                        active_character: state.activeCharacter,
                        unlocked_characters: state.unlockedCharacters,
                        active_theme: state.activeTheme,
                        unlocked_themes: state.unlockedThemes,
                        active_title: state.activeTitle,
                        unlocked_titles: state.unlockedTitles,
                        inventory: state.inventory,
                        current_step: finalStep,
                        ie: IE,
                        is_metric: IS,
                        id_metric: ID,
                        rs: RS,
                        total_balance: balance
                    }).eq('id', userId);
                    if (upErr) console.warn('[ZELLA] profile sync error:', upErr.message);

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
