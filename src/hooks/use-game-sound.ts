"use client";

import { useCallback } from "react";

type SoundType = 'coin' | 'success' | 'click' | 'error';

export function useGameSound() {
    const playSound = useCallback((type: SoundType) => {
        if (typeof window === 'undefined') return;

        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();

            const playOscillator = (freq: number, wave: OscillatorType, startTime: number, duration: number, vol: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = wave;
                osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

                gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + startTime);
                osc.stop(ctx.currentTime + startTime + duration);
            };

            if (type === 'coin') {
                // Classic high-pitched coin pickup
                playOscillator(987.77, 'sine', 0, 0.1, 0.1); // B5
                playOscillator(1318.51, 'sine', 0.1, 0.3, 0.1); // E6
            } else if (type === 'success') {
                // Short happy triplet jingle
                playOscillator(523.25, 'square', 0, 0.1, 0.05); // C5
                playOscillator(659.25, 'square', 0.1, 0.1, 0.05); // E5
                playOscillator(783.99, 'square', 0.2, 0.4, 0.05); // G5
            } else if (type === 'click') {
                // Gentle, subtle pop
                playOscillator(400, 'sine', 0, 0.05, 0.1);
            } else if (type === 'error') {
                // Low descending buzz
                playOscillator(150, 'sawtooth', 0, 0.2, 0.05);
                playOscillator(100, 'sawtooth', 0.15, 0.3, 0.05);
            }
        } catch (e) {
            console.warn("AudioContext block/error:", e);
        }
    }, []);

    return { playSound };
}
