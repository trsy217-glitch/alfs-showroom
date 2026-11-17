import { useMemo } from 'react'
import * as THREE from 'three'
import { edgeShadowTexture, floorTexture, shadowTexture, wallTexture } from './textures.js'
import { P, LIGHT } from './palette.js'

// ── 밝은 갤러리 공간: 크림 대리석 바닥 · 아이보리 벽 · 샴페인 골드 라인 ──

const WALL_X = 9.3
const Z_NEAR = 27
const Z_FAR = -30
const HEIGHT = 6.4

// 샴페인 골드 라인 (벽·천장의 얇은 금속 띠)
function GoldLine({ position, size = [0.06, 0.03, 6], color = P.brass, intensity = 0.35 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} metalness={0.75} roughness={0.28} toneMapped={false} />
    </mesh>
  )
}

// 천장 코브 조명 (따뜻한 빛이 벽을 타고 흐르는 느낌)
function Cove({ position, size = [0.12, 0.08, 6], color = '#fff1d6' }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

export function Hall() {
  const shadow = useMemo(() => shadowTexture(), [])
  const edge = useMemo(() => edgeShadowTexture(), [])
  const floor = useMemo(() => {
    const t = floorTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(5, 16)
    t.needsUpdate = true
    return t
  }, [])
  const wall = useMemo(() => {
    const t = wallTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 8)
    t.needsUpdate = true
    return t
  }, [])
  const ribs = useMemo(() => {
    const out = []
    for (let z = 24; z > -29; z -= 3.6) out.push(z)
    return out
  }, [])

  return (
    <group>
      {/* 바닥 — 크림 대리석 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (Z_NEAR + Z_FAR) / 2]} receiveShadow>
        <planeGeometry args={[WALL_X * 2, Z_NEAR - Z_FAR]} />
        <meshStandardMaterial map={floor} color="#ffffff" roughness={0.22} metalness={0.14} envMapIntensity={0.5} />
      </mesh>

      {/* 중앙 통로 골드 인레이 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, (Z_NEAR + Z_FAR) / 2 + 1]}>
        <planeGeometry args={[0.06, 44]} />
        <meshStandardMaterial color={P.brass} metalness={0.85} roughness={0.3} emissive={P.goldSoft} emissiveIntensity={0.12} />
      </mesh>
      {[-6.1, 6.1].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, (Z_NEAR + Z_FAR) / 2 + 1]}>
          <planeGeometry args={[0.04, 40]} />
          <meshStandardMaterial color={P.floorEdge} metalness={0.55} roughness={0.4} />
        </mesh>
      ))}

      {/* 벽 하부 접지 그늘 (바닥에 깊이를 줍니다) */}
      {[-1, 1].map((s2) => (
        <mesh key={`edge-${s2}`} rotation={[-Math.PI / 2, 0, 0]} position={[s2 * (WALL_X - 0.75), 0.005, (Z_NEAR + Z_FAR) / 2]}>
          <planeGeometry args={[1.5, Z_NEAR - Z_FAR]} />
          <meshBasicMaterial map={edge} transparent depthWrite={false} opacity={0.9} />
        </mesh>
      ))}

      {/* 벽 */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * WALL_X, HEIGHT / 2, (Z_NEAR + Z_FAR) / 2]}>
            <boxGeometry args={[0.3, HEIGHT, Z_NEAR - Z_FAR]} />
            <meshStandardMaterial map={wall} color="#ffffff" roughness={0.62} metalness={0.05} />
          </mesh>
          {/* 하부 걸레받이 (아이보리 석재) */}
          <mesh position={[s * (WALL_X - 0.17), 0.09, (Z_NEAR + Z_FAR) / 2]}>
            <boxGeometry args={[0.06, 0.18, Z_NEAR - Z_FAR]} />
            <meshStandardMaterial color={P.base} roughness={0.45} metalness={0.08} />
          </mesh>
          {/* 걸레받이 위 골드 헤어라인 */}
          <GoldLine position={[s * (WALL_X - 0.16), 0.2, (Z_NEAR + Z_FAR) / 2]} size={[0.02, 0.018, Z_NEAR - Z_FAR]} />
          {/* 천장 코브 조명 */}
          <Cove position={[s * (WALL_X - 0.24), HEIGHT - 0.42, (Z_NEAR + Z_FAR) / 2]} size={[0.1, 0.06, Z_NEAR - Z_FAR]} />
          <GoldLine position={[s * (WALL_X - 0.26), HEIGHT - 0.56, (Z_NEAR + Z_FAR) / 2]} size={[0.03, 0.02, Z_NEAR - Z_FAR]} />
          {/* 벽 리브 (얇은 석재 기둥) */}
          {ribs.map((z) => (
            <mesh key={`${s}-${z}`} position={[s * (WALL_X - 0.24), 2.9, z]}>
              <boxGeometry args={[0.08, 5.1, 0.26]} />
              <meshStandardMaterial color={P.wallRib} roughness={0.5} metalness={0.06} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 앞뒤 마감 벽 */}
      <mesh position={[0, HEIGHT / 2, Z_FAR]}>
        <boxGeometry args={[WALL_X * 2, HEIGHT, 0.3]} />
        <meshStandardMaterial color={P.wallUpper} roughness={0.7} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, Z_NEAR]}>
        <boxGeometry args={[WALL_X * 2, HEIGHT, 0.3]} />
        <meshStandardMaterial color={P.wallUpper} roughness={0.7} />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HEIGHT, (Z_NEAR + Z_FAR) / 2]}>
        <planeGeometry args={[WALL_X * 2, Z_NEAR - Z_FAR]} />
        <meshStandardMaterial color={P.ceiling} emissive="#fff3dd" emissiveIntensity={0.32} roughness={0.95} />
      </mesh>

      {/* 천장 라인 조명 — 따뜻한 아이보리 */}
      {[22, 15, 8, 1, -6, -13, -20, -26].map((z) => (
        <group key={z}>
          <Cove position={[0, HEIGHT - 0.07, z]} size={[5.6, 0.04, 0.1]} color="#fffaf0" />
          <Cove position={[-4.6, HEIGHT - 0.1, z - 1.4]} size={[0.05, 0.03, 2.0]} color="#ffe7bf" />
          <Cove position={[4.6, HEIGHT - 0.1, z - 1.4]} size={[0.05, 0.03, 2.0]} color="#ffe7bf" />
        </group>
      ))}

      {/* 접지 그림자 (존 사이) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 12]}>
        <planeGeometry args={[10, 6]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Lights({ accent = P.gold, accentSoft = P.goldSoft }) {
  return (
    <group>
      <ambientLight intensity={LIGHT.ambient} color="#fffaf1" />
      <hemisphereLight args={[LIGHT.hemiSky, LIGHT.hemiGround, LIGHT.hemi]} />
      <directionalLight position={[9, 13, 20]} intensity={LIGHT.key} color="#fffaf0" />
      <directionalLight position={[-11, 10, -14]} intensity={LIGHT.fill} color="#fff4e2" />
      <pointLight position={[0, 4.6, 4]} intensity={11} distance={17} decay={2} color={accentSoft} />
      <pointLight position={[0, 4.6, -10]} intensity={9} distance={17} decay={2} color={LIGHT.warm} />
      <pointLight position={[0, 4.4, 16]} intensity={9} distance={16} decay={2} color="#fffaf2" />
      <pointLight position={[0, 4.2, -22]} intensity={8} distance={16} decay={2} color={accentSoft} />
    </group>
  )
}

export const HALL = { WALL_X, Z_NEAR, Z_FAR, HEIGHT }
