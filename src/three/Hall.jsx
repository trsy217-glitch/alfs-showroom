import { useMemo } from 'react'
import * as THREE from 'three'
import { floorTexture, shadowTexture } from './textures.js'

// ── 랩 갤러리 공간: 바닥 · 벽 · 천장 · 조명 ────────────────────

const WALL_X = 9.3
const Z_NEAR = 27
const Z_FAR = -30
const HEIGHT = 6.4

function LightStrip({ position, size = [0.1, 0.06, 6], color = '#5eead4' }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} toneMapped={false} />
    </mesh>
  )
}

function WallRib({ position, height = 5.2 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.07, height, 0.34]} />
      <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.05} />
    </mesh>
  )
}

export function Hall() {
  const shadow = useMemo(() => shadowTexture(), [])
  const floor = useMemo(() => {
    const t = floorTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(9, 29)
    t.needsUpdate = true
    return t
  }, [])
  const ribs = useMemo(() => {
    const out = []
    for (let z = 24; z > -29; z -= 3.2) {
      out.push(z)
    }
    return out
  }, [])

  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (Z_NEAR + Z_FAR) / 2]} receiveShadow>
        <planeGeometry args={[WALL_X * 2, Z_NEAR - Z_FAR]} />
        <meshStandardMaterial map={floor} color="#ffffff" roughness={0.35} metalness={0.12} />
      </mesh>

      {/* 중앙 통로 라인 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, (Z_NEAR + Z_FAR) / 2 + 1]}>
        <planeGeometry args={[0.09, 44]} />
        <meshStandardMaterial color="#0f766e" emissive="#14b8a6" emissiveIntensity={0.18} roughness={0.5} />
      </mesh>
      {[-6.1, 6.1].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, (Z_NEAR + Z_FAR) / 2 + 1]}>
          <planeGeometry args={[0.06, 40]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* 벽 */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * WALL_X, HEIGHT / 2, (Z_NEAR + Z_FAR) / 2]}>
            <boxGeometry args={[0.3, HEIGHT, Z_NEAR - Z_FAR]} />
            <meshStandardMaterial color="#f7f9fb" roughness={0.72} metalness={0.04} />
          </mesh>
          {/* 바닥 걸레받이 · 실링 라인 */}
          <mesh position={[s * (WALL_X - 0.18), 0.075, (Z_NEAR + Z_FAR) / 2]}>
            <boxGeometry args={[0.05, 0.14, Z_NEAR - Z_FAR]} />
            <meshStandardMaterial color="#dbe3e8" roughness={0.35} metalness={0.45} />
          </mesh>
          <mesh position={[s * (WALL_X - 0.18), HEIGHT - 0.62, (Z_NEAR + Z_FAR) / 2]}>
            <boxGeometry args={[0.04, 0.05, Z_NEAR - Z_FAR]} />
            <meshStandardMaterial color="#ccfbf1" emissive="#5eead4" emissiveIntensity={0.18} toneMapped={false} />
          </mesh>
          {/* 벽 리브 */}
          {ribs.map((z) => (
            <WallRib key={`${s}-${z}`} position={[s * (WALL_X - 0.23), 2.9, z]} />
          ))}        </group>
      ))}

      {/* 앞뒤 마감 벽 */}
      <mesh position={[0, HEIGHT / 2, Z_FAR]}>
        <boxGeometry args={[WALL_X * 2, HEIGHT, 0.3]} />
        <meshStandardMaterial color="#f4f7f9" roughness={0.75} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, Z_NEAR]}>
        <boxGeometry args={[WALL_X * 2, HEIGHT, 0.3]} />
        <meshStandardMaterial color="#f4f7f9" roughness={0.75} />
      </mesh>

      {/* 천장 */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HEIGHT, (Z_NEAR + Z_FAR) / 2]}>
        <planeGeometry args={[WALL_X * 2, Z_NEAR - Z_FAR]} />
        <meshStandardMaterial color="#f2f6f8" roughness={0.95} />
      </mesh>

      {/* 천장 조명 라인 */}
      {[22, 15, 8, 1, -6, -13, -20, -26].map((z) => (
        <group key={z}>
          <LightStrip position={[0, HEIGHT - 0.09, z]} size={[5.4, 0.05, 0.12]} color="#f8fafc" />
          <LightStrip position={[-4.6, HEIGHT - 0.12, z - 1.4]} size={[0.06, 0.04, 2.0]} color="#5eead4" />
          <LightStrip position={[4.6, HEIGHT - 0.12, z - 1.4]} size={[0.06, 0.04, 2.0]} color="#5eead4" />
        </group>
      ))}

      {/* 접지 그림자 (존 사이) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 12]}>
        <planeGeometry args={[10, 6]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Lights({ accent = '#0f766e', accentSoft = '#5eead4' }) {
  return (
    <group>
      <ambientLight intensity={0.62} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#cbd5e1', 0.55]} />
      <directionalLight position={[8, 12, 20]} intensity={1.05} color="#ffffff" />
      <directionalLight position={[-10, 9, -14]} intensity={0.4} color="#e6fffb" />
      <pointLight position={[0, 4.6, 4]} intensity={14} distance={18} decay={2} color={accentSoft} />
      <pointLight position={[0, 4.6, -10]} intensity={12} distance={18} decay={2} color="#67e8f9" />
      <pointLight position={[0, 4.4, 16]} intensity={10} distance={16} decay={2} color="#ffffff" />
      <pointLight position={[0, 4.2, -22]} intensity={10} distance={16} decay={2} color="#a7f3d0" />
    </group>
  )
}

export const HALL = { WALL_X, Z_NEAR, Z_FAR, HEIGHT }
