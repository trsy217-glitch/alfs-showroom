import { useMemo } from 'react'
import { enzymeProducts, won } from '../config/catalog.js'
import { panelTexture, plaqueTexture, signTexture } from './textures.js'
import { Panel, PhotoPanel, Clickable, Bottle, ShadowDisc } from './parts.jsx'

const X_POS = [-4.4, -2.64, -0.88, 0.88, 2.64, 4.4]

function Pouch({ position, color = '#f7f1e6', accent = '#b45309', label }) {
  const tex = useMemo(
    () =>
      plaqueTexture({
        key: `pouch-${label?.name}-${label?.volume}`,
        name: label?.name ?? '',
        price: label?.volume ?? '',
        note: '',
        accent,
      }),
    [label, accent],
  )
  return (
    <group position={position}>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.5, 0.66, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[0.44, 0.03, 0.11]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0.093]}>
        <planeGeometry args={[0.44, 0.26]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

function Display({ product, x, partner, onSelect }) {
  const plaque = useMemo(
    () =>
      plaqueTexture({
        key: `plaque-${product.id}`,
        name: product.name,
        price: won(product.price),
        note: product.volume,
        accent: partner.accent,
      }),
    [product, partner],
  )
  const isPouch = /포|3일/.test(product.volume) && !/병/.test(product.volume)

  return (
    <group position={[x, 0, -12.4]}>
      <Clickable onClick={() => onSelect(product)} hoverScale={1.03}>
        <mesh position={[0, 0.74, 0.15]}>
          <boxGeometry args={[0.95, 0.14, 0.95]} />
          <meshStandardMaterial color="#eef2f5" roughness={0.3} metalness={0.25} />
        </mesh>

        {/* 제품 사진 (갤러리 벽) */}
        <group position={[0, 2.05, -0.62]}>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[1.28, 1.28, 0.08]} />
            <meshStandardMaterial color="#ffffff" roughness={0.42} metalness={0.2} />
          </mesh>
          <PhotoPanel url={product.image} width={1.16} height={1.16} position={[0, 0, 0]} frame={false} />
        </group>

        {/* 실물 병/파우치 */}
        {isPouch ? (
          <Pouch position={[0, 0.82, 0.2]} label={{ name: product.name, volume: product.badge }} accent={partner.accent} />
        ) : (
          <Bottle
            position={[0, 0.82, 0.2]}
            height={0.62}
            radius={0.145}
            body={product.id === 'zymogen' ? '#dbe7e2' : '#eef4ef'}
            cap={product.id === 'zymogen' ? '#1f2937' : '#ffffff'}
            label={{ name: product.name, volume: product.badge }}
            labelAccent={partner.accent}
            drop={false}
            glow={false}
          />
        )}

        {/* 이름 · 가격 명판 */}
        <group position={[0, 1.09, 0.78]} rotation={[-0.3, 0, 0]}>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.36, 0.46, 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.2} />
          </mesh>
          <Panel texture={plaque} width={1.3} height={0.44} position={[0, 0, 0.012]} />
        </group>
      </Clickable>
      <ShadowDisc radius={0.85} position={[0, 0.012, 0.35]} opacity={0.45} />
    </group>
  )
}

// ── ③ 효소세상 · 데일리 케어 존 (6종 갤러리 월) ──────────────────
export function EnzymeZone({ partner, onSelect }) {
  const sign = useMemo(
    () =>
      signTexture({
        key: 'sign-enzyme',
        brand: 'ENZYME COLLECTION',
        title: '효소세상 · 데일리 케어',
        sub: '발효 효소 6종 진열 · 섭취 방법은 제품 라벨을 따릅니다',
        accent: partner.accent,
      }),
    [partner],
  )

  const notice = useMemo(
    () =>
      panelTexture({
        key: 'enzyme-notice',
        title: '표시 · 구매 안내',
        lines: [
          '가격은 alfs.kr 판매가와 같습니다.',
          '효소세상 6종은 50,000원 이상 무료배송입니다.',
          '제품 사진을 누르면 구성·용량·배송비를 보고 주문으로 넘어갈 수 있습니다.',
        ],
        accent: partner.accent,
        footer: '효능·진단 표현 없이 구성과 용량만 표시합니다',
        titleSize: 52,
        lineSize: 36,
      }),
    [partner],
  )

  return (
    <group>
      {/* 갤러리 월 (제품 뒤 흰 패널) */}
      <mesh position={[0, 2.0, -13.5]}>
        <boxGeometry args={[11.4, 3.9, 0.16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.12, -13.4]}>
        <boxGeometry args={[11.4, 0.06, 0.24]} />
        <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {/* 롱 플린스 */}
      <mesh position={[0, 0.28, -12.4]}>
        <boxGeometry args={[10.6, 0.56, 1.9]} />
        <meshStandardMaterial color="#eef3f6" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.56, -12.4]}>
        <boxGeometry args={[10.8, 0.05, 2.0]} />
        <meshStandardMaterial color="#ffffff" roughness={0.16} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, -11.44]}>
        <boxGeometry args={[10.6, 0.035, 0.04]} />
        <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      {X_POS.map((x) => (
        <mesh key={`div-${x}`} position={[x + 0.875, 0.3, -12.4]}>
          <boxGeometry args={[0.02, 0.62, 1.86]} />
          <meshStandardMaterial color="#dde5ea" roughness={0.5} metalness={0.2} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* 존 간판 */}
      <group position={[0, 3.65, -14.4]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[5.95, 1.75, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.25} />
        </mesh>
        <Panel texture={sign} width={5.85} height={1.67} position={[0, 0, 0.03]} />
      </group>

      {enzymeProducts.map((product, i) => (
        <Display key={product.id} product={product} x={X_POS[i]} partner={partner} onSelect={onSelect} />
      ))}

      {/* 벽면 안내 패널 */}
      <group position={[8.75, 2.15, -9.6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 1.5, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.15} />
        </mesh>
        <Panel texture={notice} width={3.05} height={1.35} position={[0, 0, 0.05]} />
      </group>

      {/* 통로 바닥 강조 */}
      <mesh position={[0, 0.005, -8.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.6, 5.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} transparent opacity={0.45} />
      </mesh>
    </group>
  )
}
