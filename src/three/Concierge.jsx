import { useMemo, useRef, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bubbleTexture, staffBadgeTexture } from './textures.js'
import { ShadowDisc } from './parts.jsx'
import { interaction } from './interaction.js'
import { P } from './palette.js'
import { CONCIERGE_POS, CONCIERGE_ROT } from './zones.js'

// ── 실사 느낌의 쇼룸 컨시어지 '서연' (사진 스탠디 + 말풍선 + 상담 호출) ──
// 이미지: public/images/staff/concierge.png (배포용으로 알파 컷아웃한 실사 합성)

const IMG = '/images/staff/concierge.png'
const H = 1.74
const W = H * (372 / 1320) // 원본 비율 유지

export function Concierge({ partner, onSummon, talking, hidden }) {
  const camera = useThree((s) => s.camera)
  const tex = useLoader(THREE.TextureLoader, IMG)
  const [hover, setHover] = useState(false)
  const root = useRef(null)
  const bubble = useRef(null)
  const bubbleMat = useRef(null)
  const badge = useRef(null)
  const bubbleOpacity = useRef(1)

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

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    if (root.current) {
      // 아주 미세한 호흡/무게 이동 (사진이 살아 있는 느낌)
      root.current.position.y = Math.sin(t * 0.9) * 0.006
      root.current.rotation.z = Math.sin(t * 0.55) * 0.004
    }
    // 카메라 거리에 따라 말풍선을 부드럽게 나타나고 사라지게 합니다
    const dist = camera.position.distanceTo(new THREE.Vector3(...CONCIERGE_POS))
    const target = talking ? 0 : dist < 17 ? 1 : 0.25
    bubbleOpacity.current += (target - bubbleOpacity.current) * (1 - Math.exp(-dt * 3))
    if (bubbleMat.current) bubbleMat.current.opacity = bubbleOpacity.current
    if (bubble.current) {
      bubble.current.visible = bubbleOpacity.current > 0.03
      // 이름표·말풍선은 항상 손님 쪽을 향합니다
      bubble.current.rotation.y = Math.atan2(camera.position.x - CONCIERGE_POS[0], camera.position.z - CONCIERGE_POS[2]) - CONCIERGE_ROT
    }
    if (badge.current) {
      badge.current.rotation.y = Math.atan2(camera.position.x - CONCIERGE_POS[0], camera.position.z - CONCIERGE_POS[2]) - CONCIERGE_ROT
    }

    if (typeof window !== 'undefined') {
      const p = new THREE.Vector3(CONCIERGE_POS[0], 1.0, CONCIERGE_POS[2]).project(camera)
      window.__ALFS_CONCIERGE__ = {
        x: Math.round((p.x * 0.5 + 0.5) * window.innerWidth),
        y: Math.round((-p.y * 0.5 + 0.5) * window.innerHeight),
        visible: p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1,
      }
    }
  })

  return (
    <group position={CONCIERGE_POS} rotation={[0, CONCIERGE_ROT, 0]} visible={!hidden}>
      <group ref={root}>
        <ShadowDisc radius={0.44} position={[0, 0.012, 0.02]} opacity={0.6} />

        {/* 골드 링 — 서 있는 자리 표시 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0.02]}>
          <ringGeometry args={[0.43, 0.47, 48]} />
          <meshBasicMaterial color={P.brass} transparent opacity={hover ? 0.95 : 0.6} toneMapped={false} />
        </mesh>

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
          {/* 실사 사진 (알파 컷아웃) */}
          <mesh position={[0, H / 2 + 0.01, 0]}>
            <planeGeometry args={[W, H]} />
            <meshBasicMaterial map={map} transparent alphaTest={0.42} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {/* 클릭 영역을 살짝 넓히는 투명 판 */}
          <mesh position={[0, H / 2, 0.02]}>
            <planeGeometry args={[W + 0.12, H]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {hover && (
            <mesh position={[0, H / 2, -0.01]}>
              <planeGeometry args={[W + 0.16, H + 0.06]} />
              <meshBasicMaterial color={P.goldSoft} transparent opacity={0.16} toneMapped={false} />
            </mesh>
          )}
        </group>
      </group>

      {/* 이름표 */}
      <group ref={badge} position={[0, H + 0.14, 0]}>
        <mesh>
          <planeGeometry args={[0.78, 0.26]} />
          <meshBasicMaterial map={badgeTex} transparent toneMapped={false} />
        </mesh>
      </group>

      {/* 말풍선 */}
      <group ref={bubble} position={[-0.72, 1.62, 0.06]}>
        <mesh>
          <planeGeometry args={[1.06, 0.542]} />
          <meshBasicMaterial ref={bubbleMat} map={bubbleTex} transparent opacity={1} toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
