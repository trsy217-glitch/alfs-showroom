import { useMemo } from 'react'
import * as THREE from 'three'
import { artTexture, booksTexture, linenTexture, oakGrainTexture, shadowTexture, stoneTexture, woolTexture } from './textures.js'
import { P } from './palette.js'

// ─────────────────────────────────────────────────────────────
// 라운지 · 로비 공용 가구 (절차적 생성)
//  · 오크 · 크림 린넨 · 베이지 스톤 · 은은한 LED
// ─────────────────────────────────────────────────────────────

// 오크 재질 (결 방향 유지)
export function useOak({ repeat = [1, 1], color = P.oakLight, roughness = 0.62 } = {}) {
  return useMemo(() => {
    const t = oakGrainTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, color, roughness, metalness: 0.03 })
  }, [repeat, color, roughness])
}

export function useLinen({ color = '#ffffff', roughness = 0.92 } = {}) {
  return useMemo(() => {
    const t = linenTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(3, 3)
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, color, roughness, metalness: 0 })
  }, [color, roughness])
}

export function useStone({ color = '#ffffff' } = {}) {
  return useMemo(() => {
    const t = stoneTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 2)
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, color, roughness: 0.42, metalness: 0.06 })
  }, [color])
}

export function useShadow() {
  return useMemo(() => shadowTexture(), [])
}

// 화분 · 잎 (라운지 · 로비) — 잎 하나하나가 바깥으로 뻗은 잎사귀 모양
export function Plant({ position = [0, 0, 0], scale = 1, tall = false, potColor = P.clay }) {
  const leafMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: P.leaf, roughness: 0.78, metalness: 0, side: THREE.DoubleSide }),
    [],
  )
  const leafMat2 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: P.leafDark, roughness: 0.82, metalness: 0, side: THREE.DoubleSide }),
    [],
  )
  const leaves = useMemo(() => {
    let rand = 13
    const rnd = () => {
      rand = (rand * 9301 + 49297) % 233280
      return rand / 233280
    }
    const out = []
    const tiers = tall
      ? [
          { n: 7, y: 0.95, r: 0.24, tilt: -0.72, len: 1.0 },
          { n: 8, y: 1.3, r: 0.3, tilt: -0.5, len: 1.15 },
          { n: 8, y: 1.66, r: 0.26, tilt: -0.3, len: 1.05 },
          { n: 6, y: 1.95, r: 0.16, tilt: -0.12, len: 0.9 },
        ]
      : [
          { n: 8, y: 0.5, r: 0.2, tilt: -0.62, len: 1.0 },
          { n: 8, y: 0.72, r: 0.18, tilt: -0.38, len: 1.05 },
          { n: 6, y: 0.92, r: 0.12, tilt: -0.16, len: 0.9 },
        ]
    for (const T of tiers) {
      for (let i = 0; i < T.n; i += 1) {
        const a = (i / T.n) * Math.PI * 2 + rnd() * 0.5
        out.push({
          a,
          p: [Math.cos(a) * T.r, T.y + (rnd() - 0.5) * 0.05, Math.sin(a) * T.r],
          tilt: T.tilt + (rnd() - 0.5) * 0.16,
          len: T.len * (0.85 + rnd() * 0.3),
          dark: rnd() < 0.35,
        })
      }
    }
    return out
  }, [tall])

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.21, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.21, 0.42, 24]} />
        <meshStandardMaterial color={potColor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 24]} />
        <meshStandardMaterial color="#6b5a45" roughness={1} />
      </mesh>
      {tall && (
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.035, 0.05, 1.1, 8]} />
          <meshStandardMaterial color="#7d6748" roughness={0.9} />
        </mesh>
      )}
      {leaves.map((l, i) => (
        <group key={i} position={l.p} rotation={[0, -l.a + Math.PI / 2, 0]}>
          <group rotation={[l.tilt, 0, 0]}>
            <mesh position={[0, 0, 0.2 * l.len]} scale={[0.05, 0.16, 0.34 * l.len]} material={l.dark ? leafMat2 : leafMat}>
              <sphereGeometry args={[1, 10, 8]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

// 오크 사이드 테이블
export function SideTable({ position = [0, 0, 0], radius = 0.34, height = 0.48 }) {
  const oak = useOak({ repeat: [1, 1] })
  return (
    <group position={position}>
      <mesh position={[0, height, 0]}>
        <cylinderGeometry args={[radius, radius, 0.06, 32]} />
        <meshStandardMaterial {...oak} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.09, height, 12]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[radius * 0.62, radius * 0.68, 0.04, 24]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>
    </group>
  )
}

// 린넨 클럽 체어 (로비 대기)
export function ClubChair({ position = [0, 0, 0], rotation = 0 }) {
  const linen = useLinen({ color: '#f3ebda' })
  const oak = useOak({ repeat: [1, 1], color: P.oakMid })
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* 좌판 */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.82, 0.16, 0.78]} />
        <meshStandardMaterial {...linen} />
      </mesh>
      {/* 등받이 */}
      <mesh position={[0, 0.66, -0.36]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.82, 0.56, 0.14]} />
        <meshStandardMaterial {...linen} />
      </mesh>
      {/* 팔걸이 */}
      {[-0.44, 0.44].map((x) => (
        <mesh key={x} position={[x, 0.52, -0.02]}>
          <boxGeometry args={[0.11, 0.24, 0.74]} />
          <meshStandardMaterial {...linen} />
        </mesh>
      ))}
      {/* 오크 다리 */}
      {[[-0.34, -0.3], [0.34, -0.3], [-0.34, 0.3], [0.34, 0.3]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.17, z]}>
          <cylinderGeometry args={[0.028, 0.024, 0.34, 8]} />
          <meshStandardMaterial {...oak} />
        </mesh>
      ))}
    </group>
  )
}

// 바 스툴 (성분·체험 존)
export function Stool({ position = [0, 0, 0] }) {
  const oak = useOak({ repeat: [1, 1], color: P.oakMid })
  const linen = useLinen({ color: '#efe4d0' })
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.07, 24]} />
        <meshStandardMaterial {...linen} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 24]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.13, 0.29, Math.sin(a) * 0.13]} rotation={[Math.cos(a) * 0.1, 0, -Math.sin(a) * 0.1]}>
            <cylinderGeometry args={[0.022, 0.026, 0.56, 8]} />
            <meshStandardMaterial {...oak} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.145, 0.014, 8, 20]} />
        <meshStandardMaterial {...oak} />
      </mesh>
    </group>
  )
}

// 펜던트 조명 (오크 드럼 + 따뜻한 빛)
export function Pendant({ position = [0, 0, 0], drop = 1.1, radius = 0.26 }) {
  return (
    <group position={position}>
      <mesh position={[0, drop / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, drop, 6]} />
        <meshStandardMaterial color={P.oakDeep} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius * 1.08, 0.24, 32, 1, true]} />
        <meshStandardMaterial color={P.oakLight} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[radius, radius, 0.03, 32]} />
        <meshStandardMaterial color={P.oakMid} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshBasicMaterial color="#ffe9c2" toneMapped={false} />
      </mesh>
    </group>
  )
}

// 작은 책 더미 · 소품
export function BookStack({ position = [0, 0, 0], count = 3, rotation = 0 }) {
  const colors = ['#8d7a62', '#4b423a', '#c3ab86', '#6d7a63']
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[i * 0.012, 0.022 + i * 0.045, 0]} rotation={[0, i * 0.24, 0]}>
          <boxGeometry args={[0.3 - i * 0.02, 0.042, 0.22 - i * 0.01]} />
          <meshStandardMaterial color={colors[i % colors.length]} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// 도자기 화병 (마른 가지)
export function Vase({ position = [0, 0, 0], scale = 1, color = '#efe4d0' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.14, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.075, 0.14, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {[0.2, -0.5, 1.0].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.06, 0.46 + i * 0.05, Math.cos(a) * 0.05]} rotation={[0.24 * Math.cos(a), a, 0.3 * Math.sin(a)]}>
          <cylinderGeometry args={[0.006, 0.009, 0.36, 5]} />
          <meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// 노트북 (라운지 데스크)
export function Laptop({ position = [0, 0, 0], rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.34, 0.022, 0.24]} />
        <meshStandardMaterial color="#cfcac2" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.012, 0.02]}>
        <boxGeometry args={[0.26, 0.004, 0.1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.11, -0.115]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.34, 0.2, 0.012]} />
        <meshStandardMaterial color="#cfcac2" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.11, -0.108]} rotation={[-0.22, 0, 0]}>
        <planeGeometry args={[0.3, 0.17]} />
        <meshStandardMaterial color="#f7f3e8" emissive="#fff6df" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
    </group>
  )
}

// 벽걸이 액자 (추상 수묵 아트)
export function FramedArt({ position = [0, 0, 0], rotation = [0, 0, 0], width = 1.5, height = 1.8, variant = 0 }) {
  const tex = useMemo(() => artTexture({ key: `art-${variant}`, variant }), [variant])
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.06]} />
        <meshStandardMaterial color={P.oakMid} roughness={0.55} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  )
}

// 오크 슬랫 벽 패널 (세로 슬랫 + 위아래 가로대)
export function SlatWall({ position = [0, 0, 0], rotation = [0, 0, 0], width = 4, height = 2.8, gap = 0.16, color = P.oakLight }) {
  const slats = useMemo(() => {
    const out = []
    const n = Math.floor(width / gap)
    for (let i = 0; i < n; i += 1) out.push(-width / 2 + gap / 2 + i * gap)
    return out
  }, [width, gap])
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, -0.03]}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#a5835d" roughness={0.8} />
      </mesh>
      {slats.map((x, i) => (
        <mesh key={i} position={[x, height / 2, 0.02]}>
          <boxGeometry args={[gap * 0.52, height, 0.06]} />
          <meshStandardMaterial color={color} roughness={0.68} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

// 우드 러그 (도톰한 울)
export function Rug({ position = [0, 0, 0], size = [6.4, 4.8], rotation = 0, color = '#e9dfcc' }) {
  const tex = useMemo(() => woolTexture(), [])
  return (
    <mesh position={[position[0], 0.008, position[2]]} rotation={[-Math.PI / 2, 0, rotation]}>
      <planeGeometry args={[size[0], size[1]]} />
      <meshStandardMaterial map={tex} color={color} roughness={0.96} metalness={0} />
    </mesh>
  )
}

// 클릭 가능한 은은한 발광 표시 (바닥 스포트)
export function FloorGlow({ position = [0, 0, 0], radius = 1.4, opacity = 0.18 }) {
  const tex = useMemo(() => shadowTexture(), [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.006, position[2]]}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial map={tex} color="#fff1d6" transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

// 책장 한 칸 책 (텍스처)
export function BookRow({ position = [0, 0, 0], rotation = [0, 0, 0], width = 1.6, height = 0.28, seed = 1 }) {
  const tex = useMemo(() => booksTexture({ key: `books-${seed}`, seed, count: 24 }), [seed])
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.35} roughness={0.8} side={THREE.DoubleSide} />
    </mesh>
  )
}
