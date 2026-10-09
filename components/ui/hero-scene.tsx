"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTheme } from "next-themes"
import * as THREE from "three"

function Particles({ count = 1200, dark }: { count?: number; dark: boolean }) {
  const mesh = useRef<THREE.Points>(null)
  const { size } = useThree()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const cyans  = new THREE.Color(dark ? "#00f0ff" : "#00aabb")
    const pinks  = new THREE.Color(dark ? "#ff1aaa" : "#cc1488")
    const violet = new THREE.Color(dark ? "#be00ff" : "#8800cc")

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 28
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12

      const palette = [cyans, pinks, violet]
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3 + 0] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, col]
  }, [count, dark])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = t * 0.04
    mesh.current.rotation.x = Math.sin(t * 0.02) * 0.08
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size.width < 768 ? 0.055 : 0.045}
        vertexColors
        transparent
        opacity={dark ? 0.75 : 0.55}
        sizeAttenuation
      />
    </points>
  )
}

function Grid({ dark }: { dark: boolean }) {
  const mesh = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const lines: number[] = []
    const step = 2.5
    const count = 10

    for (let i = -count; i <= count; i++) {
      lines.push(i * step, -count * step, -6, i * step, count * step, -6)
      lines.push(-count * step, i * step, -6, count * step, i * step, -6)
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.position.y = (state.clock.getElapsedTime() * 0.3) % 2.5
  })

  return (
    <lineSegments ref={mesh} geometry={geometry}>
      <lineBasicMaterial
        color={dark ? "#00f0ff" : "#00aabb"}
        transparent
        opacity={dark ? 0.07 : 0.05}
      />
    </lineSegments>
  )
}

function FloatingRings({ dark }: { dark: boolean }) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    group.current.rotation.x = t * 0.15
    group.current.rotation.z = t * 0.08
  })

  const ringColor  = dark ? "#be00ff" : "#8800cc"
  const ringColor2 = dark ? "#00f0ff" : "#00aabb"

  return (
    <group ref={group} position={[9, -0.5, -3]}>
      <mesh>
        <torusGeometry args={[1.6, 0.018, 8, 80]} />
        <meshBasicMaterial color={ringColor} transparent opacity={dark ? 0.5 : 0.28} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.014, 8, 80]} />
        <meshBasicMaterial color={ringColor2} transparent opacity={dark ? 0.45 : 0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.2, 0.011, 8, 80]} />
        <meshBasicMaterial color={ringColor} transparent opacity={dark ? 0.28 : 0.16} />
      </mesh>
    </group>
  )
}

function FloatingCube({ dark }: { dark: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.x = t * 0.4
    mesh.current.rotation.y = t * 0.3
    mesh.current.position.y = Math.sin(t * 0.6) * 0.4
  })

  return (
    <mesh ref={mesh} position={[-5, 1.5, -3]}>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshBasicMaterial
        color={dark ? "#ff1aaa" : "#cc1488"}
        wireframe
        transparent
        opacity={dark ? 0.5 : 0.3}
      />
    </mesh>
  )
}

export default function HeroScene() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <Particles dark={dark} />
        <Grid dark={dark} />
        <FloatingRings dark={dark} />
        <FloatingCube dark={dark} />
      </Canvas>
    </div>
  )
}
