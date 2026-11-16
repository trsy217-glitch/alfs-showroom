import { useMemo } from 'react'
import { mineralProduct, won } from '../config/catalog.js'
import { panelTexture, plaqueTexture } from './textures.js'
import { Panel, PhotoPanel, Clickable, Bottle, ShadowDisc, Glow } from './parts.jsx'

// ── ② 오륜미네랄 메인 존 (중앙 원형 히어로 아일랜드) ──────────────
export function MineralZone({ partner, onSelect }) {
  const price = useMemo(
    () =>
      plaqueTexture({
        key: 'mineral-price',
        name: '오륜미네랄',
        price: `${won(mineralProduct.price)} · 1,000ml 1병`,
        note: '눌러서 상세 보기',
        accent: partner.accent,
      }),
    [partner],
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
    [partner],
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
    [partner],
  )

  return (
    <group position={[0, 0, 4]}>
      {/* 원형 아일랜드 + 히어로 병 (하나의 클릭 영역) */}
      <Clickable onClick={() => onSelect(mineralProduct)} hoverScale={1.012}>
        <ShadowDisc radius={4.4} opacity={0.55} />
        <Glow radius={5.2} opacity={0.35} />
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[3.5, 3.6, 0.18, 64]} />
          <meshStandardMaterial color="#f6f8fa" roughness={0.22} metalness={0.28} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.34, 3.46, 64]} />
          <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.33, 0]}>
          <cylinderGeometry args={[2.62, 2.72, 0.3, 64]} />
          <meshStandardMaterial color="#ffffff" roughness={0.28} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.16, 1.22, 0.12, 48]} />
          <meshStandardMaterial color="#e6edf1" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[1.0, 1.06, 0.98, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.24} metalness={0.22} />
        </mesh>
        <mesh position={[0, 1.52, 0]}>
          <cylinderGeometry args={[1.12, 1.12, 0.05, 48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.4} />
        </mesh>

        {/* 히어로 병 */}
        <Bottle
          position={[0, 1.55, 0]}
          height={2.0}
          radius={0.44}
          body="#eef4ec"
          cap="#ffffff"
          label={{ name: '오륜미네랄', volume: '1,000ml' }}
          labelAccent={partner.accent}
        />
      </Clickable>

      {/* 뒤쪽 백라이트 포스터 (실물 사진) */}
      <group position={[0, 2.85, -3.4]}>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[5.0, 5.0, 0.14]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.2} />
        </mesh>
        <PhotoPanel url="/images/oryun-poster.webp" width={4.7} height={4.7} position={[0, 0, 0]} frame={false} />
        <mesh position={[0, -2.62, 0.02]}>
          <boxGeometry args={[5.0, 0.05, 0.2]} />
          <meshStandardMaterial color={partner.accent} emissive={partner.accentSoft} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>

      {/* 좌우 포인트 조명 기둥 */}
      {[-6.5, 6.5].map((x) => (
        <mesh key={x} position={[x, 2.3, 1.4]}>
          <boxGeometry args={[0.06, 4.4, 0.06]} />
          <meshStandardMaterial color="#e6fffb" emissive="#99f6e4" emissiveIntensity={0.3} toneMapped={false} />
        </mesh>
      ))}

      {/* 설명 패널 (좌 / 우) */}
      <group position={[-3.25, 1.9, 2.55]} rotation={[0, 0.62, 0]}>
        <mesh>
          <boxGeometry args={[2.05, 1.5, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.12} />
        </mesh>
        <Panel texture={factLeft} width={1.95} height={1.36} position={[0, 0, 0.06]} />
      </group>
      <group position={[3.25, 1.9, 2.55]} rotation={[0, -0.62, 0]}>
        <mesh>
          <boxGeometry args={[2.05, 1.5, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.12} />
        </mesh>
        <Panel texture={factRight} width={1.95} height={1.36} position={[0, 0, 0.06]} />
      </group>

      {/* 받침대 앞 가격 명판 — 누르면 상세 */}
      <group position={[0, 0, 1.3]}>
        <Clickable onClick={() => onSelect(mineralProduct)} hoverScale={1.06}>
          <mesh position={[0, 1.12, 0]} rotation={[-0.28, 0, 0]}>
            <boxGeometry args={[1.42, 0.46, 0.07]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.2} />
          </mesh>
          <Panel texture={price} width={1.36} height={0.42} position={[0, 1.12, 0.05]} rotation={[-0.28, 0, 0]} />
        </Clickable>
      </group>
    </group>
  )
}
