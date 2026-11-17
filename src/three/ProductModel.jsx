import { useMemo } from 'react'
import * as THREE from 'three'
import { productPackTexture } from './textures.js'
import { P } from './palette.js'

// ─────────────────────────────────────────────────────────────
// 상품 인스펙터용 입체 모델 (Three.js 절차 생성)
//  · 실물 누끼 사진 위에 라벨을 얹은 병 · 박스 · 파우치를 3D로 세워,
//    드래그하면 360° 어느 각도에서나 입체로 볼 수 있습니다.
//  · 제품마다 구성(병 수 · 파우치 수 · 박스)을 달리해 실제 구성과 맞춥니다.
// ─────────────────────────────────────────────────────────────

const SPEC = {
  oryun: {
    kind: 'bottle',
    h: 1.86,
    r: 0.33,
    body: '#e8efe7',
    liquid: '#cdb26e',
    cap: '#c9a86a',
    accent: '#2f6b5f',
    note: '물에 10~30배 희석해 마시는 원액',
  },
  zymogen: {
    kind: 'boxbottle',
    h: 1.06,
    r: 0.22,
    body: '#f3eee2',
    liquid: '#8c4a2f',
    cap: '#8a6a3c',
    accent: '#8c4a2f',
    box: { w: 0.78, h: 0.52, d: 0.5 },
    note: '100ml × 10병',
  },
  cleanbiome: {
    kind: 'bottles',
    h: 1.0,
    r: 0.19,
    count: 3,
    body: '#f4f0e5',
    liquid: '#e0903f',
    cap: '#c9a15c',
    accent: '#d9832f',
    note: '100ml × 6병',
  },
  cleanbiome1: {
    kind: 'bottle',
    h: 1.0,
    r: 0.21,
    body: '#f4f0e5',
    liquid: '#e0903f',
    cap: '#c9a15c',
    accent: '#d9832f',
    note: '100ml × 1병',
  },
  fit30: {
    kind: 'set',
    accent: '#b08d57',
    bottles: 3,
    bottleH: 0.62,
    pouches: 5,
    box: { w: 1.02, h: 0.56, d: 0.72 },
    note: '엔자임밀 9포 + 클린바이옴 3병',
  },
  fit3: {
    kind: 'set',
    accent: '#9d6b4a',
    bottles: 1,
    bottleH: 0.58,
    pouches: 3,
    box: { w: 0.88, h: 0.46, d: 0.62 },
    note: '3일 분량 구성',
  },
  bioenergy: {
    kind: 'set',
    accent: '#5f7d55',
    bottles: 0,
    pouches: 7,
    box: { w: 0.98, h: 0.5, d: 0.66 },
    note: '200ml × 8포',
  },
}

function useLabel(product, spec) {
  return useMemo(
    () =>
      productPackTexture({
        key: `insp-${product.id}-${product.price}`,
        name: product.name,
        volume: product.volume,
        note: spec.note,
        accent: spec.accent,
      }),
    [product.id, product.name, product.volume, product.price, spec],
  )
}

// 유리·플라스틱 병 — 몸통 + 액체 + 어깨 + 캡 + 라벨 띠
function Bottle({ spec, label, position = [0, 0, 0], rotation = 0 }) {
  const { h, r } = spec
  const bodyH = h * 0.78
  const shoulderH = h * 0.07
  const neckH = h * 0.05
  const capH = h * 0.1

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* 바닥 금속 링 */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[r * 1.02, r * 1.04, 0.024, 40]} />
        <meshStandardMaterial color={spec.cap} metalness={0.55} roughness={0.35} />
      </mesh>

      {/* 액체 — 병 안쪽에 살짝 작게 */}
      <mesh position={[0, bodyH * 0.5 + 0.02, 0]}>
        <cylinderGeometry args={[r * 0.9, r * 0.87, bodyH * 0.9, 36]} />
        <meshStandardMaterial color={spec.liquid} roughness={0.35} metalness={0.05} transparent opacity={0.9} />
      </mesh>

      {/* 투명 몸통 */}
      <mesh position={[0, bodyH / 2 + 0.02, 0]}>
        <cylinderGeometry args={[r, r * 0.96, bodyH, 48, 1, true]} />
        <meshStandardMaterial
          color={spec.body}
          roughness={0.12}
          metalness={0.08}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 어깨 · 목 · 캡 */}
      <mesh position={[0, bodyH + shoulderH / 2 + 0.02, 0]}>
        <cylinderGeometry args={[r * 0.5, r, shoulderH, 40]} />
        <meshStandardMaterial color={spec.body} roughness={0.16} metalness={0.08} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, bodyH + shoulderH + neckH / 2 + 0.02, 0]}>
        <cylinderGeometry args={[r * 0.5, r * 0.5, neckH, 32]} />
        <meshStandardMaterial color={spec.body} roughness={0.18} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, bodyH + shoulderH + neckH + capH / 2 + 0.02, 0]}>
        <cylinderGeometry args={[r * 0.56, r * 0.56, capH, 40]} />
        <meshStandardMaterial color={spec.cap} roughness={0.32} metalness={0.45} />
      </mesh>
      <mesh position={[0, bodyH + shoulderH + neckH + capH * 0.55 + 0.02, 0]}>
        <cylinderGeometry args={[r * 0.575, r * 0.575, capH * 0.1, 40]} />
        <meshStandardMaterial color="#8c6e3e" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 라벨 띠 — 앞면을 감싸는 인쇄면 */}
      {label && (
        <mesh position={[0, bodyH * 0.48 + 0.02, 0]}>
          <cylinderGeometry args={[r * 1.014, r * 1.014, bodyH * 0.52, 48, 1, true, -1.15, 2.3]} />
          <meshStandardMaterial map={label} roughness={0.5} metalness={0.02} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// 제품 상자 — 앞면에 라벨
function Carton({ spec, label, position = [0, 0, 0], rotation = 0 }) {
  const { w, h, d } = spec.box
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial attach="material-0" color="#f6eedd" roughness={0.62} />
        <meshStandardMaterial attach="material-1" color="#f1e7d3" roughness={0.62} />
        <meshStandardMaterial attach="material-2" color="#fbf5e8" roughness={0.6} />
        <meshStandardMaterial attach="material-3" color="#e9ddc6" roughness={0.7} />
        <meshStandardMaterial attach="material-4" map={label} roughness={0.5} />
        <meshStandardMaterial attach="material-5" color="#f3ead8" roughness={0.62} />
      </mesh>
      <mesh position={[0, h + 0.008, 0]}>
        <boxGeometry args={[w + 0.012, 0.016, d + 0.012]} />
        <meshStandardMaterial color={spec.accent} metalness={0.3} roughness={0.45} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

// 파우치 — 납작한 봉지 + 상단 실링 + 라벨
function Pouch({ label, spec, position = [0, 0, 0], rotation = 0, w = 0.26, h = 0.36 }) {
  const d = 0.055
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#fbf4e4" roughness={0.62} metalness={0.02} />
      </mesh>
      <mesh position={[0, h + 0.018, 0]}>
        <boxGeometry args={[w * 0.98, 0.04, d * 0.7]} />
        <meshStandardMaterial color={spec.accent} roughness={0.5} metalness={0.15} />
      </mesh>
      {label && (
        <mesh position={[0, h * 0.52, d / 2 + 0.0015]}>
          <planeGeometry args={[w * 0.78, h * 0.56]} />
          <meshBasicMaterial map={label} toneMapped={false} transparent />
        </mesh>
      )}
    </group>
  )
}

function SetModel({ product, spec, label }) {
  // 상자 뒤 + 파우치 부챗살 + 병 — 한 세트로 보이게 배치
  const pouchCount = spec.pouches
  const bottles = spec.bottles
  const spread = 0.16
  return (
    <group position={[-0.12, 0, 0]}>
      <Carton spec={spec} label={label} position={[-0.16, 0, -0.22]} rotation={-0.18} />
      {Array.from({ length: pouchCount }).map((_, i) => {
        const t = pouchCount > 1 ? i / (pouchCount - 1) - 0.5 : 0
        return (
          <Pouch
            key={`p${i}`}
            label={label}
            spec={spec}
            position={[0.28 + t * spread * pouchCount, 0, 0.34 - Math.abs(t) * 0.1]}
            rotation={-t * 0.34}
            w={0.24}
            h={0.34}
          />
        )
      })}
      {Array.from({ length: bottles }).map((_, i) => (
        <Bottle
          key={`b${i}`}
          spec={{
            ...spec,
            h: spec.bottleH ?? 0.6,
            r: 0.145,
            body: '#f1efe4',
            liquid: '#e0c78e',
            cap: '#c9a86a',
          }}
          label={null}
          position={[0.44 + i * 0.2, 0, -0.05 - i * 0.04]}
          rotation={i * 0.4}
        />
      ))}
    </group>
  )
}

export function ProductModel({ product }) {
  const spec = SPEC[product.id] ?? SPEC.oryun
  const label = useLabel(product, spec)

  if (spec.kind === 'set') return <SetModel product={product} spec={spec} label={label} />
  if (spec.kind === 'boxbottle') {
    return (
      <group>
        <Carton spec={spec} label={label} position={[-0.22, 0, -0.18]} rotation={-0.2} />
        <Bottle spec={spec} label={label} position={[0.3, 0, 0.12]} rotation={0.1} />
      </group>
    )
  }
  if (spec.kind === 'bottles') {
    return (
      <group>
        {Array.from({ length: spec.count }).map((_, i) => (
          <Bottle
            key={i}
            spec={spec}
            label={label}
            position={[(i - (spec.count - 1) / 2) * 0.46, 0, (i % 2) * 0.05]}
            rotation={(i - (spec.count - 1) / 2) * 0.22}
          />
        ))}
      </group>
    )
  }
  return <Bottle spec={spec} label={label} />
}

// 모델의 대략적인 크기 — 카메라가 상품 전체를 담도록
const SET_WIDTH = { fit30: 1.55, fit3: 1.25, bioenergy: 1.45 }

export function modelSize(product) {
  const spec = SPEC[product.id] ?? SPEC.oryun
  if (spec.kind === 'set') {
    return { h: Math.max(spec.box.h, spec.bottleH ?? 0.6) + 0.2, w: SET_WIDTH[product.id] ?? 1.4 }
  }
  if (spec.kind === 'bottles') return { h: spec.h, w: spec.r * 2 * (spec.count + 1.4) }
  if (spec.kind === 'boxbottle') return { h: spec.h, w: 1.0 }
  return { h: spec.h, w: spec.r * 2.2 }
}

export function modelHeight(product) {
  return modelSize(product).h
}
