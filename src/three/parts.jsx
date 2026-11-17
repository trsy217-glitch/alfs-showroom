import { Suspense, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { markerTexture, shadowTexture, glowTexture, bottleLabelTexture } from './textures.js'
import { interaction } from './interaction.js'
import { P } from './palette.js'

// ── 공통 3D 부품 ─────────────────────────────────────────────

export function ShadowDisc({ radius = 1, position = [0, 0.012, 0], opacity = 0.9 }) {
  const tex = useMemo(() => shadowTexture(), [])
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

export function Glow({ radius = 1, position = [0, 0.05, 0], opacity = 0.5 }) {
  const tex = useMemo(() => glowTexture(), [])
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  )
}

// 평면 패널 (간판·안내판·화면) — 텍스처를 그대로 보여줘야 해서 basic material
export function Panel({ texture, width, height, position, rotation = [0, 0, 0], opacity = 1 }) {
  if (!texture) return null
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// 실물 제품 사진 패널 (aspect 유지해서 잘라 넣기) — 아이보리 매트 + 골드 라인
export function PhotoPanel({ url, width, height, position, rotation = [0, 0, 0], frame = true, radius = 0.04 }) {
  return (
    <Suspense fallback={<FrameBox width={width} height={height} position={position} rotation={rotation} color="#f1e7d5" />}>
      <PhotoInner url={url} width={width} height={height} position={position} rotation={rotation} frame={frame} radius={radius} />
    </Suspense>
  )
}

function PhotoInner({ url, width, height, position, rotation, frame, radius }) {
  const base = useLoader(THREE.TextureLoader, url)
  const tex = useMemo(() => {
    const t = base.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    const img = base.image
    if (img && img.width && img.height) {
      const ta = img.width / img.height
      const ba = width / height
      if (ta > ba) {
        const r = ba / ta
        t.repeat.set(r, 1)
        t.offset.set((1 - r) / 2, 0)
      } else {
        const r = ta / ba
        t.repeat.set(1, r)
        t.offset.set(0, (1 - r) / 2)
      }
    }
    t.needsUpdate = true
    return t
  }, [base, width, height])

  return (
    <group position={position} rotation={rotation}>
      {frame && (
        <>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[width + 0.14, height + 0.14, 0.06]} />
            <meshStandardMaterial color="#fbf3e4" roughness={0.42} metalness={0.16} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[width + 0.02, height + 0.02, 0.01]} />
            <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.7} />
          </mesh>
        </>
      )}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.07, 0.055]}>
        <boxGeometry args={[width * 0.86, 0.028, 0.016]} />
        <meshStandardMaterial color={P.gold} emissive={P.goldSoft} emissiveIntensity={0.45} metalness={0.6} roughness={0.3} />
      </mesh>
      {radius ? null : null}
    </group>
  )
}

export function FrameBox({ width, height, position, rotation = [0, 0, 0], color = '#f4ecdd' }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, height, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  )
}

// 3D 병 (실물 사진은 옆 패널로, 형태는 단순 지오메트리)
export function Bottle({
  position = [0, 0, 0],
  height = 1.1,
  radius = 0.26,
  body = '#f1f5f0',
  cap = '#e6d3a8',
  label,
  labelAccent = P.gold,
  drop = true,
  glow = true,
}) {
  const labelTex = useMemo(
    () => (label ? bottleLabelTexture({ key: `label-${label.name}-${label.volume}`, name: label.name, volume: label.volume, accent: labelAccent, drop }) : null),
    [label, labelAccent, drop],
  )
  const bodyH = height * 0.82
  return (
    <group position={position}>
      {glow && <ShadowDisc radius={radius * 2.6} position={[0, 0.008, 0]} opacity={0.5} />}
      <mesh position={[0, bodyH / 2 + 0.02, 0]}>
        <cylinderGeometry args={[radius, radius * 0.96, bodyH, 28]} />
        <meshStandardMaterial color={body} roughness={0.2} metalness={0.25} transparent opacity={0.94} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[0, height - 0.045, 0]}>
        <cylinderGeometry args={[radius * 0.52, radius * 0.6, height * 0.16, 24]} />
        <meshStandardMaterial color={cap} roughness={0.35} metalness={0.45} />
      </mesh>
      {labelTex && (
        <mesh position={[0, bodyH * 0.52, radius * 0.99]}>
          <planeGeometry args={[radius * 1.72, radius * 1.9]} />
          <meshBasicMaterial map={labelTex} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

// 바닥 이동 마커 — 누르면 그 존으로 카메라가 부드럽게 이동
export function ZoneMarker({ zone, active, onGo }) {
  const [hover, setHover] = useState(false)
  const tex = useMemo(() => markerTexture({ key: `marker-${zone.id}`, number: zone.no, label: zone.short }), [zone.id, zone.no, zone.short])
  const scale = hover ? 1.08 : active ? 1.04 : 0.94

  return (
    <group position={zone.marker}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[scale, scale, scale]}
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
          onGo(zone.id)
        }}
      >
        <circleGeometry args={[0.46, 40]} />
        <meshBasicMaterial map={tex} transparent opacity={active || hover ? 1 : 0.86} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <ringGeometry args={[0.44, 0.49, 40]} />
        <meshBasicMaterial color={active ? P.gold : P.stoneEdge} transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  )
}

// ── 제품 누끼(투명 컷아웃) 진열 ──────────────────────────────
// 실물 사진의 배경을 투명하게 따 둔 PNG/WebP 를, 아크릴 스탠드에 세워
// 원목·스톤 테이블 위에 입체감 있게 놓습니다. (바닥 접지 그림자 + 살짝 기울임)
export function CutoutStand({
  url,
  height = 0.5,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  lean = 0.04,
  onClick,
  shadowWidth = 1,
}) {
  return (
    <Suspense fallback={null}>
      <CutoutInner url={url} height={height} position={position} rotation={rotation} lean={lean} onClick={onClick} shadowWidth={shadowWidth} />
    </Suspense>
  )
}

function CutoutInner({ url, height, position, rotation, lean, onClick, shadowWidth }) {
  const base = useLoader(THREE.TextureLoader, url)
  const [hover, setHover] = useState(false)
  const tex = useMemo(() => {
    const t = base.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [base])

  const img = base.image
  const ratio = img && img.width && img.height ? img.width / img.height : 0.4
  const width = height * ratio
  const shadow = useMemo(() => shadowTexture(), [])

  return (
    <group
      position={position}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      onPointerOver={(e) => {
        if (!onClick) return
        e.stopPropagation()
        setHover(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        if (!onClick) return
        setHover(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        if (!onClick) return
        e.stopPropagation()
        if (interaction.moved) return
        onClick()
      }}
    >
      {/* 접지 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[width * 1.5 * shadowWidth, width * 0.62 * shadowWidth]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* 아크릴 스탠드 — 받침 판 + 뒤판 */}
      <mesh position={[0, 0.006, 0]}>
        <boxGeometry args={[width * 0.52, 0.012, 0.16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.34} roughness={0.08} metalness={0.1} />
      </mesh>
      <mesh position={[0, height * 0.4, -0.012]} rotation={[lean, 0, 0]}>
        <boxGeometry args={[width * 0.92, height * 0.8, 0.006]} />
        <meshStandardMaterial color="#fffaf0" transparent opacity={0.16} roughness={0.06} metalness={0.05} />
      </mesh>

      {/* 누끼 제품 */}
      <group rotation={[lean, 0, 0]}>
        <mesh position={[0, height / 2 + 0.02, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.42} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {hover && (
          <mesh position={[0, height / 2 + 0.02, -0.02]}>
            <planeGeometry args={[width * 1.12, height * 1.06]} />
            <meshBasicMaterial color={P.goldSoft} transparent opacity={0.22} toneMapped={false} />
          </mesh>
        )}
        {/* 금속 이름 클립 */}
        <mesh position={[0, 0.024, 0.045]}>
          <boxGeometry args={[width * 0.34, 0.02, 0.02]} />
          <meshStandardMaterial color={P.brass} metalness={0.8} roughness={0.28} />
        </mesh>
      </group>
    </group>
  )
}

// 간접 LED 라인 — 발광 띠 + 부드러운 번짐
export function LedStrip({ position, size = [2, 0.02, 0.03], color = P.led, intensity = 1 }) {
  const glow = useMemo(() => glowTexture(), [])
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, -Math.max(size[0], size[2]) * 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.max(size[0], size[2]) * 1.6, Math.max(size[0], size[2]) * 1.2]} />
        <meshBasicMaterial map={glow} transparent opacity={0.12 * intensity} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

// 클릭 가능한 묶음 (마우스 커서 + 호버 확대)
export function Clickable({ children, onClick, hoverScale = 1.02, position = [0, 0, 0] }) {
  const [hover, setHover] = useState(false)
  return (
    <group
      position={position}
      scale={hover ? hoverScale : 1}
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
        onClick?.()
      }}
    >
      {children}
    </group>
  )
}
