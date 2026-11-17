import { useMemo, useRef, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bubbleTexture, staffBadgeTexture } from './textures.js'
import { ShadowDisc, Glow } from './parts.jsx'
import { interaction } from './interaction.js'
import { P } from './palette.js'
import { CONCIERGE_POS, CONCIERGE_ROT } from './zones.js'

// ── 쇼룸 상담 매니저 '서연' ────────────────────────────────────
// 카브제 팝업스토어의 점원처럼: 데스크 옆에 자연스럽게 서 있고, 가까이 가면
// 말을 걸 수 있으며, 누르면 상담 메뉴가 열립니다. (사진 컷아웃 + 미세한 호흡)
// 이미지: public/images/staff/concierge.png (알파 컷아웃 실사 합성)

const IMG = '/images/staff/concierge.png'
const H = 1.74
const W = H * (372 / 1320)

export function Concierge({ partner, onSummon, talking, hidden, onNear }) {
  const camera = useThree((s) => s.camera)
  const tex = useLoader(THREE.TextureLoader, IMG)
  const [hover, setHover] = useState(false)
  const root = useRef(null)
  const bob = useRef(null)
  const bubble = useRef(null)
  const bubbleMat = useRef(null)
  const bubbleOpacity = useRef(1)
  const nearState = useRef(false)
  const yaw = useRef(CONCIERGE_ROT)
  const group = useRef(null)

  const map = useMemo(() => {
    const t = tex.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [tex])

  const bubbleTex = useMemo(
    () =>
      bubbleTexture({
        key: 'concierge-hello',
        title: '안녕하세요, 서연입니다',
        lines: ['제품 구성 · 가격 · 배송 · 주문', '편하게 물어보세요'],
        accent: P.goldDeep,
      }),
    [],
  )

  const badgeTex = useMemo(
    () =>
      staffBadgeTexture({
        key: `concierge-badge-${partner.code}`,
        name: '서연',
        role: partner.type === 'hq' ? '알프스 쇼룸 매니저' : `${partner.shortName} 상담 매니저`,
        accent: partner.accent,
      }),
    [partner],
  )

  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    if (bob.current) {
      // 아주 미세한 호흡 — 사진이 살아 있는 느낌
      bob.current.position.y = Math.sin(t * 0.9) * 0.006
      bob.current.rotation.z = Math.sin(t * 0.55) * 0.004
    }

    // 손님이 가까이 오면 자연스럽게 몸을 돌려 맞이합니다
    const dx = camera.position.x - CONCIERGE_POS[0]
    const dz = camera.position.z - CONCIERGE_POS[2]
    const targetYaw = Math.atan2(dx, dz)
    yaw.current += (targetYaw - yaw.current) * (1 - Math.exp(-dt * 2.2))
    if (group.current) group.current.rotation.y = yaw.current

    const dist = Math.hypot(dx, dz)
    const wantBubble = talking ? 0 : dist < 9 ? 1 : 0.2
    bubbleOpacity.current += (wantBubble - bubbleOpacity.current) * (1 - Math.exp(-dt * 3))
    if (bubbleMat.current) bubbleMat.current.opacity = bubbleOpacity.current
    if (bubble.current) bubble.current.visible = bubbleOpacity.current > 0.03

    const near = dist < 3.6
    if (near !== nearState.current) {
      nearState.current = near
      onNear?.(near)
    }

    if (typeof window !== 'undefined') {
      tmp.set(CONCIERGE_POS[0], 1.0, CONCIERGE_POS[2]).project(camera)
      window.__ALFS_CONCIERGE__ = {
        x: Math.round((tmp.x * 0.5 + 0.5) * window.innerWidth),
        y: Math.round((-tmp.y * 0.5 + 0.5) * window.innerHeight),
        visible: tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1,
        near,
      }
    }
  })

  return (
    <group ref={group} position={CONCIERGE_POS} rotation={[0, CONCIERGE_ROT, 0]} visible={!hidden}>
      <Glow radius={1.5} opacity={0.16} />
      <group ref={root}>
        <ShadowDisc radius={0.42} position={[0, 0.012, 0.02]} opacity={0.62} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0.02]}>
          <ringGeometry args={[0.41, 0.45, 48]} />
          <meshBasicMaterial color={P.brass} transparent opacity={hover ? 0.95 : 0.5} toneMapped={false} />
        </mesh>

        <group
          ref={bob}
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
          <mesh position={[0, H / 2 + 0.01, 0]}>
            <planeGeometry args={[W, H]} />
            <meshBasicMaterial map={map} transparent alphaTest={0.42} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, H / 2, 0.02]}>
            <planeGeometry args={[W + 0.16, H]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {hover && (
            <mesh position={[0, H / 2, -0.01]}>
              <planeGeometry args={[W + 0.2, H + 0.06]} />
              <meshBasicMaterial color={P.goldSoft} transparent opacity={0.18} toneMapped={false} />
            </mesh>
          )}
        </group>
      </group>

      {/* 이름표 */}
      <mesh position={[0, H + 0.13, 0]}>
        <planeGeometry args={[0.72, 0.24]} />
        <meshBasicMaterial map={badgeTex} transparent toneMapped={false} />
      </mesh>

      {/* 말풍선 */}
      <group ref={bubble} position={[-0.74, 1.62, 0.08]}>
        <mesh>
          <planeGeometry args={[1.08, 0.55]} />
          <meshBasicMaterial ref={bubbleMat} map={bubbleTex} transparent opacity={1} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
