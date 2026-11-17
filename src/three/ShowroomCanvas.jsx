import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { CameraRig, ResponsiveCamera } from './Controls.jsx'
import { Hall, Lights } from './Hall.jsx'
import { LobbyZone } from './LobbyZone.jsx'
import { MineralZone } from './MineralZone.jsx'
import { EnzymeZone } from './EnzymeZone.jsx'
import { ExperienceZone } from './ExperienceZone.jsx'
import { LoungeZone } from './LoungeZone.jsx'
import { Concierge } from './Concierge.jsx'
import { ZoneMarker } from './parts.jsx'
import { ZONES, zoneById } from './zones.js'
import { P } from './palette.js'

export function ShowroomCanvas({
  partner,
  zoneId,
  glideKey,
  focus,
  narrow,
  talking,
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
