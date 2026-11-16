import { useMemo } from 'react'
import { panelTexture, screenTexture, plaqueTexture } from './textures.js'
import { Panel, Clickable, ShadowDisc, Glow } from './parts.jsx'

// ── ④ 고객 루틴 시뮬레이터 존 ─────────────────────────────────
export function SimulatorZone({ partner, onOpenSimulator }) {
  const kiosk = useMemo(
    () =>
      screenTexture({
        key: `sim-kiosk-${partner.code}`,
        title: '루틴 시뮬레이터',
        lines: ['버튼 세 번이면 구성과 합계를 계산해 드립니다.', '목적 → 예산 → 지금 드시는 제품'],
        accent: partner.accent,
        cta: '3문항 시작하기',
      }),
    [partner],
  )

  const stepTexts = useMemo(
    () => [
      plaqueTexture({ key: 'step-1', name: '① 무엇이 궁금한가요', price: '매일 관리 · 3일 리셋 · 30일', accent: partner.accent }),
      plaqueTexture({ key: 'step-2', name: '② 예산은 얼마인가요', price: '5만 · 10만 · 20~30만 · 40만', accent: partner.accent }),
      plaqueTexture({ key: 'step-3', name: '③ 지금 드시는 제품', price: '없음 · 미네랄만 · 효소도', accent: partner.accent }),
    ],
    [partner],
  )

  const disclaimer = useMemo(
    () =>
      panelTexture({
        key: `sim-disclaimer-${partner.code}`,
        title: '안내 문구',
        lines: [
          '참고용 안내입니다. 진단이나 처방이 아니며, 섭취 방법은 제품 라벨을 따릅니다.',
          '추천은 구성·용량·가격 같은 사실만으로 계산합니다.',
        ],
        accent: partner.accent,
        footer: `문의: ${partner.name} ${partner.phone}`,
        titleSize: 50,
        lineSize: 34,
      }),
    [partner],
  )

  return (
    <group position={[0, 0, -22]}>
      {/* 원형 상담 테이블 */}
      <ShadowDisc radius={3.2} opacity={0.45} />
      <Glow radius={3.6} opacity={0.3} />
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.72, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[1.72, 1.72, 0.07, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={0.16} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.66, 48]} />
        <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {/* 3문항 카드 */}
      {stepTexts.map((tex, i) => {
        const x = (i - 1) * 1.42
        return (
          <group key={i} position={[x, 1.46, 0.12]} rotation={[-0.18, 0, (i - 1) * -0.03]}>
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[1.06, 0.4, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.2} />
            </mesh>
            <Panel texture={tex} width={1.02} height={0.38} position={[0, 0, 0.012]} />
          </group>
        )
      })}

      {/* 키오스크 — 누르면 시뮬레이터 시작 */}
      <group position={[0, 0, -3.6]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.6, 1.0, 0.6]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.3} />
        </mesh>
        <Clickable onClick={onOpenSimulator} hoverScale={1.03} position={[0, 1.95, 0]}>
          <mesh>
            <boxGeometry args={[2.05, 2.6, 0.12]} />
            <meshStandardMaterial color="#0b1a20" roughness={0.3} metalness={0.45} />
          </mesh>
          <Panel texture={kiosk} width={1.92} height={2.46} position={[0, 0, 0.07]} />
        </Clickable>
        <mesh position={[0, 1.95, -0.1]}>
          <boxGeometry args={[2.25, 2.75, 0.06]} />
          <meshStandardMaterial color={partner.accent} emissive={partner.accentSoft} emissiveIntensity={0.4} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* 벽면 고지 패널 */}
      <group position={[-8.72, 2.2, -21]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[3.1, 1.4, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.15} />
        </mesh>
        <Panel texture={disclaimer} width={2.98} height={1.32} position={[0, 0, 0.05]} />
      </group>

      {/* 존 조명 기둥 */}
      {[-3.6, 3.6].map((x) => (
        <mesh key={x} position={[x, 1.9, -1.2]}>
          <boxGeometry args={[0.08, 3.6, 0.08]} />
          <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
