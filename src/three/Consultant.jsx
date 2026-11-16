import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PATROL_PATH } from './zones.js'
import { plaqueTexture } from './textures.js'
import { Panel, ShadowDisc } from './parts.jsx'
import { interaction } from './interaction.js'

const SKIN = '#f0d2bd'
const HAIR = '#2b2118'
const COAT = '#fbfdff'
const UNIFORM = '#dfe7ee'
const SHOE = '#1f2937'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerpAngle = (a, b, t) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

// ── 사람 형태 AI 상담 직원 (랩 가운 · 보행 애니메이션 · 시선) ──────────
export function Consultant({ partner, summoned, onSummon, talking }) {
  const camera = useThree((s) => s.camera)
  const root = useRef(null)
  const body = useRef(null)
  const head = useRef(null)
  const legL = useRef(null)
  const legR = useRef(null)
  const kneeL = useRef(null)
  const kneeR = useRef(null)
  const armL = useRef(null)
  const armR = useRef(null)
  const elbowR = useRef(null)
  const badge = useRef(null)
  const [hover, setHover] = useState(false)

  const curve = useMemo(() => {
    const pts = PATROL_PATH.map((p) => new THREE.Vector3(...p))
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.4)
  }, [])

  const state = useRef({
    mode: 'patrol',
    u: 0.06,
    pos: new THREE.Vector3(...PATROL_PATH[0]),
    heading: Math.PI,
    phase: 0,
    wave: 0,
    speed: 0,
  })

  useEffect(() => {
    state.current.mode = summoned ? 'approach' : state.current.mode === 'approach' ? 'patrol' : state.current.mode
    if (!summoned && state.current.mode === 'talk') {
      // 순찰 경로에서 가장 가까운 지점으로 복귀
      let best = 0
      let bestD = Infinity
      for (let i = 0; i < 80; i += 1) {
        const u = i / 80
        const p = curve.getPointAt(u)
        const d = p.distanceTo(state.current.pos)
        if (d < bestD) {
          bestD = d
          best = u
        }
      }
      state.current.u = best
      state.current.mode = 'patrol'
    }
  }, [summoned, curve])

  const badgeTex = useMemo(
    () => plaqueTexture({ key: `badge-${partner.code}`, name: 'AI 상담 직원', price: partner.shortName, note: '눌러서 부르기', accent: partner.accent }),
    [partner],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = state.current
    const g = root.current
    if (!g) return

    const camPos = camera.position
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const standPoint = new THREE.Vector3(camPos.x + forward.x * 3.6, 0, camPos.z + forward.z * 3.6)
    standPoint.x = clamp(standPoint.x, -7.2, 7.2)
    standPoint.z = clamp(standPoint.z, -26.5, 24.5)

    let moveDir = null
    let speed = 0

    if (s.mode === 'approach') {
      const to = standPoint.clone().sub(s.pos)
      to.y = 0
      const dist = to.length()
      if (dist > 0.55) {
        moveDir = to.normalize()
        speed = 1.7
      } else {
        s.mode = 'talk'
      }
    } else if (s.mode === 'patrol') {
      speed = 0.95
      s.u = (s.u + (speed * dt) / curve.getLength()) % 1
      const p = curve.getPointAt(s.u)
      const t = curve.getTangentAt(s.u)
      s.pos.copy(p)
      s.heading = lerpAngle(s.heading, Math.atan2(t.x, t.z), Math.min(1, dt * 6))
      moveDir = t.clone().setY(0).normalize()
    }

    if (moveDir) {
      s.pos.addScaledVector(moveDir, speed * dt)
      s.pos.y = 0
      s.heading = lerpAngle(s.heading, Math.atan2(moveDir.x, moveDir.z), Math.min(1, dt * 7))
    }

    // 손님이 부르면 걸음을 멈추고 손님(카메라) 쪽을 바라봅니다
    if (s.mode === 'talk') {
      const face = Math.atan2(camPos.x - s.pos.x, camPos.z - s.pos.z)
      s.heading = lerpAngle(s.heading, face, Math.min(1, dt * 4))
    }

    // 걷기 위상
    const walking = speed > 0.01
    if (walking) s.phase += dt * (s.mode === 'approach' ? 9.2 : 7.4)
    s.speed += ((walking ? 1 : 0) - s.speed) * Math.min(1, dt * 8)

    g.position.copy(s.pos)
    g.rotation.y = s.heading

    // 다리
    const swing = Math.sin(s.phase) * 0.52 * s.speed
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (kneeL.current) kneeL.current.rotation.x = Math.max(0, -swing) * 1.15 + 0.05 * s.speed
    if (kneeR.current) kneeR.current.rotation.x = Math.max(0, swing) * 1.15 + 0.05 * s.speed

    // 팔 (걷기 스윙 / 인사 손 흔들기)
    const armSwing = Math.sin(s.phase) * 0.42 * s.speed
    if (s.mode === 'talk') {
      s.wave += dt * 6
      if (armR.current) {
        armR.current.rotation.z = -2.15
        armR.current.rotation.x = 0.15
        armR.current.rotation.y = Math.sin(s.wave) * 0.45
      }
      if (elbowR.current) elbowR.current.rotation.x = -0.5
      if (armL.current) {
        armL.current.rotation.x = 0.05
        armL.current.rotation.z = 0.12
      }
    } else {
      if (armR.current) {
        armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, -0.1, Math.min(1, dt * 5))
        armR.current.rotation.x = -armSwing
        armR.current.rotation.y = 0
      }
      if (elbowR.current) elbowR.current.rotation.x = THREE.MathUtils.lerp(elbowR.current.rotation.x, -0.25, Math.min(1, dt * 5))
      if (armL.current) {
        armL.current.rotation.z = 0.1
        armL.current.rotation.x = armSwing
      }
    }

    // 몸통 흔들림 · 호흡
    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(s.phase * 2)) * 0.022 * s.speed + Math.sin(performance.now() / 1200) * 0.006
      body.current.rotation.z = Math.sin(s.phase) * 0.022 * s.speed
    }

    // 시선: 가까이 있으면 카메라 쪽을 봄
    if (head.current) {
      const toCam = new THREE.Vector3(camPos.x - s.pos.x, 0, camPos.z - s.pos.z)
      const dist = toCam.length()
      const desiredYaw = Math.atan2(toCam.x, toCam.z) - s.heading
      const yaw = clamp(((desiredYaw + Math.PI) % (Math.PI * 2)) - Math.PI, -0.85, 0.85)
      const target = s.mode === 'talk' || dist < 5.5 ? yaw : 0
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, target, Math.min(1, dt * 4))
      const pitch = clamp((camPos.y - 1.72) / Math.max(dist, 0.8), -0.35, 0.3)
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -pitch * 0.6, Math.min(1, dt * 4))
    }

    // 머리 위 이름표는 항상 카메라를 향함
    if (badge.current) {
      badge.current.rotation.y = Math.atan2(camPos.x - s.pos.x, camPos.z - s.pos.z) - s.heading
    }

    // 화면 검증용 위치 노출 (3D 아바타를 화면 좌표로 바꿔 둡니다)
    if (typeof window !== 'undefined') {
      const p = new THREE.Vector3(s.pos.x, 1.2, s.pos.z).project(camera)
      window.__ALFS_STAFF__ = {
        x: Math.round((p.x * 0.5 + 0.5) * window.innerWidth),
        y: Math.round((-p.y * 0.5 + 0.5) * window.innerHeight),
        mode: s.mode,
      }
    }
  })

  return (
    <group ref={root} position={PATROL_PATH[0]} scale={0.95}>
      <ShadowDisc radius={0.62} position={[0, 0.012, 0]} opacity={0.75} />

      <group
        ref={body}
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
        {/* 다리 */}
        <group ref={legL} position={[-0.115, 0.9, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.078, 0.07, 0.44, 12]} />
            <meshStandardMaterial color={UNIFORM} roughness={0.75} />
          </mesh>
          <group ref={kneeL} position={[0, -0.44, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.066, 0.058, 0.4, 12]} />
              <meshStandardMaterial color={UNIFORM} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.42, 0.035]}>
              <boxGeometry args={[0.11, 0.07, 0.24]} />
              <meshStandardMaterial color={SHOE} roughness={0.5} />
            </mesh>
          </group>
        </group>
        <group ref={legR} position={[0.115, 0.9, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.078, 0.07, 0.44, 12]} />
            <meshStandardMaterial color={UNIFORM} roughness={0.75} />
          </mesh>
          <group ref={kneeR} position={[0, -0.44, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.066, 0.058, 0.4, 12]} />
              <meshStandardMaterial color={UNIFORM} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.42, 0.035]}>
              <boxGeometry args={[0.11, 0.07, 0.24]} />
              <meshStandardMaterial color={SHOE} roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* 몸통 (랩 가운) */}
        <mesh position={[0, 1.24, 0]}>
          <cylinderGeometry args={[0.235, 0.215, 0.68, 18]} />
          <meshStandardMaterial color={COAT} roughness={0.62} metalness={0.05} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.245, 0.285, 0.36, 20, 1, true]} />
          <meshStandardMaterial color={COAT} roughness={0.62} side={THREE.DoubleSide} />
        </mesh>
        {/* 앞 여밈 · 칼라 */}
        <mesh position={[0, 1.3, 0.2]}>
          <boxGeometry args={[0.035, 0.55, 0.02]} />
          <meshStandardMaterial color={partner.accent} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.53, 0]}>
          <cylinderGeometry args={[0.2, 0.235, 0.09, 18]} />
          <meshStandardMaterial color={partner.accentSoft} roughness={0.5} />
        </mesh>
        {/* 목 */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.062, 0.07, 0.1, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.85} />
        </mesh>

        {/* 이름표 */}
        <mesh position={[0.1, 1.33, 0.225]}>
          <boxGeometry args={[0.1, 0.062, 0.012]} />
          <meshStandardMaterial color={partner.accent} emissive={partner.accentSoft} emissiveIntensity={0.5} />
        </mesh>

        {/* 팔 */}
        <group ref={armL} position={[-0.27, 1.48, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.062, 0.055, 0.36, 12]} />
            <meshStandardMaterial color={COAT} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.052, 0.048, 0.3, 12]} />
            <meshStandardMaterial color={COAT} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.58, 0]}>
            <sphereGeometry args={[0.055, 12, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.85} />
          </mesh>
        </group>
        <group ref={armR} position={[0.27, 1.48, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.062, 0.055, 0.36, 12]} />
            <meshStandardMaterial color={COAT} roughness={0.62} />
          </mesh>
          <group ref={elbowR} position={[0, -0.36, 0]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.052, 0.048, 0.3, 12]} />
              <meshStandardMaterial color={COAT} roughness={0.62} />
            </mesh>
            <mesh position={[0, -0.33, 0]}>
              <sphereGeometry args={[0.055, 12, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.85} />
            </mesh>
          </group>
        </group>

        {/* 머리 */}
        <group ref={head} position={[0, 1.73, 0]}>
          <mesh>
            <sphereGeometry args={[0.168, 22, 18]} />
            <meshStandardMaterial color={SKIN} roughness={0.82} />
          </mesh>
          {/* 머리카락 */}
          <mesh position={[0, 0.012, -0.008]}>
            <sphereGeometry args={[0.176, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
            <meshStandardMaterial color={HAIR} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.0, -0.1]}>
            <sphereGeometry args={[0.14, 18, 14]} />
            <meshStandardMaterial color={HAIR} roughness={0.75} />
          </mesh>
          {/* 눈 */}
          <mesh position={[-0.058, 0.015, 0.155]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0.058, 0.015, 0.155]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          {/* 목걸이 줄 (사원증) */}
          <mesh position={[0, -0.1, 0.12]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.05, 0.16, 0.008]} />
            <meshStandardMaterial color={partner.accent} />
          </mesh>
        </group>
      </group>

      {/* 머리 위 이름표 */}
      <group ref={badge} position={[0, 2.24, 0]}>
        <Panel texture={badgeTex} width={0.9} height={0.32} position={[0, 0, 0]} opacity={hover || talking ? 1 : 0.92} />
      </group>
      {hover && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.72, 32]} />
          <meshBasicMaterial color={partner.accentSoft} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
