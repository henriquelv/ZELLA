"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

// ─── Spinning 3D Coin ─────────────────────────────────────────────────────────
function Coin3D({ color = "#f59e0b" }: { color?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += 0.03;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef} castShadow>
                {/* Coin body */}
                <cylinderGeometry args={[1, 1, 0.15, 64]} />
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Coin Z emboss */}
            <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.7, 0.04, 8, 32]} />
                <meshStandardMaterial color="#d97706" metalness={1} roughness={0} />
            </mesh>
        </Float>
    );
}

// ─── Trophy 3D ───────────────────────────────────────────────────────────────
function Trophy3D() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
    });

    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
            <group ref={groupRef}>
                {/* Cup body */}
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.6, 0.8, 1.1, 32]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.1} />
                </mesh>
                {/* Cup top ring */}
                <mesh position={[0, 0.76, 0]}>
                    <torusGeometry args={[0.62, 0.07, 8, 32]} />
                    <meshStandardMaterial color="#d97706" metalness={1} roughness={0} />
                </mesh>
                {/* Left handle */}
                <mesh position={[-0.75, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <torusGeometry args={[0.22, 0.07, 8, 20, Math.PI]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.15} />
                </mesh>
                {/* Right handle */}
                <mesh position={[0.75, 0.3, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <torusGeometry args={[0.22, 0.07, 8, 20, Math.PI]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.15} />
                </mesh>
                {/* Base stem */}
                <mesh position={[0, -0.5, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
                    <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.05} />
                </mesh>
                {/* Base plate */}
                <mesh position={[0, -0.88, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 0.16, 32]} />
                    <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.1} />
                </mesh>
            </group>
        </Float>
    );
}

// ─── Floating XP Orbs ────────────────────────────────────────────────────────
function XPOrbs() {
    const orbs = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 1,
        size: 0.08 + Math.random() * 0.1,
        speed: 0.5 + Math.random() * 1,
        offset: Math.random() * Math.PI * 2,
    })), []);

    return (
        <>
            {orbs.map((orb, i) => (
                <OrbMesh key={i} {...orb} />
            ))}
        </>
    );
}

function OrbMesh({ x, y, z, size, speed, offset }: {
    x: number; y: number; z: number; size: number; speed: number; offset: number
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!ref.current) return;
        ref.current.position.y = y + Math.sin(state.clock.elapsedTime * speed + offset) * 0.2;
        ref.current.position.x = x + Math.cos(state.clock.elapsedTime * speed * 0.7 + offset) * 0.1;
    });

    return (
        <mesh ref={ref} position={[x, y, z]}>
            <sphereGeometry args={[size, 16, 16]} />
            <MeshDistortMaterial color="#60a5fa" distort={0.3} speed={2} emissive="#2563eb" emissiveIntensity={0.5} transparent opacity={0.8} />
        </mesh>
    );
}

// ─── 3D Z Logo ────────────────────────────────────────────────────────────────
function ZLogo3D() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <group ref={groupRef}>
                {/* Top bar */}
                <mesh position={[0, 0.7, 0]}>
                    <RoundedBox args={[1.6, 0.28, 0.28]} radius={0.1}>
                        <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.2} />
                    </RoundedBox>
                </mesh>
                {/* Diagonal */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <RoundedBox args={[1.8, 0.28, 0.28]} radius={0.1}>
                        <meshStandardMaterial color="#1d4ed8" metalness={0.7} roughness={0.2} />
                    </RoundedBox>
                </mesh>
                {/* Bottom bar */}
                <mesh position={[0, -0.7, 0]}>
                    <RoundedBox args={[1.6, 0.28, 0.28]} radius={0.1}>
                        <meshStandardMaterial color="#16a34a" metalness={0.7} roughness={0.2} />
                    </RoundedBox>
                </mesh>
            </group>
        </Float>
    );
}

// ─── EXPORTED SCENE COMPONENTS ────────────────────────────────────────────────

/** Spinning golden coin — ideal for game results and rewards */
export function CoinScene({ size = 140 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size }} className="mx-auto">
            <Canvas camera={{ position: [0, 0, 3.5], fov: 38 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 5, 5]} intensity={1.5} color="#fde68a" />
                    <pointLight position={[-5, -3, 2]} intensity={0.8} color="#ffffff" />
                    <Coin3D />
                </Suspense>
            </Canvas>
        </div>
    );
}

/** 3D Trophy — for big achievements and perfect scores */
export function TrophyScene({ size = 160 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size }} className="mx-auto">
            <Canvas camera={{ position: [0, 0, 4], fov: 42 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[4, 6, 4]} intensity={2} color="#fde68a" />
                    <pointLight position={[-4, -2, 2]} intensity={0.6} />
                    <Trophy3D />
                </Suspense>
            </Canvas>
        </div>
    );
}

/** Floating blue orbs — for XP gain, ambient decoration */
export function XPOrbScene({ size = 200 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size }} className="mx-auto">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[3, 3, 3]} intensity={1} color="#93c5fd" />
                    <XPOrbs />
                    <Stars radius={8} depth={2} count={50} factor={1} saturation={1} />
                </Suspense>
            </Canvas>
        </div>
    );
}

/** Spinning 3D Z logo — for splash and loading screens */
export function ZLogoScene({ size = 200 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size }} className="mx-auto">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 42 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5, 5, 5]} intensity={1.5} color="#60a5fa" />
                    <pointLight position={[-5, -3, 3]} intensity={0.8} color="#4ade80" />
                    <ZLogo3D />
                    <Stars radius={6} depth={2} count={80} factor={1} saturation={1} />
                </Suspense>
            </Canvas>
        </div>
    );
}
