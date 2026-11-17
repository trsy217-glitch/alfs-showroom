import { useMemo } from 'react'
import * as THREE from 'three'
import { edgeShadowTexture, foliageTexture, oakFloorTexture, plasterTexture, shadowTexture } from './textures.js'
import { P, LIGHT } from './palette.js'

// ─────────────────────────────────────────────────────────────
// 넓은 홀 (26 × 22 × 4.9m) — 따뜻한 오크 바닥 · 크림 미장 벽 · 우드 슬랫 천장
//  · 앞면(z=+11) 큰 통창으로 정원이 보이고, 안쪽에 얇은 시어 커튼
//  · 천장 둘레의 은은한 코브 LED, 바닥에는 그 빛이 번지는 느낌
// ─────────────────────────────────────────────────────────────

export const HALL = {
  W: 26,
  D: 22,
  H: 4.9,
  X: 13,
  Z0: -11,
  Z1: 11,
  EYE: 1.62,
}

const { X, Z0, Z1, H, D, W } = HALL

// 창문 (앞면 오른쪽 — 라운지 쪽)
export const WINDOW = { x0: 6.1, x1: 12.7, top: 3.95 }

function WallPanel({ position, size, rotation = [0, 0, 0] }) {
  const plaster = useMemo(() => plasterTexture(), [])
  const map = useMemo(() => {
    const t = plaster.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(Math.max(1, size[0] / 4), Math.max(1, size[1] / 3))
    t.needsUpdate = true
    return t
  }, [plaster, size])
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={map} color="#ffffff" roughness={0.92} metalness={0} />
    </mesh>
  )
}

// 천장 코브 라이트 — 천장 안쪽으로 숨은 따뜻한 빛
function Cove({ position, size = [0.06, 0.05, 8], color = P.led }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function SheerCurtain({ x0, x1, z, y0 = 0.04, y1 = 4.3, folds = 9, opacity = 0.62 }) {
  const geo = useMemo(() => {
    const width = x1 - x0
    const g = new THREE.PlaneGeometry(width, y1 - y0, Math.max(24, folds * 4), 6)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const nx = (x + width / 2) / width
      pos.setZ(i, Math.sin(nx * Math.PI * folds) * 0.055 * (0.55 + (y / (y1 - y0)) * 0.45))
    }
    g.computeVertexNormals()
    return g
  }, [x0, x1, y0, y1, folds])
  return (
    <mesh geometry={geo} position={[(x0 + x1) / 2, (y0 + y1) / 2, z]}>
      <meshStandardMaterial color="#fdf6e9" roughness={0.95} metalness={0} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  )
}

function WindowWall({ z }) {
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: P.glass, roughness: 0.06, metalness: 0.2, transparent: true, opacity: 0.18 }), [])
  const mullionsX = []
  for (let x = WINDOW.x0; x <= WINDOW.x1 + 0.01; x += (WINDOW.x1 - WINDOW.x0) / 4) mullionsX.push(x)
  const w = WINDOW.x1 - WINDOW.x0
  return (
    <group position={[0, 0, z]}>
      <mesh position={[(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.top / 2, 0]}>
        <planeGeometry args={[w, WINDOW.top]} />
        <meshStandardMaterial color={P.glass} roughness={0.05} metalness={0.15} transparent opacity={0.07} side={THREE.DoubleSide} />
      </mesh>
      {/* 창틀 — 오크 */}
      {mullionsX.map((x) => (
        <mesh key={x} position={[x, WINDOW.top / 2, 0.02]}>
          <boxGeometry args={[0.07, WINDOW.top, 0.1]} />
          <meshStandardMaterial color={P.oakMid} roughness={0.55} metalness={0.04} />
        </mesh>
      ))}
      {[0.02, 1.34, WINDOW.top].map((y) => (
        <mesh key={y} position={[(WINDOW.x0 + WINDOW.x1) / 2, y, 0.02]}>
          <boxGeometry args={[w, 0.06, 0.1]} />
          <meshStandardMaterial color={P.oakMid} roughness={0.55} metalness={0.04} />
        </mesh>
      ))}
    </group>
  )
}

function Garden() {
  const foliage = useMemo(() => foliageTexture(), [])
  const map = useMemo(() => {
    const t = foliage.clone()
    t.wrapS = THREE.RepeatWrapping
    t.repeat.set(1.4, 1)
    t.needsUpdate = true
    return t
  }, [foliage])
  return (
    <group position={[0, 0, 0]}>
      {/* 창밖 잔디 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.6, -0.06, 15.5]}>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#b3bd95" roughness={1} />
      </mesh>
      {/* 창 앞 낮은 생울타리 — 유리에 잎 그림자가 비칩니다 */}
      {[6.4, 7.5, 8.7, 9.9, 11.1, 12.2, 13.2].map((x, i) => (
        <mesh key={`hedge-${x}`} position={[x, 0.55 + (i % 2) * 0.12, 12.7]} scale={[1.25, 0.7 + (i % 3) * 0.12, 0.9]}>
          <sphereGeometry args={[0.8, 12, 9]} />
          <meshStandardMaterial color={i % 2 ? '#6f8455' : '#7b8f5f'} roughness={1} flatShading />
        </mesh>
      ))}
      {/* 나무 · 숲 배경 */}
      <mesh position={[8.6, 3.1, 18.6]}>
        <planeGeometry args={[30, 9.6]} />
        <meshBasicMaterial map={map} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function Hall() {
  const shadow = useMemo(() => shadowTexture(), [])
  const edge = useMemo(() => edgeShadowTexture(), [])
  const floor = useMemo(() => {
    const t = oakFloorTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(5.2, 4.6)
    t.needsUpdate = true
    return t
  }, [])

  const slats = useMemo(() => {
    const out = []
    for (let x = -X + 0.4; x <= X - 0.4; x += 0.56) out.push(x)
    return out
  }, [])

  return (
    <group>
      {/* 바닥 — 밝은 오크 플랭크 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={floor} color="#ffffff" roughness={0.52} metalness={0.04} envMapIntensity={0.35} />
      </mesh>

      {/* 벽 접지 그늘 */}
      {[-1, 1].map((s) => (
        <mesh key={`edge-x-${s}`} rotation={[-Math.PI / 2, 0, 0]} position={[s * (X - 1.1), 0.006, 0]}>
          <planeGeometry args={[2.2, D]} />
          <meshBasicMaterial map={edge} transparent opacity={0.75} depthWrite={false} />
        </mesh>
      ))}

      {/* 좌우 벽 */}
      <WallPanel position={[-X + 0.15, H / 2, 0]} size={[0.3, H, D]} />
      <WallPanel position={[X - 0.15, H / 2, 0]} size={[0.3, H, D]} />

      {/* 뒤 벽 · 앞 벽 (창문 · 입구 제외) */}
      <WallPanel position={[0, H / 2, Z0 + 0.15]} size={[W, H, 0.3]} />
      <WallPanel position={[-7.95, H / 2, Z1 - 0.15]} size={[10.1, H, 0.3]} />
      <WallPanel position={[4.45, H / 2, Z1 - 0.15]} size={[3.3, H, 0.3]} />
      <WallPanel position={[(WINDOW.x0 + 13) / 2 - 0.1, (H + WINDOW.top) / 2, Z1 - 0.15]} size={[13 - WINDOW.x0 + 0.2, H - WINDOW.top, 0.3]} />
      <WallPanel position={[0, (H + 3.15) / 2, Z1 - 0.15]} size={[5.6, H - 3.15, 0.3]} />

      {/* 입구 유리문 */}
      <group position={[0, 0, Z1 - 0.12]}>
        <mesh position={[0, 1.55, 0]}>
          <planeGeometry args={[5.2, 3.1]} />
          <meshStandardMaterial color={P.glass} roughness={0.05} metalness={0.15} transparent opacity={0.14} side={THREE.DoubleSide} />
        </mesh>
        {[-2.6, -1.3, 0, 1.3, 2.6].map((x) => (
          <mesh key={x} position={[x, 1.56, 0.02]}>
            <boxGeometry args={[0.06, 3.1, 0.09]} />
            <meshStandardMaterial color={P.oakMid} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 3.12, 0.02]}>
          <boxGeometry args={[5.3, 0.1, 0.12]} />
          <meshStandardMaterial color={P.oakMid} roughness={0.5} />
        </mesh>
        {/* 손잡이 */}
        {[-0.22, 0.22].map((x) => (
          <mesh key={`h-${x}`} position={[x, 1.05, 0.06]}>
            <cylinderGeometry args={[0.022, 0.022, 0.9, 10]} />
            <meshStandardMaterial color={P.brass} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* 창문 · 커튼 · 정원 */}
      <WindowWall z={Z1 - 0.12} />
      <SheerCurtain x0={WINDOW.x0 + 0.2} x1={WINDOW.x1 - 0.1} z={Z1 - 0.42} folds={11} opacity={0.18} />
      <SheerCurtain x0={WINDOW.x0 + 0.1} x1={WINDOW.x0 + 1.1} z={Z1 - 0.5} folds={5} opacity={0.55} />
      <Garden />

      {/* 창으로 들어오는 햇빛 — 바닥에 번지는 밝은 띠 */}
      <mesh rotation={[-Math.PI / 2, 0, 0.16]} position={[8.2, 0.008, 7.2]}>
        <planeGeometry args={[7.4, 7.6]} />
        <meshBasicMaterial map={shadow} color="#fff3d6" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* 걸레받이 — 오크 */}
      {[-1, 1].map((s) => (
        <mesh key={`base-x-${s}`} position={[s * (X - 0.32), 0.07, 0]}>
          <boxGeometry args={[0.06, 0.14, D - 0.2]} />
          <meshStandardMaterial color={P.oakDark} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, Z0 + 0.32]}>
        <boxGeometry args={[W - 0.2, 0.14, 0.06]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={P.ceiling} roughness={0.95} />
      </mesh>

      {/* 천장 오크 슬랫 */}
      {slats.map((x) => (
        <mesh key={`slat-${x}`} position={[x, H - 0.022, 0]}>
          <boxGeometry args={[0.18, 0.042, D - 0.3]} />
          <meshStandardMaterial color="#ece0cc" roughness={0.8} metalness={0.01} />
        </mesh>
      ))}

      {/* 천장 둘레 코브 LED */}
      {[-1, 1].map((s) => (
        <group key={`cove-x-${s}`}>
          <Cove position={[s * (X - 0.55), H - 0.2, 0]} size={[0.08, 0.05, D - 1.2]} />
          <Cove position={[s * (X - 0.9), H - 0.26, 0]} size={[0.4, 0.02, D - 1.6]} color={P.ledSoft} />
        </group>
      ))}
      <Cove position={[0, H - 0.2, Z0 + 0.55]} size={[W - 1.4, 0.05, 0.08]} />
      <Cove position={[0, H - 0.2, Z1 - 0.55]} size={[W - 1.4, 0.05, 0.08]} />

      {/* 바닥에 비치는 코브 빛 (아주 옅게) */}
      {[-1, 1].map((s) => (
        <mesh key={`floor-glow-${s}`} rotation={[-Math.PI / 2, 0, 0]} position={[s * (X - 1.6), 0.005, 0]}>
          <planeGeometry args={[2.6, D - 2]} />
          <meshBasicMaterial map={shadow} color="#ffe6bd" transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

export function Lights({ accent = P.brass, accentSoft = P.goldSoft }) {
  return (
    <group>
      <ambientLight intensity={LIGHT.ambient} color="#fff8ec" />
      <hemisphereLight args={[LIGHT.hemiSky, LIGHT.hemiGround, LIGHT.hemi]} />
      {/* 창으로 들어오는 낮 햇빛 */}
      <directionalLight position={[16, 11, 15]} intensity={LIGHT.sun} color="#fff2d8" />
      <directionalLight position={[-12, 8, -6]} intensity={LIGHT.fill} color="#fdf1e0" />
      <directionalLight position={[0, 6, -14]} intensity={0.22} color="#fff6e6" />

      {/* 존별 은은한 포인트 조명 */}
      <pointLight position={[-2.8, 3.3, 1.4]} intensity={9} distance={11} decay={2} color={P.led} />
      <pointLight position={[-9.6, 2.9, -0.8]} intensity={7} distance={10} decay={2} color="#ffefd6" />
      <pointLight position={[0, 3.1, -8.2]} intensity={7} distance={11} decay={2} color="#fff2dc" />
      <pointLight position={[9.2, 3.2, 1.4]} intensity={8} distance={12} decay={2} color={P.led} />
      <pointLight position={[8.0, 2.6, 3.4]} intensity={3.4} distance={7} decay={2} color={accentSoft} />
      <pointLight position={[-4.6, 2.5, 7.4]} intensity={5} distance={8} decay={2} color="#fff6e4" />
    </group>
  )
}
