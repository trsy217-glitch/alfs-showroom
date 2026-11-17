import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { CameraRig, ResponsiveCamera } from './Controls.jsx'
import { Hall, Lights } from './Hall.jsx'
import { LobbyZone } from './LobbyZone.jsx'
import { MineralZone } from './MineralZone.jsx'
import { EnzymeZone } from './EnzymeZone.jsx'
import { SimulatorZone } from './SimulatorZone.jsx'
import { Concierge } from './Concierge.jsx'
import { ZoneMarker } from './parts.jsx'
import { ZONES, zoneById } from './zones.js'
import { P } from './palette.js'

export function ShowroomCanvas({
  partner,
  zoneId,
  glideKey,
  focus,
  summoned,
  talking,
  onGo,
  onSelect,
  onSummon,
  onOpenSimulator,
  onReady,
}) {
  const zone = useMemo(() => zoneById(zoneId), [zoneId])

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 1.9, 24.2], fov: 52, near: 0.1, far: 150 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.9
        gl.outputColorSpace = THREE.SRGBColorSpace
        onReady?.()
      }}
    >
      <color attach="background" args={[P.bg]} />
      <fog attach="fog" args={[P.fog, 62, 132]} />
      <ResponsiveCamera />
      <CameraRig zone={zone} glideKey={glideKey} focus={focus} />
      <Lights accent={partner.accent} accentSoft={partner.accentSoft} />
      <Hall />

      <Suspense fallback={null}>
        <LobbyZone partner={partner} onSummon={onSummon} />
        <MineralZone partner={partner} onSelect={onSelect} />
        <EnzymeZone partner={partner} onSelect={onSelect} />
        <SimulatorZone partner={partner} onOpenSimulator={onOpenSimulator} />
        <Concierge partner={partner} onSummon={onSummon} talking={talking} />
      </Suspense>

      {ZONES.map((z) => (
        <ZoneMarker key={z.id} zone={z} active={z.id === zoneId} onGo={onGo} />
      ))}
    </Canvas>
  )
}
