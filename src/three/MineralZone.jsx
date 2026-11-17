import { useMemo } from 'react'
import { mineralProduct, won } from '../config/catalog.js'
import { panelTexture, plaqueTexture } from './textures.js'
import { Panel, PhotoPanel, Clickable, Bottle, ShadowDisc, Glow } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'

// ── ② 오륜미네랄 시그니처 존 (중앙 원형 아일랜드 · 1,000ml) ──────
export function MineralZone({ partner, onSelect }) {
  const ts = useTextSize()

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

  const factLeft = useMemo(
    () =>
      panelTexture({
        key: 'mineral-fact-left',
        title: '제품 사실',
        lines: ['식품유형: 기타가공품', '내용량: 1,000ml 1병', '섭취: 원액을 물에 10~30배 희석', '보관: 실온 (직사광선을 피함)'],
        accent: partner.accent,
        titleSize: 52,
        lineSize: 38,
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
        lineSize: 36,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  return (
    <group position={[0, 0, 4]}>
      {/* 원형 아일랜드 + 시그니처 병 (하나의 클릭 영역) */}
      <Clickable onClick={() => onSelect(mineralProduct)} hoverScale={1.012}>
        <ShadowDisc radius={4.4} opacity={0.42} />
        <Glow radius={5.2} opacity={0.3} />
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[3.5, 3.6, 0.18, 64]} />
          <meshStandardMaterial color="#f7efe1" roughness={0.22} metalness={0.22} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.34, 3.46, 64]} />
          <meshStandardMaterial color={P.brass} emissive={P.goldSoft} emissiveIntensity={0.5} metalness={0.8} roughness={0.25} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.33, 0]}>
          <cylinderGeometry args={[2.62, 2.72, 0.3, 64]} />
          <meshStandardMaterial color={P.stoneTop} roughness={0.26} metalness={0.16} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.16, 1.22, 0.12, 48]} />
          <meshStandardMaterial color={P.stone} roughness={0.28} metalness={0.28} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[1.0, 1.06, 0.98, 48]} />
          <meshStandardMaterial color="#fffdf7" roughness={0.2} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.52, 0]}>
          <cylinderGeometry args={[1.12, 1.12, 0.045, 48]} />
          <meshStandardMaterial color={P.brass} roughness={0.14} metalness={0.7} />
        </mesh>

        {/* 시그니처 병 */}
        <Bottle
          position={[0, 1.55, 0]}
          height={2.0}
          radius={0.44}
          body="#f2f7ef"
          cap="#e9d6ab"
          label={{ name: '오륜미네랄', volume: '1,000ml' }}
          labelAccent={partner.accent}
        />
      </Clickable>

      {/* 뒤쪽 백라이트 포스터 (실물 사진) */}
      <group position={[0, 2.9, -3.4]}>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[4.5, 4.5, 0.14]} />
          <meshStandardMaterial color="#fbf4e6" roughness={0.4} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[4.62, 4.62, 0.04]} />
          <meshStandardMaterial color={P.brass} roughness={0.28} metalness={0.72} />
        </mesh>
        <PhotoPanel url="/images/oryun-poster.webp" width={3.7} height={3.7} position={[0, 0, 0.02]} frame={false} />
        <mesh position={[0, -2.35, 0.02]}>
          <boxGeometry args={[4.5, 0.03, 0.16]} />
          <meshStandardMaterial color={P.gold} emissive={P.goldSoft} emissiveIntensity={0.5} metalness={0.7} roughness={0.28} toneMapped={false} />
        </mesh>
      </group>

      {/* 좌우 포인트 조명 기둥 */}
      {[-6.5, 6.5].map((x) => (
        <mesh key={x} position={[x, 2.3, 1.4]}>
          <boxGeometry args={[0.05, 4.4, 0.05]} />
          <meshStandardMaterial color={P.brass} emissive={P.goldSoft} emissiveIntensity={0.35} metalness={0.8} toneMapped={false} />
        </mesh>
      ))}

      {/* 설명 패널 (좌 / 우) */}
      <group position={[-3.25, 1.9, 2.55]} rotation={[0, 0.62, 0]}>
        <mesh>
          <boxGeometry args={[2.05, 1.5, 0.08]} />
          <meshStandardMaterial color="#fdf8ee" roughness={0.38} metalness={0.14} />
        </mesh>
        <Panel texture={factLeft} width={1.95} height={1.36} position={[0, 0, 0.06]} />
      </group>
      <group position={[3.25, 1.9, 2.55]} rotation={[0, -0.62, 0]}>
        <mesh>
          <boxGeometry args={[2.05, 1.5, 0.08]} />
          <meshStandardMaterial color="#fdf8ee" roughness={0.38} metalness={0.14} />
        </mesh>
        <Panel texture={factRight} width={1.95} height={1.36} position={[0, 0, 0.06]} />
      </group>

      {/* 받침대 앞 가격 명판 — 누르면 상세 */}
      <group position={[0, 0, 1.3]}>
        <Clickable onClick={() => onSelect(mineralProduct)} hoverScale={1.06}>
          <mesh position={[0, 1.12, 0]} rotation={[-0.28, 0, 0]}>
            <boxGeometry args={[1.46, 0.46, 0.07]} />
            <meshStandardMaterial color="#fffdf8" roughness={0.3} metalness={0.22} />
          </mesh>
          <Panel texture={price} width={1.4} height={0.44} position={[0, 1.12, 0.05]} rotation={[-0.28, 0, 0]} />
        </Clickable>
      </group>
    </group>
  )
}
