import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { plaqueTexture } from './textures.js'
import { Panel, Glow } from './parts.jsx'
import { interaction } from './interaction.js'
import { P } from './palette.js'
import { CONCIERGE_POS, CONCIERGE_ROT } from './zones.js'

// ── 상담 데스크 표지 ──────────────────────────────────────────
// 2026-11-18 소영 님 지시 ②: 3D 공간 한가운데 떠 있던 매니저 전신 이미지·
// 큰 말풍선·이름표를 걷어냈습니다. 뒤쪽 라운지 시야를 가리지 않고 배경과
// 이질감도 없도록, 데스크 옆에는 작은 브라스 명패만 조용히 세워 둡니다.
// 상담 UI 는 오른쪽 위 '상담 매니저 부르기' 버튼(또는 이 명패)을 눌렀을 때만 열립니다.
// 매니저 Q&A 지식베이스(src/config/knowledge.js)와 상담 기능은 그대로입니다.

const STAND_H = 0.46

export function Concierge({ partner, onSummon, hidden, onNear }) {
  const camera = useThree((s) => s.camera)
  const [hover, setHover] = useState(false)
  const nearState = useRef(false)

  const plaque = useMemo(
    () =>
      plaqueTexture({
        key: `concierge-desk-${partner.code}`,
        name: '상담 매니저 서연',
        price: '상담 데스크',
        note: "오른쪽 위 '상담 매니저 부르기'",
        accent: partner.accent,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner],
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const dx = camera.position.x - CONCIERGE_POS[0]
    const dz = camera.position.z - CONCIERGE_POS[2]
    const dist = Math.hypot(dx, dz)

    const near = dist < 3.6
    if (near !== nearState.current) {
      nearState.current = near
      onNear?.(near)
    }

    if (typeof window !== 'undefined') {
      tmp.set(CONCIERGE_POS[0], 0.9, CONCIERGE_POS[2]).project(camera)
      window.__ALFS_CONCIERGE__ = {
        x: Math.round((tmp.x * 0.5 + 0.5) * window.innerWidth),
        y: Math.round((-tmp.y * 0.5 + 0.5) * window.innerHeight),
        visible: tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1,
        near,
      }
    }
  })

  return (
    <group position={CONCIERGE_POS} rotation={[0, CONCIERGE_ROT, 0]} visible={!hidden}>
      {/* 바닥 안내 — 아주 옅은 빛과 얇은 브라스 링 */}
      <Glow radius={1.15} opacity={0.12} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0.02]}>
        <ringGeometry args={[0.26, 0.285, 48]} />
        <meshBasicMaterial color={P.brass} transparent opacity={hover ? 0.8 : 0.4} toneMapped={false} />
      </mesh>

      {/* 작은 명패 — 데스크 옆 바닥에 세운 슬림 스탠드 */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (interaction.moved) return
          onSummon?.()
        }}
      >
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.085, 0.1, 0.02, 24]} />
          <meshStandardMaterial color={P.brass} metalness={0.72} roughness={0.3} />
        </mesh>
        <mesh position={[0, STAND_H / 2, 0]}>
          <cylinderGeometry args={[0.01, 0.012, STAND_H, 12]} />
          <meshStandardMaterial color={P.brass} metalness={0.8} roughness={0.26} />
        </mesh>
        <group position={[0, STAND_H + 0.065, 0]} rotation={[-0.16, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.33, 0.126, 0.01]} />
            <meshStandardMaterial color="#fbf5e8" roughness={0.4} metalness={0.1} />
          </mesh>
          <Panel texture={plaque} width={0.31} height={0.11} position={[0, 0, 0.007]} />
        </group>
      </group>
    </group>
  )
}
