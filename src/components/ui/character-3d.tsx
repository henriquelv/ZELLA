"use client";

import { Suspense, useRef, memo, type ComponentType, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// ─── PANDA ────────────────────────────────────────────────────────────────────
function PandaMesh() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.4;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
    });

    return (
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
            <group ref={groupRef} position={[0, -0.2, 0]}>
                {/* Body */}
                <mesh position={[0, -0.6, 0]}>
                    <sphereGeometry args={[0.7, 16, 12]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.5} />
                </mesh>
                {/* Belly patch */}
                <mesh position={[0, -0.55, 0.55]}>
                    <sphereGeometry args={[0.4, 14, 10]} />
                    <meshStandardMaterial color="#f3f3f3" roughness={0.6} />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.4, 0]}>
                    <sphereGeometry args={[0.65, 16, 12]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.5} />
                </mesh>
                {/* Ears */}
                <mesh position={[-0.45, 0.85, 0]}>
                    <sphereGeometry args={[0.18, 12, 8]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
                </mesh>
                <mesh position={[0.45, 0.85, 0]}>
                    <sphereGeometry args={[0.18, 12, 8]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
                </mesh>
                {/* Eye patches */}
                <mesh position={[-0.22, 0.42, 0.5]}>
                    <sphereGeometry args={[0.16, 12, 8]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                </mesh>
                <mesh position={[0.22, 0.42, 0.5]}>
                    <sphereGeometry args={[0.16, 12, 8]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                </mesh>
                {/* Eyes */}
                <mesh position={[-0.22, 0.45, 0.62]}>
                    <sphereGeometry args={[0.05, 8, 6]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[0.22, 0.45, 0.62]}>
                    <sphereGeometry args={[0.05, 8, 6]} />
                    <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
                </mesh>
                {/* Nose */}
                <mesh position={[0, 0.25, 0.62]}>
                    <sphereGeometry args={[0.06, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Arms */}
                <mesh position={[-0.7, -0.4, 0.2]}>
                    <sphereGeometry args={[0.22, 12, 8]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
                </mesh>
                <mesh position={[0.7, -0.4, 0.2]}>
                    <sphereGeometry args={[0.22, 12, 8]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
                </mesh>
            </group>
        </Float>
    );
}

// ─── FOX ──────────────────────────────────────────────────────────────────────
function FoxMesh() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.5;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.5}>
            <group ref={groupRef} position={[0, -0.2, 0]}>
                {/* Body */}
                <mesh position={[0, -0.55, 0]}>
                    <sphereGeometry args={[0.65, 16, 12]} />
                    <meshStandardMaterial color="#f97316" roughness={0.5} />
                </mesh>
                {/* Belly */}
                <mesh position={[0, -0.55, 0.5]}>
                    <sphereGeometry args={[0.38, 14, 10]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.6} />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.35, 0]}>
                    <sphereGeometry args={[0.6, 16, 12]} />
                    <meshStandardMaterial color="#f97316" roughness={0.5} />
                </mesh>
                {/* Snout */}
                <mesh position={[0, 0.18, 0.5]}>
                    <coneGeometry args={[0.22, 0.4, 10]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.5} />
                </mesh>
                {/* Ears (pointy triangles via cones) */}
                <mesh position={[-0.4, 0.95, 0]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.18, 0.45, 8]} />
                    <meshStandardMaterial color="#ea580c" roughness={0.5} />
                </mesh>
                <mesh position={[0.4, 0.95, 0]} rotation={[0, 0, 0.2]}>
                    <coneGeometry args={[0.18, 0.45, 8]} />
                    <meshStandardMaterial color="#ea580c" roughness={0.5} />
                </mesh>
                {/* Inner ears */}
                <mesh position={[-0.4, 0.95, 0.05]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.1, 0.32, 8]} />
                    <meshStandardMaterial color="#fbbf24" roughness={0.5} />
                </mesh>
                <mesh position={[0.4, 0.95, 0.05]} rotation={[0, 0, 0.2]}>
                    <coneGeometry args={[0.1, 0.32, 8]} />
                    <meshStandardMaterial color="#fbbf24" roughness={0.5} />
                </mesh>
                {/* Eyes */}
                <mesh position={[-0.22, 0.42, 0.5]}>
                    <sphereGeometry args={[0.07, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" emissive="#1a1a1a" />
                </mesh>
                <mesh position={[0.22, 0.42, 0.5]}>
                    <sphereGeometry args={[0.07, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" emissive="#1a1a1a" />
                </mesh>
                {/* Nose */}
                <mesh position={[0, 0.18, 0.72]}>
                    <sphereGeometry args={[0.05, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Tail */}
                <mesh position={[0, -0.45, -0.65]} rotation={[0.5, 0, 0]}>
                    <coneGeometry args={[0.2, 0.7, 10]} />
                    <meshStandardMaterial color="#f97316" roughness={0.5} />
                </mesh>
                <mesh position={[0, -0.18, -0.85]}>
                    <sphereGeometry args={[0.16, 12, 8]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.6} />
                </mesh>
            </group>
        </Float>
    );
}

// ─── LION ─────────────────────────────────────────────────────────────────────
function LionMesh() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    });

    return (
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
            <group ref={groupRef} position={[0, -0.2, 0]}>
                {/* Body */}
                <mesh position={[0, -0.5, 0]}>
                    <sphereGeometry args={[0.7, 16, 12]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.5} />
                </mesh>
                {/* Mane (large sphere behind head) */}
                <mesh position={[0, 0.3, -0.05]}>
                    <sphereGeometry args={[0.85, 14, 10]} />
                    <meshStandardMaterial color="#92400e" roughness={0.7} />
                </mesh>
                {/* Mane spikes */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    return (
                        <mesh
                            key={`mane-${i}`}
                            position={[
                                Math.cos(angle) * 0.85,
                                0.3 + Math.sin(angle) * 0.85,
                                -0.05,
                            ]}
                        >
                            <sphereGeometry args={[0.18, 8, 6]} />
                            <meshStandardMaterial color="#78350f" roughness={0.7} />
                        </mesh>
                    );
                })}
                {/* Head */}
                <mesh position={[0, 0.35, 0.3]}>
                    <sphereGeometry args={[0.55, 16, 12]} />
                    <meshStandardMaterial color="#fbbf24" roughness={0.5} />
                </mesh>
                {/* Snout */}
                <mesh position={[0, 0.2, 0.7]}>
                    <sphereGeometry args={[0.28, 14, 10]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.5} />
                </mesh>
                {/* Eyes */}
                <mesh position={[-0.2, 0.42, 0.7]}>
                    <sphereGeometry args={[0.07, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                <mesh position={[0.2, 0.42, 0.7]}>
                    <sphereGeometry args={[0.07, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Nose */}
                <mesh position={[0, 0.2, 0.92]}>
                    <sphereGeometry args={[0.06, 8, 6]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Ears */}
                <mesh position={[-0.4, 0.75, 0.15]}>
                    <sphereGeometry args={[0.13, 12, 8]} />
                    <meshStandardMaterial color="#92400e" roughness={0.6} />
                </mesh>
                <mesh position={[0.4, 0.75, 0.15]}>
                    <sphereGeometry args={[0.13, 12, 8]} />
                    <meshStandardMaterial color="#92400e" roughness={0.6} />
                </mesh>
            </group>
        </Float>
    );
}

// ─── ROBOT ────────────────────────────────────────────────────────────────────
function RobotMesh() {
    const groupRef = useRef<THREE.Group>(null);
    const eyeRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.08;
        if (eyeRef.current) {
            eyeRef.current.emissiveIntensity =
                0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
        }
    });

    return (
        <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
            <group ref={groupRef} position={[0, -0.2, 0]}>
                {/* Body */}
                <mesh position={[0, -0.5, 0]}>
                    <boxGeometry args={[0.95, 0.95, 0.7]} />
                    <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.2} />
                </mesh>
                {/* Chest panel */}
                <mesh position={[0, -0.45, 0.36]}>
                    <boxGeometry args={[0.55, 0.5, 0.05]} />
                    <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} emissive="#1e3a8a" emissiveIntensity={0.3} />
                </mesh>
                {/* Light dot on chest */}
                <mesh position={[0, -0.35, 0.4]}>
                    <sphereGeometry args={[0.06, 8, 6]} />
                    <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.4, 0]}>
                    <boxGeometry args={[0.85, 0.75, 0.65]} />
                    <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.15} />
                </mesh>
                {/* Visor */}
                <mesh position={[0, 0.45, 0.34]}>
                    <boxGeometry args={[0.7, 0.25, 0.05]} />
                    <meshStandardMaterial
                        ref={eyeRef}
                        color="#0f172a"
                        emissive="#22d3ee"
                        emissiveIntensity={1}
                        metalness={1}
                        roughness={0}
                    />
                </mesh>
                {/* Antenna */}
                <mesh position={[0, 0.92, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
                    <meshStandardMaterial color="#93c5fd" metalness={0.9} />
                </mesh>
                <mesh position={[0, 1.1, 0]}>
                    <sphereGeometry args={[0.08, 12, 8]} />
                    <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
                </mesh>
                {/* Arms */}
                <mesh position={[-0.65, -0.5, 0]}>
                    <boxGeometry args={[0.22, 0.7, 0.22]} />
                    <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.65, -0.5, 0]}>
                    <boxGeometry args={[0.22, 0.7, 0.22]} />
                    <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>
        </Float>
    );
}

// ─── DRAGON ───────────────────────────────────────────────────────────────────
function DragonMesh() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.5;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    });

    return (
        <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.6}>
            <group ref={groupRef} position={[0, -0.2, 0]}>
                {/* Body */}
                <mesh position={[0, -0.55, 0]}>
                    <sphereGeometry args={[0.7, 16, 12]} />
                    <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
                </mesh>
                {/* Belly */}
                <mesh position={[0, -0.55, 0.45]}>
                    <sphereGeometry args={[0.42, 14, 10]} />
                    <meshStandardMaterial color="#fbbf24" roughness={0.5} />
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.4, 0.05]}>
                    <sphereGeometry args={[0.55, 16, 12]} />
                    <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
                </mesh>
                {/* Snout */}
                <mesh position={[0, 0.25, 0.55]}>
                    <boxGeometry args={[0.4, 0.32, 0.4]} />
                    <meshStandardMaterial color="#b91c1c" roughness={0.4} metalness={0.2} />
                </mesh>
                {/* Eyes (glowing) */}
                <mesh position={[-0.22, 0.5, 0.45]}>
                    <sphereGeometry args={[0.08, 12, 8]} />
                    <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={1.5} />
                </mesh>
                <mesh position={[0.22, 0.5, 0.45]}>
                    <sphereGeometry args={[0.08, 12, 8]} />
                    <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={1.5} />
                </mesh>
                {/* Horns */}
                <mesh position={[-0.28, 0.85, -0.05]} rotation={[-0.3, 0, -0.4]}>
                    <coneGeometry args={[0.1, 0.4, 8]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.4} />
                </mesh>
                <mesh position={[0.28, 0.85, -0.05]} rotation={[-0.3, 0, 0.4]}>
                    <coneGeometry args={[0.1, 0.4, 8]} />
                    <meshStandardMaterial color="#fef3c7" roughness={0.4} />
                </mesh>
                {/* Wings */}
                <mesh position={[-0.85, 0, -0.1]} rotation={[0, 0.4, 0.4]}>
                    <boxGeometry args={[0.6, 0.5, 0.05]} />
                    <meshStandardMaterial color="#7f1d1d" roughness={0.5} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0.85, 0, -0.1]} rotation={[0, -0.4, -0.4]}>
                    <boxGeometry args={[0.6, 0.5, 0.05]} />
                    <meshStandardMaterial color="#7f1d1d" roughness={0.5} side={THREE.DoubleSide} />
                </mesh>
                {/* Tail spike */}
                <mesh position={[0, -0.4, -0.85]} rotation={[0.6, 0, 0]}>
                    <coneGeometry args={[0.18, 0.6, 8]} />
                    <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
                </mesh>
            </group>
        </Float>
    );
}

// ─── EXPORTED SCENES ──────────────────────────────────────────────────────────

function CharacterCanvas({ children, size }: { children: React.ReactNode; size: number }) {
    return (
        <div style={{ width: size, height: size }} className="mx-auto">
            <Canvas
                // Cap pixel ratio so high-DPI phones (2x/3x) don't render at full resolution
                dpr={[1, 1.5]}
                camera={{ position: [0, 0.2, 3.5], fov: 38 }}
                gl={{
                    antialias: false,
                    powerPreference: "low-power",
                    alpha: true,
                }}
                performance={{ min: 0.5 }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <pointLight position={[5, 5, 5]} intensity={1.4} color="#fff5e0" />
                    <pointLight position={[-5, -3, 3]} intensity={0.6} color="#cfe9ff" />
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
}

export const PandaScene = memo(function PandaScene({ size = 160 }: { size?: number }) {
    return (
        <CharacterCanvas size={size}>
            <PandaMesh />
        </CharacterCanvas>
    );
});

export const FoxScene = memo(function FoxScene({ size = 160 }: { size?: number }) {
    return (
        <CharacterCanvas size={size}>
            <FoxMesh />
        </CharacterCanvas>
    );
});

export const LionScene = memo(function LionScene({ size = 160 }: { size?: number }) {
    return (
        <CharacterCanvas size={size}>
            <LionMesh />
        </CharacterCanvas>
    );
});

export const RobotScene = memo(function RobotScene({ size = 160 }: { size?: number }) {
    return (
        <CharacterCanvas size={size}>
            <RobotMesh />
        </CharacterCanvas>
    );
});

export const DragonScene = memo(function DragonScene({ size = 160 }: { size?: number }) {
    return (
        <CharacterCanvas size={size}>
            <DragonMesh />
        </CharacterCanvas>
    );
});

// ─── REGISTRY ─────────────────────────────────────────────────────────────────
export interface CharacterDef {
    id: string;
    name: string;
    description: string;
    cost: number;
    accentColor: string; // tailwind text/bg class
    bgGradient: string;
    emoji: string; // 2D fallback for headers / small slots
    avatarBg: string; // tailwind bg class for the 2D avatar pill
    Scene: ComponentType<{ size?: number }>;
    greeting: (name?: string) => string;
}

export const CHARACTERS: CharacterDef[] = [
    {
        id: "panda",
        name: "Pandi",
        description: "O panda paciente que ama economizar.",
        cost: 0,
        accentColor: "text-emerald-600",
        bgGradient: "from-emerald-50 to-teal-50",
        emoji: "🐼",
        avatarBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
        Scene: PandaScene,
        greeting: (name) =>
            `Oi ${name || "amigo"}! Calma, devagar a gente chega lá.`,
    },
    {
        id: "fox",
        name: "Rapidão",
        description: "A raposa esperta que farreja oportunidades.",
        cost: 150,
        accentColor: "text-orange-600",
        bgGradient: "from-orange-50 to-amber-50",
        emoji: "🦊",
        avatarBg: "bg-gradient-to-br from-orange-100 to-amber-100",
        Scene: FoxScene,
        greeting: (name) =>
            `${name || "Ei"}! Achei umas boas hoje, bora dar uma olhada?`,
    },
    {
        id: "lion",
        name: "Rei",
        description: "O leão que comanda o seu reino financeiro.",
        cost: 250,
        accentColor: "text-amber-600",
        bgGradient: "from-amber-50 to-yellow-50",
        emoji: "🦁",
        avatarBg: "bg-gradient-to-br from-amber-100 to-yellow-100",
        Scene: LionScene,
        greeting: (name) =>
            `Saudações, ${name || "guerreiro"}. Hoje a gente domina o jogo.`,
    },
    {
        id: "robot",
        name: "Z-Bot",
        description: "O robô que calcula tudo por você.",
        cost: 400,
        accentColor: "text-blue-600",
        bgGradient: "from-blue-50 to-cyan-50",
        emoji: "🤖",
        avatarBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
        Scene: RobotScene,
        greeting: (name) =>
            `Olá ${name || "humano"}. Cálculos prontos. Vamos otimizar tudo.`,
    },
    {
        id: "dragon",
        name: "Draco",
        description: "O dragão guardião do tesouro.",
        cost: 800,
        accentColor: "text-red-600",
        bgGradient: "from-red-50 to-orange-50",
        emoji: "🐲",
        avatarBg: "bg-gradient-to-br from-red-100 to-orange-100",
        Scene: DragonScene,
        greeting: (name) =>
            `${name || "Aventureiro"}, seu tesouro está protegido. 🔥`,
    },
];

export function getCharacter(id: string): CharacterDef {
    return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

// ─── SPEECH BUBBLE ────────────────────────────────────────────────────────────
// Little bubble with a tail pointing toward the character. Uses clip-path on the
// tail so the triangle matches the bubble background seamlessly (no border seams).
interface SpeechBubbleProps {
    children: ReactNode;
    className?: string;
    tailSide?: "left" | "right" | "bottom";
    tailOffset?: string; // tailwind position class, e.g. "top-4" or "left-6"
}

export function SpeechBubble({
    children,
    className = "",
    tailSide = "left",
    tailOffset,
}: SpeechBubbleProps) {
    return (
        <div className="relative inline-block max-w-full">
            {/* Tail — rendered as a clipped div that sits outside the bubble */}
            {tailSide === "left" && (
                <div
                    className={cn("absolute -left-[7px] w-3 h-3 bg-white", tailOffset || "top-4")}
                    style={{ clipPath: "polygon(100% 0, 100% 100%, 0 50%)" }}
                    aria-hidden
                />
            )}
            {tailSide === "right" && (
                <div
                    className={cn("absolute -right-[7px] w-3 h-3 bg-white", tailOffset || "top-4")}
                    style={{ clipPath: "polygon(0 0, 0 100%, 100% 50%)" }}
                    aria-hidden
                />
            )}
            {tailSide === "bottom" && (
                <div
                    className={cn("absolute -bottom-[7px] w-3 h-3 bg-white", tailOffset || "left-6")}
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                    aria-hidden
                />
            )}
            <div
                className={cn(
                    "relative bg-white rounded-[1.25rem] px-3.5 py-2.5 shadow-md shadow-blue-900/5 border border-gray-100/80 ring-1 ring-black/[0.02]",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

// ─── 2D AVATAR (cheap fallback for header / small slots) ──────────────────────
export function CharacterAvatar2D({
    characterId,
    size = 44,
    className = "",
}: {
    characterId: string;
    size?: number;
    className?: string;
}) {
    const character = getCharacter(characterId);
    return (
        <div
            style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
            className={`flex items-center justify-center rounded-[0.75rem] ${character.avatarBg} ${className}`}
            aria-label={character.name}
        >
            <span className="leading-none">{character.emoji}</span>
        </div>
    );
}
