import { useMemo } from 'react'
import { enzymeProducts, won } from '../config/catalog.js'
import { panelTexture, plaqueTexture, signTexture } from './textures.js'
import { Panel, PhotoPanel, Clickable, Bottle, ShadowDisc } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'
import { ENZYME_X as X_POS } from './zones.js'

function Pouch({ position, color = '#f8f1e2', accent = P.gold, label }) {
  const ts = useTextSize()
  const tex = useMemo(
    () =>
      plaqueTexture({
        key: `pouch-${label?.name}-${label?.volume}`,
        name: label?.name ?? '',
        price: label?.volume ?? '',
        note: '',
        accent,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [label, accent, ts],
  )
  return (
    <group position={position}>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.5, 0.66, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[0.44, 0.03, 0.11]} />
        <meshStandardMaterial color={P.brass} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0.093]}>
        <planeGeometry args={[0.44, 0.26]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

function Display({ product, x, partner, onSelect }) {
  const ts = useTextSize()
  const plaque = useMemo(
    () =>
      plaqueTexture({
        key: `plaque-${product.id}`,
        name: product.name,
        price: won(product.price),
        note: product.volume,
        accent: partner.accent,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, partner, ts],
  )
  const isPouch = /포|3일/.test(product.volume) && !/병/.test(product.volume)

  return (
    <group position={[x, 0, -12.4]}>
      <Clickable onClick={() => onSelect(product)} hoverScale={1.03}>
        <mesh position={[0, 0.74, 0.15]}>
          <boxGeometry args={[0.95, 0.14, 0.95]} />
          <meshStandardMaterial color="#fbf4e7" roughness={0.28} metalness={0.22} />
        </mesh>
        <mesh position={[0, 0.815, 0.15]}>
          <boxGeometry args={[0.97, 0.006, 0.97]} />
          <meshStandardMaterial color={P.brass} metalness={0.85} roughness={0.24} />
        </mesh>

        {/* 제품 실물 사진 (갤러리 벽) */}
        <group position={[0, 2.12, -0.62]}>
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[1.5, 1.5, 0.08]} />
            <meshStandardMaterial color="#fdf8ee" roughness={0.4} metalness={0.18} />
          </mesh>
          <PhotoPanel url={product.image} width={1.38} height={1.38} position={[0, 0, 0]} frame={false} />
          <mesh position={[0, -0.72, 0.02]}>
            <boxGeometry args={[1.42, 0.018, 0.02]} />
            <meshStandardMaterial color={P.brass} emissive={P.goldSoft} emissiveIntensity={0.45} metalness={0.8} roughness={0.25} />
          </mesh>
        </group>

        {/* 실물 병/파우치 */}
        {isPouch ? (
          <Pouch position={[0, 0.82, 0.2]} label={{ name: product.name, volume: product.badge }} accent={partner.accent} />
        ) : (
          <Bottle
            position={[0, 0.82, 0.2]}
            height={0.62}
            radius={0.145}
            body={product.id === 'zymogen' ? '#e6eee6' : '#f3f7f1'}
            cap={product.id === 'zymogen' ? '#8c6e3e' : '#e9d6ab'}
            label={{ name: product.name, volume: product.badge }}
            labelAccent={partner.accent}
            drop={false}
            glow={false}
          />
        )}

        {/* 이름 · 가격 명판 */}
        <group position={[0, 1.11, 0.78]} rotation={[-0.3, 0, 0]}>
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.42, 0.46, 0.04]} />
            <meshStandardMaterial color="#fffdf8" roughness={0.32} metalness={0.2} />
          </mesh>
          <Panel texture={plaque} width={1.36} height={0.44} position={[0, 0, 0.012]} />
        </group>
      </Clickable>
      <ShadowDisc radius={0.85} position={[0, 0.012, 0.35]} opacity={0.34} />
    </group>
  )
}

// ── ③ 효소세상 · 데일리 케어 존 (6종 갤러리 월) ──────────────────
export function EnzymeZone({ partner, onSelect }) {
  const ts = useTextSize()

  const sign = useMemo(
    () =>
      signTexture({
        key: 'sign-enzyme',
        brand: 'AL.F.S  COLLECTION',
        title: '효소세상 · 데일리 케어',
        sub: '발효 효소 6종 진열 · 섭취 방법은 제품 라벨을 따릅니다',
        accent: partner.accent,
        theme: 'light',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  return (
    <group>
      {/* 갤러리 월 (제품 뒤 크림 석재 패널) */}
      <mesh position={[0, 2.0, -13.5]}>
        <boxGeometry args={[11.4, 3.9, 0.16]} />
        <meshStandardMaterial color="#fdf8ec" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.12, -13.4]}>
        <boxGeometry args={[11.4, 0.04, 0.22]} />
        <meshStandardMaterial color={P.gold} emissive={P.goldSoft} emissiveIntensity={0.5} metalness={0.7} toneMapped={false} />
      </mesh>

      {/* 롱 플린스 */}
      <mesh position={[0, 0.28, -12.4]}>
        <boxGeometry args={[10.6, 0.56, 1.9]} />
        <meshStandardMaterial color="#f8f0e2" roughness={0.28} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.56, -12.4]}>
        <boxGeometry args={[10.8, 0.04, 2.0]} />
        <meshStandardMaterial color={P.stoneTop} roughness={0.14} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.2, -11.44]}>
        <boxGeometry args={[10.6, 0.028, 0.03]} />
        <meshStandardMaterial color={P.brass} emissive={P.goldSoft} emissiveIntensity={0.35} metalness={0.8} toneMapped={false} />
      </mesh>
      {X_POS.map((x) => (
        <mesh key={`div-${x}`} position={[x + 0.875, 0.3, -12.4]}>
          <boxGeometry args={[0.018, 0.62, 1.86]} />
          <meshStandardMaterial color="#e8dbc4" roughness={0.5} metalness={0.2} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* 존 간판 */}
      <group position={[0, 3.7, -14.4]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[6.05, 1.85, 0.1]} />
          <meshStandardMaterial color="#fbf3e4" roughness={0.38} metalness={0.2} />
        </mesh>
        <Panel texture={sign} width={5.95} height={1.77} position={[0, 0, 0.03]} />
      </group>

      {enzymeProducts.map((product, i) => (
        <Display key={product.id} product={product} x={X_POS[i]} partner={partner} onSelect={onSelect} />
      ))}

      {/* 벽면 안내 패널 */}
      <group position={[8.75, 2.15, -9.6]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 1.5, 0.08]} />
          <meshStandardMaterial color="#fdf8ee" roughness={0.42} metalness={0.15} />
        </mesh>
        <Panel texture={notice} width={3.05} height={1.35} position={[0, 0, 0.05]} />
      </group>

      {/* 통로 바닥 강조 */}
      <mesh position={[0, 0.005, -8.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.6, 5.4]} />
        <meshStandardMaterial color="#fffdf7" roughness={0.35} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}
