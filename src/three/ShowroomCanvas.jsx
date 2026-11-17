import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraRig, ResponsiveCamera } from './Controls.jsx'
import { Hall, Lights } from './Hall.jsx'
import { LobbyZone } from './LobbyZone.jsx'
import { MineralZone } from './MineralZone.jsx'
import { EnzymeZone } from './EnzymeZone.jsx'
import { ExperienceZone } from './ExperienceZone.jsx'
import { LoungeZone } from './LoungeZone.jsx'
import { Concierge } from './Concierge.jsx'
import { ZoneMarker } from './parts.jsx'
import { ZONES, zoneById, ENZYME_X, ENZYME_Z } from './zones.js'
import { P } from './palette.js'

// 화면 검증용 — 진열된 상품이 화면 어느 좌표에 있는지 알려 줍니다
// (3D 오브젝트는 DOM 이 아니라서, 자동 검증이 실제 상품을 누를 수 있게)
const ENZYME_IDS = ['fit30', 'fit3', 'bioenergy', 'zymogen', 'cleanbiome', 'cleanbiome1']

function ProductHotspots() {
  const camera = useThree((s) => s.camera)
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    if (typeof window === 'undefined') return
    const out = []
    const push = (id, x, y, z) => {
      v.set(x, y, z).project(camera)
      out.push({
        id,
        x: Math.round((v.x * 0.5 + 0.5) * window.innerWidth),
        y: Math.round((-v.y * 0.5 + 0.5) * window.innerHeight),
        front: v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1,
      })
    }
    push('oryun', -2.8, 1.35, 1.4)
    ENZYME_Z.forEach((z, i) => push(ENZYME_IDS[i], ENZYME_X, 1.12, z))
    window.__ALFS_HOTSPOTS__ = out
  })
  return null
}

export function ShowroomCanvas({
  partner,
  zoneId,
  glideKey,
  focus,
  narrow,
  talking,
  paused,
  onGo,
  onSelect,
  onSummon,
  onOpenSimulator,
  onNearStaff,
  onReady,
}) {
  // 좁은 화면(세로형)은 존마다 조금 더 가까이, 그 존의 주인공을 향해 서는 프리셋을 씁니다
  const zone = useMemo(() => {
    const base = zoneById(zoneId)
    return narrow && base.narrow ? { ...base, ...base.narrow } : base
  }, [zoneId, narrow])

  return (
    <Canvas
      dpr={[1, 1.75]}
      // 상품 3D 인스펙터가 열려 있는 동안은 쇼룸 렌더링을 멈춰 GPU를 비웁니다
      frameloop={paused ? 'demand' : 'always'}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 1.95, 10.2], fov: 52, near: 0.1, far: 150 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.02
        gl.outputColorSpace = THREE.SRGBColorSpace
        onReady?.()
      }}
    >
      <color attach="background" args={[P.bg]} />
      <fog attach="fog" args={[P.fog, 42, 96]} />
      <ResponsiveCamera />
      <CameraRig zone={zone} glideKey={glideKey} focus={focus} />
      <ProductHotspots />
      <Lights accent={partner.accent} accentSoft={partner.accentSoft} />
      <Hall />

      <Suspense fallback={null}>
        <LobbyZone partner={partner} onSummon={onSummon} />
        <MineralZone partner={partner} onSelect={onSelect} />
        <EnzymeZone partner={partner} onSelect={onSelect} />
        <ExperienceZone partner={partner} onOpenSimulator={onOpenSimulator} />
        <LoungeZone partner={partner} />
        <Concierge partner={partner} onSummon={onSummon} talking={talking} onNear={onNearStaff} />
      </Suspense>

      {ZONES.map((z) => (
        <ZoneMarker key={z.id} zone={z} active={z.id === zoneId} onGo={onGo} />
      ))}
    </Canvas>
  )
}
