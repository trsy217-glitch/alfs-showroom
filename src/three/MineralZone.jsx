import { useMemo } from 'react'
import { mineralProduct, won } from '../config/catalog.js'
import { panelTexture, plaqueTexture, signTexture } from './textures.js'
import { Panel, Clickable, CutoutStand, ShadowDisc, Glow, LedStrip } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'
import { Pendant, Plant, SlatWall, useOak, useStone } from './furniture.jsx'

// ── ② 오륜미네랄 전시대 — 스톤 테이블 위 누끼 병 진열 (1,000ml) ──
export function MineralZone({ partner, onSelect }) {
  const ts = useTextSize()
  const oak = useOak({ repeat: [2, 1], color: P.oakMid })
  const stone = useStone({ color: '#ffffff' })

  const price = useMemo(
    () =>
      plaqueTexture({
        key: 'mineral-price',
        name: '오륜미네랄 1,000ml',
        price: `${won(mineralProduct.price)}`,
        note: '눌러서 상세 보기',
        accent: partner.accent,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const brand = useMemo(
    () =>
      signTexture({
        key: 'sign-mineral',
        brand: 'AL.F.S  SIGNATURE',
        title: '오륜미네랄',
        sub: '유디아미네랄 · 충북 보은 | 물에 10~30배 희석해 마시는 1,000ml 원액',
        accent: partner.accent,
        theme: 'light',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const factLeft = useMemo(
    () =>
      panelTexture({
        key: 'mineral-fact-left',
        title: '제품 사실',
        lines: ['식품유형: 기타가공품', '내용량: 1,000ml 1병', '섭취: 원액을 물에 10~30배 희석', '보관: 실온 (직사광선을 피함)'],
        accent: partner.accent,
        titleSize: 52,
        lineSize: 40,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const factRight = useMemo(
    () =>
      panelTexture({
        key: 'mineral-fact-right',
        title: '제조 · 배송',
        lines: ['제조원: 유디아미네랄 (충북 보은)', '원산지: 대한민국', '배송비: 3,000원 · 50,000원 이상 무료', '한진택배'],
        accent: partner.accent,
        footer: '수상·특허 이력은 제조사 유디아미네랄의 것입니다',
        titleSize: 52,
        lineSize: 38,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  return (
    <group position={[-2.8, 0, 1.4]}>
      {/* 원형 스톤 아일랜드 — 오크 받침 + 트라버틴 상판 */}
      <ShadowDisc radius={1.8} opacity={0.32} />
      <Glow radius={2.6} opacity={0.2} />
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 0.64, 40]} />
        <meshStandardMaterial {...oak} />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <cylinderGeometry args={[0.96, 1.0, 0.08, 56]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      <mesh position={[0, 0.725, 0]}>
        <cylinderGeometry args={[0.94, 0.94, 0.02, 56]} />
        <meshStandardMaterial color={P.stoneTop} roughness={0.32} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.46, 1.52, 64]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>

      {/* 누끼로 딴 1,000ml 병 — 아크릴 스탠드에 세워 진열 */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.44, 0.48, 0.06, 40]} />
        <meshStandardMaterial color={P.stone} roughness={0.38} metalness={0.08} />
      </mesh>
      <CutoutStand
        url="/images/cutout/mineral-1000.webp"
        height={1.08}
        position={[0, 0.81, 0]}
        rotation={[0, 0.06, 0]}
        lean={0.02}
        shadowWidth={1.2}
        onClick={() => onSelect(mineralProduct)}
      />

      {/* 위에서 떨어지는 따뜻한 펜던트 */}
      <Pendant position={[0, 3.15, 0]} drop={1.0} radius={0.3} />

      {/* 뒤쪽 오크 슬랫 파티션 + 존 간판 */}
      <group position={[0, 0, -2.6]}>
        <SlatWall position={[0, 0, 0]} width={4.8} height={3.15} gap={0.22} color={P.oakLight} />
        <LedStrip position={[0, 0.12, 0.14]} size={[4.4, 0.02, 0.03]} intensity={1.1} />
        <group position={[0, 2.16, 0.14]}>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[3.1, 0.94, 0.06]} />
            <meshStandardMaterial color="#fbf5e8" roughness={0.45} metalness={0.1} />
          </mesh>
          <Panel texture={brand} width={3.0} height={0.86} position={[0, 0, 0.02]} />
        </group>
      </group>

      {/* 가격 명판 — 앞쪽 이젤 */}
      <group position={[0, 0, 1.62]} rotation={[-0.36, 0, 0]}>
        <Clickable onClick={() => onSelect(mineralProduct)} hoverScale={1.05}>
          <mesh position={[0, 0.92, 0]}>
            <boxGeometry args={[0.96, 0.36, 0.04]} />
            <meshStandardMaterial color="#fbf5e8" roughness={0.4} metalness={0.12} />
          </mesh>
          <Panel texture={price} width={0.9} height={0.32} position={[0, 0.92, 0.025]} />
          <mesh position={[0, 0.62, -0.05]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[0.05, 0.5, 0.04]} />
            <meshStandardMaterial color={P.oakDark} roughness={0.6} />
          </mesh>
        </Clickable>
      </group>

      {/* 좌우 설명 카드 — 테이블 옆에 비스듬히 */}
      <group position={[-1.35, 0, 1.0]} rotation={[0, 0.72, 0]}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.04, 1.2, 0.04]} />
          <meshStandardMaterial color={P.oakDark} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 0]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.86, 0.56, 0.035]} />
          <meshStandardMaterial color="#fbf5e8" roughness={0.45} />
        </mesh>
        <Panel texture={factLeft} width={0.81} height={0.51} position={[0, 1.02, 0.022]} rotation={[0, 0, 0.06]} />
      </group>
      <group position={[1.35, 0, 1.0]} rotation={[0, -0.72, 0]}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.04, 1.2, 0.04]} />
          <meshStandardMaterial color={P.oakDark} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 0]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.86, 0.56, 0.035]} />
          <meshStandardMaterial color="#fbf5e8" roughness={0.45} />
        </mesh>
        <Panel texture={factRight} width={0.81} height={0.51} position={[0, 1.02, 0.022]} rotation={[0, 0, -0.06]} />
      </group>

      {/* 옆 화분 */}
      <Plant position={[2.5, 0, 2.3]} scale={0.78} />
    </group>
  )
}
