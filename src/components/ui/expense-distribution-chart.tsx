"use client";

import { useState, useEffect } from "react";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type Transaction = {
    id: string;
    amount: number;
    category: string;
    type: "expense" | "income";
    date: string;
};

interface ExpenseDistributionChartProps {
    transactions: Transaction[];
}

// Zella Brand friendly and vibrant colors
const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4', '#8b5cf6', '#d946ef'];

export function ExpenseDistributionChart({ transactions }: ExpenseDistributionChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const expenses = transactions.filter(t => t.type === 'expense');

    if (!mounted) {
        return (
            <div className="h-72 w-full bg-card rounded-2xl border border-border/50 shadow-sm p-4 flex items-center justify-center">
                <p className="text-xs text-muted-foreground animate-pulse">Carregando gráfico...</p>
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-2xl border border-dashed border-border/50">
                <p className="text-xs text-muted-foreground font-medium">Nenhuma despesa para analisar.</p>
            </div>
        );
    }

    const categoryTotals = expenses.reduce((acc, current) => {
        // Capitalize the category name
        const rawCat = current.category || "Outros";
        const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
        acc[cat] = (acc[cat] || 0) + current.amount;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="h-72 w-full bg-card rounded-2xl border border-border/50 shadow-sm p-4 flex flex-col pt-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Distribuição de Gastos
            </h3>
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            formatter={(value) => `R$ ${(value as number).toFixed(2)}`}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderRadius: '12px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: 'hsl(var(--foreground))'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'hsl(var(--muted-foreground))' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
