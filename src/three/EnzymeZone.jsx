import { useMemo } from 'react'
import { enzymeProducts, won } from '../config/catalog.js'
import { panelTexture, plaqueTexture, signTexture } from './textures.js'
import { Panel, Clickable, CutoutStand, ShadowDisc, LedStrip } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'
import { ENZYME_Z, ENZYME_X } from './zones.js'
import { Plant, SlatWall, Vase, useOak, useStone } from './furniture.jsx'

// ── ③ 효소세상 컬렉션 — 오크 진열 벤치 위 누끼 6종 ─────────────────
const CUTOUT = {
  fit30: { url: '/images/cutout/fit30.webp', h: 0.6 },
  fit3: { url: '/images/cutout/fit3.webp', h: 0.58 },
  bioenergy: { url: '/images/cutout/bioenergy.webp', h: 0.55 },
  zymogen: { url: '/images/cutout/zymogen.webp', h: 0.42 },
  cleanbiome: { url: '/images/cutout/cleanbiome6.webp', h: 0.6 },
  cleanbiome1: { url: '/images/cutout/cleanbiome1.webp', h: 0.48 },
}

function ProductStand({ product, partner, z, onSelect }) {
  const ts = useTextSize()
  const meta = CUTOUT[product.id] ?? CUTOUT.fit30
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

  return (
    <group position={[ENZYME_X, 0.845, z]}>
      <CutoutStand
        url={meta.url}
        height={meta.h}
        rotation={[0, Math.PI / 2, 0]}
        lean={0.03}
        shadowWidth={0.95}
        onClick={() => onSelect(product)}
      />
      {/* 앞쪽 이름표 — 진열대 끝에 살짝 기울여 세운 카드 */}
      <group position={[0.5, 0.0, 0.02]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.15, -0.05]} rotation={[-0.62, 0, 0]}>
          <boxGeometry args={[0.52, 0.22, 0.02]} />
          <meshStandardMaterial color="#fbf5e8" roughness={0.45} metalness={0.1} />
        </mesh>
        <Panel texture={plaque} width={0.49} height={0.195} position={[0, 0.153, -0.037]} rotation={[-0.62, 0, 0]} />
      </group>
    </group>
  )
}

export function EnzymeZone({ partner, onSelect }) {
  const ts = useTextSize()
  const oak = useOak({ repeat: [3, 1], color: P.oakLight })
  const oakDark = useOak({ repeat: [1, 1], color: P.oakMid })
  const stone = useStone({ color: '#ffffff' })
  const benchLen = 7.6
  const benchZ = -0.4

  const sign = useMemo(
    () =>
      signTexture({
        key: 'sign-enzyme',
        brand: 'AL.F.S  COLLECTION',
        title: '효소세상 · 데일리 케어',
        sub: '발효 효소 6종 · 진열된 제품을 누르면 구성과 가격이 열립니다',
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
          '제품을 누르면 구성·용량·배송비를 보고 주문으로 넘어갈 수 있습니다.',
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
      {/* 오크 진열 벤치 */}
      <group position={[ENZYME_X, 0, benchZ]}>
        <ShadowDisc radius={4.4} opacity={0.3} />
        <mesh position={[0, 0.39, 0]}>
          <boxGeometry args={[1.02, 0.78, benchLen]} />
          <meshStandardMaterial {...oak} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.12, 0.05, benchLen + 0.1]} />
          <meshStandardMaterial {...stone} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.86, 0.09, benchLen - 0.3]} />
          <meshStandardMaterial color={P.oakDeep} roughness={0.6} />
        </mesh>
        {/* 앞면 세로 결 패널 + 얇은 홈 */}
        {[-2.3, -0.8, 0.8, 2.3].map((z) => (
          <mesh key={z} position={[0.515, 0.39, z]}>
            <boxGeometry args={[0.012, 0.76, 0.02]} />
            <meshStandardMaterial color={P.oakDeep} roughness={0.55} />
          </mesh>
        ))}
        <LedStrip position={[0.53, 0.755, 0]} size={[0.03, 0.02, benchLen - 0.2]} intensity={1.1} />
      </group>

      {/* 누끼 제품 6종 */}
      {enzymeProducts.map((product, i) => (
        <ProductStand key={product.id} product={product} partner={partner} z={ENZYME_Z[i]} onSelect={onSelect} />
      ))}

      {/* 뒷벽 — 오크 슬랫 패널 (어두운 등판 사이로 결이 보입니다) */}
      <SlatWall position={[-12.7, 0, benchZ]} rotation={[0, Math.PI / 2, 0]} width={benchLen + 0.6} height={3.15} gap={0.3} color={P.oakLight} />
      <group position={[-12.4, 0, benchZ]}>
        {/* 위 선반 */}
        <mesh position={[0, 2.44, 0]}>
          <boxGeometry args={[0.46, 0.07, benchLen - 0.6]} />
          <meshStandardMaterial {...oakDark} />
        </mesh>
        <LedStrip position={[0.02, 2.39, 0]} size={[0.04, 0.02, benchLen - 0.8]} intensity={1.1} />
      </group>

      {/* 선반 위 소품 */}
      {[-2.4, -0.6, 1.4, 2.8].map((z, i) => (
        <group key={z} position={[-12.5, 2.475, benchZ + z]}>
          {i % 2 === 0 ? <Vase position={[0, 0, 0]} scale={0.9} color={i === 0 ? '#e6d9c2' : '#d9cbb4'} /> : <Plant position={[0, 0, 0]} scale={0.45} />}
        </group>
      ))}

      {/* 존 간판 */}
      <group position={[-12.62, 3.28, benchZ - 1.1]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[4.0, 1.24, 0.08]} />
          <meshStandardMaterial color="#fbf5e8" roughness={0.45} metalness={0.12} />
        </mesh>
        <Panel texture={sign} width={3.9} height={1.16} position={[0, 0, 0.05]} />
      </group>

      {/* 통로 쪽 안내 패널 */}
      <group position={[-12.7, 2.0, 5.0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[2.6, 1.3, 0.06]} />
          <meshStandardMaterial {...oakDark} />
        </mesh>
        <Panel texture={notice} width={2.48} height={1.2} position={[0, 0, 0.04]} />
      </group>
    </group>
  )
}
