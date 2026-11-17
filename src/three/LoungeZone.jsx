import { useMemo } from 'react'
import * as THREE from 'three'
import { P } from './palette.js'
import { LedStrip } from './parts.jsx'
import {
  BookRow,
  BookStack,
  FramedArt,
  Laptop,
  Plant,
  Rug,
  SideTable,
  SlatWall,
  Stool,
  Vase,
  useLinen,
  useOak,
  useStone,
} from './furniture.jsx'
import { plaqueTexture } from './textures.js'
import { useTextSize } from '../lib/textSize.js'
import { LOUNGE } from './layout.js'

// ── ⑤ 파트너 라운지 — 곡선 린넨 소파 · 원목 커피테이블 · 오크 책장 · 데스크 ──
// 사진(2026-11-17)의 무드: 따뜻한 오크 · 크림 린넨 · 베이지 스톤 · 간접 LED · 통창 자연광
// 2026-11-17 소영 님 지시 ⑤: 라운지가 너무 넓다 → 가구를 한쪽 코너에 모아 축소 (layout.js)

const DEG = THREE.MathUtils.degToRad

// 곡선 소파 부품의 바닥면(도넛 조각) 형상
function ringGeo(rIn, rOut, a0, a1, height) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, rOut, DEG(a0), DEG(a1), false)
  shape.absarc(0, 0, rIn, DEG(a1), DEG(a0), true)
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 2,
    curveSegments: 36,
  })
  g.rotateX(Math.PI / 2)
  g.computeVertexNormals()
  return g
}

// 둥근 모서리 쿠션 형상
function cushionGeo(w, d, r, height) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + d - r)
  shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  shape.lineTo(x + r, y + d)
  shape.quadraticCurveTo(x, y + d, x, y + d - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  shape.closePath()
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    bevelSegments: 3,
    curveSegments: 12,
  })
  g.rotateX(Math.PI / 2)
  g.computeVertexNormals()
  return g
}

function CurvedSofa() {
  const linen = useLinen({ color: '#f2e8d5' })
  const linen2 = useLinen({ color: '#e9dcc4' })
  const oak = useOak({ repeat: [1, 1], color: P.oakDark })

  const geos = useMemo(
    () => ({
      seat: ringGeo(1.5, 2.86, 200, 340, 0.4),
      back: ringGeo(2.86, 3.08, 206, 334, 0.66),
      plinth: ringGeo(1.55, 2.95, 202, 338, 0.16),
      cushion: cushionGeo(0.7, 0.8, 0.13, 0.15),
      backCushion: cushionGeo(0.66, 0.5, 0.12, 0.14),
      arm: cushionGeo(0.34, 0.66, 0.12, 0.42),
    }),
    [],
  )

  const seats = useMemo(() => {
    const out = []
    const n = 6
    for (let i = 0; i < n; i += 1) out.push(203 + (136 / (n - 1)) * i)
    return out
  }, [])

  return (
    <group position={[LOUNGE.sofa.x, 0, LOUNGE.sofa.z]} rotation={[0, LOUNGE.sofa.rot, 0]} scale={[LOUNGE.sofa.scale, LOUNGE.sofa.yScale, LOUNGE.sofa.scale]}>
      {/* 오크 받침 + 바닥 그림자 */}
      <mesh geometry={geos.plinth} position={[0, 0.16, 0]}>
        <meshStandardMaterial {...oak} />
      </mesh>
      {/* 좌판 */}
      <mesh geometry={geos.seat} position={[0, 0.42, 0]}>
        <meshStandardMaterial {...linen} />
      </mesh>
      {/* 등받이 띠 */}
      <mesh geometry={geos.back} position={[0, 1.06, 0]}>
        <meshStandardMaterial {...linen} />
      </mesh>
      {/* 좌방석 */}
      {seats.map((a, i) => {
        const r = 2.18
        return (
          <mesh
            key={`s-${a}`}
            geometry={geos.cushion}
            position={[Math.cos(DEG(a)) * r, 0.58 + (i % 2) * 0.01, Math.sin(DEG(a)) * r]}
            rotation={[0, -DEG(a) + Math.PI / 2, 0]}
          >
            <meshStandardMaterial {...(i % 2 ? linen2 : linen)} />
          </mesh>
        )
      })}
      {/* 등쿠션 */}
      {seats.map((a, i) => {
        const r = 2.62
        return (
          <mesh
            key={`b-${a}`}
            geometry={geos.backCushion}
            position={[Math.cos(DEG(a)) * r, 0.82, Math.sin(DEG(a)) * r]}
            rotation={[0, -DEG(a) + Math.PI / 2, 0]}
          >
            <meshStandardMaterial {...linen2} />
          </mesh>
        )
      })}
      {/* 양 끝 팔걸이 */}
      {[200, 340].map((a) => (
        <mesh
          key={`a-${a}`}
          geometry={geos.arm}
          position={[Math.cos(DEG(a)) * 2.24, 0.64, Math.sin(DEG(a)) * 2.24]}
          rotation={[0, -DEG(a) + Math.PI / 2, 0]}
        >
          <meshStandardMaterial {...linen} />
        </mesh>
      ))}
      {/* 접어 둔 담요 */}
      <mesh position={[Math.cos(DEG(318)) * 2.1, 0.62, Math.sin(DEG(318)) * 2.1]} rotation={[0, -DEG(318) + Math.PI / 2, 0]} scale={[0.32, 0.06, 0.42]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cdbda0" roughness={0.95} />
      </mesh>
    </group>
  )
}

function CoffeeTable() {
  const oak = useOak({ repeat: [2, 1], color: P.oakLight })
  return (
    <group position={[LOUNGE.table.x, 0, LOUNGE.table.z]} scale={LOUNGE.table.scale}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.07, 48]} />
        <meshStandardMaterial {...oak} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.4, 0.48, 0.38, 32]} />
        <meshStandardMaterial color={P.oakMid} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.5, 0.56, 0.03, 32]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>
      <BookStack position={[-0.2, 0.44, 0.2]} count={2} rotation={0.5} />
      <mesh position={[0.26, 0.442, -0.1]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.44, 0.018, 0.3]} />
        <meshStandardMaterial color="#f7f1e3" roughness={0.9} />
      </mesh>
      <mesh position={[0.26, 0.445, -0.1]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.42, 0.004, 0.02]} />
        <meshStandardMaterial color="#d9cbb0" roughness={0.9} />
      </mesh>
      <mesh position={[0.02, 0.48, 0.46]}>
        <cylinderGeometry args={[0.055, 0.045, 0.08, 18]} />
        <meshStandardMaterial color="#efe6d5" roughness={0.5} />
      </mesh>
    </group>
  )
}

// 책장 한 칸 — 오크 프레임 + 5단 선반 + 책 + 간접 LED
function ShelfUnit({ width = 2.1, height = 3.05, seed = 1 }) {
  const oak = useOak({ repeat: [2, 1], color: P.oakLight })
  const oakDark = useOak({ repeat: [1, 1], color: P.oakMid })
  const levels = [0.66, 1.2, 1.74, 2.28, 2.82]
  return (
    <group>
      {/* 등판 */}
      <mesh position={[0, height / 2, -0.17]}>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial color={P.oakDeep} roughness={0.8} />
      </mesh>
      {/* 옆판 */}
      {[-width / 2 + 0.03, width / 2 - 0.03].map((x) => (
        <mesh key={x} position={[x, height / 2, 0.02]}>
          <boxGeometry args={[0.06, height, 0.44]} />
          <meshStandardMaterial {...oak} />
        </mesh>
      ))}
      {/* 하부 수납장 */}
      <mesh position={[0, 0.28, 0.03]}>
        <boxGeometry args={[width - 0.1, 0.56, 0.42]} />
        <meshStandardMaterial {...oakDark} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={`h${x}`} position={[x, 0.36, 0.24]}>
          <boxGeometry args={[0.2, 0.02, 0.02]} />
          <meshStandardMaterial color={P.brass} metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
      {/* 선반 5단 + 책 */}
      {levels.map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, 0.02]}>
            <boxGeometry args={[width - 0.08, 0.045, 0.44]} />
            <meshStandardMaterial {...oak} />
          </mesh>
          <mesh position={[0, y - 0.026, 0.2]}>
            <boxGeometry args={[width - 0.22, 0.012, 0.02]} />
            <meshBasicMaterial color={P.ledSoft} toneMapped={false} />
          </mesh>
          <BookRow position={[0, y + 0.19, -0.06]} width={width - 0.24} height={0.34} seed={seed * 7 + i} />
          {i % 2 === 0 && <Vase position={[width * 0.26, y + 0.03, 0.1]} scale={0.5} color="#e3d7c1" />}
        </group>
      ))}
      {/* 상단 LED 코브 */}
      <LedStrip position={[0, height - 0.06, 0.2]} size={[width - 0.2, 0.02, 0.03]} intensity={1.2} />
    </group>
  )
}

function BookshelfWall() {
  // 오른벽(x=12.7)을 따라 이어지는 책장 — 라운지 축소에 맞춰 3칸으로 줄였습니다
  const units = LOUNGE.shelfZ.map((z, i) => ({ z, rot: (i - 1) * 0.07, w: 1.8, seed: i + 1 }))
  return (
    <group>
      {units.map((u) => (
        <group key={u.z} position={[LOUNGE.shelfX, 0, u.z]} rotation={[0, -Math.PI / 2 + u.rot, 0]}>
          <ShelfUnit width={u.w} seed={u.seed} />
        </group>
      ))}
      {/* 책장 상단 마감 · 벽면 LED 워시 */}
      <mesh position={[LOUNGE.shelfX + 0.04, 3.16, 0.55]}>
        <boxGeometry args={[0.5, 0.08, 5.4]} />
        <meshStandardMaterial color={P.oakMid} roughness={0.65} />
      </mesh>
      <LedStrip position={[LOUNGE.shelfX - 0.22, 3.1, 0.55]} size={[0.05, 0.02, 5.0]} intensity={1.3} />
    </group>
  )
}

function Desk({ partner }) {
  const oak = useOak({ repeat: [2, 1], color: P.oakLight })
  const ts = useTextSize()
  const card = useMemo(
    () =>
      plaqueTexture({
        key: `lounge-desk-${partner.code}`,
        name: '파트너 라운지',
        price: partner.shortName,
        note: '상담 · 시음 · 계약',
        accent: partner.accent,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )
  return (
    <group position={[LOUNGE.desk.x, 0, LOUNGE.desk.z]} rotation={[0, LOUNGE.desk.rot, 0]}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.2, 0.07, 0.84]} />
        <meshStandardMaterial {...oak} />
      </mesh>
      {[-1.03, 1.03].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]}>
          <boxGeometry args={[0.07, 0.75, 0.84]} />
          <meshStandardMaterial {...oak} />
        </mesh>
      ))}
      <Laptop position={[-0.15, 0.79, 0.02]} rotation={0.12} />
      <BookStack position={[0.62, 0.79, -0.06]} count={2} rotation={-0.3} />
      <Vase position={[0.84, 0.79, 0.16]} scale={0.65} color="#e7dcc6" />
      <mesh position={[0.0, 0.82, 0.32]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.6, 0.24, 0.03]} />
        <meshStandardMaterial color="#fbf5e8" roughness={0.45} />
      </mesh>
      <mesh position={[0.0, 0.823, 0.34]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.56, 0.21]} />
        <meshBasicMaterial map={card} transparent toneMapped={false} />
      </mesh>
      <Stool position={[-0.1, 0, -0.82]} />
    </group>
  )
}

function FloorLamp({ position = [0, 0, 0] }) {
  const linen = useLinen({ color: '#f6ecda' })
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.19, 0.21, 0.04, 20]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.6, 10]} />
        <meshStandardMaterial color={P.brass} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.42, 28, 1, true]} />
        <meshStandardMaterial {...linen} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.08, 14, 10]} />
        <meshBasicMaterial color="#ffeac9" toneMapped={false} />
      </mesh>
    </group>
  )
}

export function LoungeZone({ partner }) {
  const stone = useStone({ color: '#ffffff' })
  return (
    <group>
      {/* 도톰한 울 러그 — 소파·테이블·데스크를 한 번에 묶는 아늑한 크기 */}
      <Rug position={[LOUNGE.rug.x, 0, LOUNGE.rug.z]} size={[LOUNGE.rug.w, LOUNGE.rug.d]} rotation={LOUNGE.rug.rot} />

      {/* 곡선 린넨 소파 */}
      <CurvedSofa />

      {/* 원목 커피테이블 */}
      <CoffeeTable />

      {/* 오크 책장 벽 */}
      <BookshelfWall />

      {/* 통창 옆 오크 데스크 + 노트북 */}
      <Desk partner={partner} />

      {/* 액자 — 창가 왼쪽 벽 */}
      <FramedArt position={[LOUNGE.art[0], 2.05, LOUNGE.art[1]]} rotation={[0, Math.PI, 0]} width={1.3} height={1.54} variant={2} />

      {/* 스탠드 조명 · 화분 · 사이드 테이블 */}
      <FloorLamp position={[LOUNGE.lamp[0], 0, LOUNGE.lamp[1]]} />
      <Plant position={[LOUNGE.plantTall[0], 0, LOUNGE.plantTall[1]]} scale={1.0} tall />
      <Plant position={[LOUNGE.plantSmall[0], 0, LOUNGE.plantSmall[1]]} scale={0.95} />
      <SideTable position={[LOUNGE.sideTable[0], 0, LOUNGE.sideTable[1]]} radius={0.32} height={0.46} />
      <Vase position={[LOUNGE.sideTable[0], 0.48, LOUNGE.sideTable[1]]} scale={0.95} color="#e2d5bd" />

      {/* 소파 뒤 슬랫 패널 (벽 마감) */}
      <SlatWall position={[LOUNGE.slat[0], 0, LOUNGE.slat[1]]} rotation={[0, -Math.PI / 2, 0]} width={2.2} height={2.6} gap={0.2} />

      {/* 라운지 입구 바닥 표시 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LOUNGE.marker[0], 0.007, LOUNGE.marker[1]]}>
        <ringGeometry args={[1.5, 1.56, 48]} />
        <meshStandardMaterial {...stone} color={P.stone} roughness={0.5} />
      </mesh>
    </group>
  )
}
