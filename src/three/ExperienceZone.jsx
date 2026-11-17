import { useMemo } from 'react'
import { panelTexture, screenTexture } from './textures.js'
import { Panel, Clickable, ShadowDisc, LedStrip } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'
import { Plant, Pendant, SlatWall, Stool, useOak, useStone } from './furniture.jsx'

// ── ④ 성분 · 체험 존 — 스톤 시음 바 · 성분 안내 · 루틴 진단 키오스크 ──
export function ExperienceZone({ partner, onOpenSimulator }) {
  const ts = useTextSize()
  const oak = useOak({ repeat: [3, 1], color: P.oakLight })
  const oakDark = useOak({ repeat: [1, 1], color: P.oakMid })
  const stone = useStone({ color: '#ffffff' })

  const kiosk = useMemo(
    () =>
      screenTexture({
        key: `sim-kiosk-${partner.code}`,
        title: '루틴 시뮬레이터',
        lines: ['버튼 세 번이면 구성과 합계를 계산해 드립니다.', '목적 → 예산 → 지금 드시는 제품'],
        accent: partner.accent,
        cta: '3문항 시작하기',
        theme: 'light',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const ingredient = useMemo(
    () =>
      panelTexture({
        key: `ingredient-${partner.code}`,
        title: '성분 · 원료 안내',
        lines: ['오륜미네랄: 충북 보은 어린 뽕잎과 누에에서 얻은 원액', '효소세상: 발효 효소를 파우치 · 병에 담은 구성', '표시된 정보는 제품 라벨과 alfs.kr 상품 페이지를 따릅니다'],
        accent: partner.accent,
        footer: '진단 · 처방이 아닌 제품 정보 안내입니다',
        titleSize: 52,
        lineSize: 36,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const howto = useMemo(
    () =>
      panelTexture({
        key: `howto-${partner.code}`,
        title: '섭취 · 보관 안내',
        lines: ['오륜미네랄: 원액을 물에 10~30배 희석', '클린바이옴: 상온의 물 300~500ml에 한 병을 풀어 5분 안에', '실온 보관 · 직사광선을 피해 주세요'],
        accent: partner.accent,
        footer: '제품마다 기준이 다르니 라벨 안내를 따라 주세요',
        titleSize: 52,
        lineSize: 36,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const ship = useMemo(
    () =>
      panelTexture({
        key: `ship-${partner.code}`,
        title: '배송 · 주문 안내',
        lines: ['오륜미네랄: 3,000원 · 5만 원 이상 무료 (한진택배)', '효소세상: 4,000원 · 5만 원 이상 무료 (제주·도서 6,000원 추가)', '주문과 결제는 alfs.kr에서 이뤄집니다'],
        accent: partner.accent,
        footer: `문의: ${partner.name} ${partner.phone}`,
        titleSize: 52,
        lineSize: 36,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  return (
    <group>
      {/* 스톤 시음 바 */}
      <group position={[-0.9, 0, -8.55]}>
        <ShadowDisc radius={4} opacity={0.3} />
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[7.0, 0.88, 0.82]} />
          <meshStandardMaterial {...oak} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[7.0, 0.07, 0.94]} />
          <meshStandardMaterial {...stone} color="#f0e8d9" />
        </mesh>
        <mesh position={[0, 0.14, 0.42]}>
          <boxGeometry args={[7.0, 0.05, 0.04]} />
          <meshStandardMaterial color={P.brass} metalness={0.7} roughness={0.32} />
        </mesh>
        <LedStrip position={[0, 0.88, 0.44]} size={[6.6, 0.02, 0.03]} intensity={1} />
        {/* 바 위 시음 트레이 · 유리컵 */}
        {[-2.1, -0.4, 1.3].map((x) => (
          <group key={x} position={[x, 0.955, 0.1]}>
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.02, 28]} />
              <meshStandardMaterial color={P.oakDark} roughness={0.55} />
            </mesh>
            {[-0.09, 0.09].map((dx) => (
              <mesh key={dx} position={[dx, 0.07, 0]}>
                <cylinderGeometry args={[0.045, 0.036, 0.1, 16, 1, true]} />
                <meshStandardMaterial color="#f4f0e4" transparent opacity={0.55} roughness={0.08} metalness={0.1} side={2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 스툴 3개 */}
      <Stool position={[-3.0, 0, -7.55]} />
      <Stool position={[-0.6, 0, -7.55]} />
      <Stool position={[1.8, 0, -7.55]} />

      {/* 뒤벽 슬랫 + 안내 패널 3장 */}
      <SlatWall position={[-0.9, 0, -10.8]} width={17.6} height={3.9} gap={0.42} color={P.oakLight} />

      {[
        { tex: ingredient, x: -4.2 },
        { tex: howto, x: -0.9 },
        { tex: ship, x: 2.4 },
      ].map((p, i) => (
        <group key={i} position={[p.x, 1.95, -10.7]}>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[2.72, 1.42, 0.06]} />
            <meshStandardMaterial color="#fbf5e8" roughness={0.45} metalness={0.1} />
          </mesh>
          <Panel texture={p.tex} width={2.6} height={1.32} position={[0, 0, 0.02]} />
        </group>
      ))}

      {/* 루틴 진단 키오스크 */}
      <group position={[4.3, 0, -8.4]} rotation={[0, -0.55, 0]}>
        <ShadowDisc radius={1.3} opacity={0.32} />
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.72, 1.0, 0.5]} />
          <meshStandardMaterial {...oakDark} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.56]} />
          <meshStandardMaterial {...stone} />
        </mesh>
        <Clickable onClick={onOpenSimulator} hoverScale={1.03} position={[0, 1.48, 0]}>
          <mesh>
            <boxGeometry args={[0.92, 1.24, 0.08]} />
            <meshStandardMaterial color={P.oakDeep} roughness={0.45} metalness={0.25} />
          </mesh>
          <Panel texture={kiosk} width={0.82} height={1.14} position={[0, 0, 0.05]} />
        </Clickable>
        <mesh position={[0, 1.05, 0.02]}>
          <boxGeometry args={[0.2, 0.12, 0.12]} />
          <meshStandardMaterial color={P.brass} metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* 바 위 펜던트 3개 */}
      {[-3.6, -0.9, 1.8].map((x) => (
        <Pendant key={x} position={[x, 3.15, -8.55]} drop={0.9} radius={0.3} />
      ))}

      <Plant position={[-5.9, 0, -9.4]} scale={1.2} tall />
    </group>
  )
}
