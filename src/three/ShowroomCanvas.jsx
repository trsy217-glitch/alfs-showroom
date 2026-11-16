import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { CameraRig, ResponsiveCamera } from './Controls.jsx'
import { Hall, Lights } from './Hall.jsx'
import { LobbyZone } from './LobbyZone.jsx'
import { MineralZone } from './MineralZone.jsx'
import { EnzymeZone } from './EnzymeZone.jsx'
import { SimulatorZone } from './SimulatorZone.jsx'
import { Consultant } from './Consultant.jsx'
import { ZoneMarker } from './parts.jsx'
import { ZONES, zoneById } from './zones.js'

export function ShowroomCanvas({
  partner,
  zoneId,
  glideKey,
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
      camera={{ position: [0, 1.9, 24.2], fov: 52, near: 0.1, far: 140 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
        gl.outputColorSpace = THREE.SRGBColorSpace
        onReady?.()
      }}
    >
      <color attach="background" args={['#e8eef2']} />
      <fog attach="fog" args={['#e8eef2', 46, 110]} />
      <ResponsiveCamera />
      <CameraRig zone={zone} glideKey={glideKey} />
      <Lights accent={partner.accent} accentSoft={partner.accentSoft} />
      <Hall />

      <Suspense fallback={null}>
        <LobbyZone partner={partner} onSummon={onSummon} />
        <MineralZone partner={partner} onSelect={onSelect} />
        <EnzymeZone partner={partner} onSelect={onSelect} />
        <SimulatorZone partner={partner} onOpenSimulator={onOpenSimulator} />
      </Suspense>

      {ZONES.map((z) => (
        <ZoneMarker key={z.id} zone={z} active={z.id === zoneId} onGo={onGo} />
      ))}

      <Consultant partner={partner} summoned={summoned} talking={talking} onSummon={onSummon} />
    </Canvas>
  )
}
