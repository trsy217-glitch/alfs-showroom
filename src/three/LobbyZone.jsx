import { useMemo } from 'react'
import { panelTexture, plaqueTexture, screenTexture, signTexture } from './textures.js'
import { Panel, Clickable, ShadowDisc } from './parts.jsx'

// ── ① 웰컴 로비 & 파트너샵 안내 ────────────────────────────────
export function LobbyZone({ partner, onSummon }) {
  const sign = useMemo(
    () =>
      signTexture({
        key: `sign-${partner.code}`,
        brand: 'AL.F.S SHOWROOM',
        title: partner.name,
        sub: `${partner.region} · ${partner.deskLine}`,
        accent: partner.accentSoft,
        theme: 'dark',
      }),
    [partner],
  )

  const deskPlate = useMemo(
    () =>
      plaqueTexture({
        key: `desk-${partner.code}`,
        name: partner.name,
        price: partner.deskLine,
        note: partner.owner ? `${partner.owner} ${partner.ownerTitle} · ${partner.phone}` : partner.phone,
        accent: partner.accent,
      }),
    [partner],
  )

  const kiosk = useMemo(
    () =>
      screenTexture({
        key: `kiosk-${partner.code}`,
        title: '상담 직원 부르기',
        lines: ['쇼룸을 걷고 있는 상담 직원을 부르면 이 자리로 걸어옵니다.', '제품 구성 · 가격 · 배송 · 주문을 바로 안내합니다.'],
        accent: partner.accent,
        cta: '눌러서 부르기',
      }),
    [partner],
  )

  const guide = useMemo(
    () =>
      panelTexture({
        key: `guide-${partner.code}`,
        title: '쇼룸 안내',
        lines: ['① 웰컴 로비', '② 오륜미네랄 존', '③ 효소세상 · 데일리 케어 존', '④ 고객 루틴 시뮬레이터 존'],
        accent: partner.accent,
        footer: '바닥 마커나 아래 챕터 버튼을 누르면 그 자리로 이동합니다',
        titleSize: 58,
        lineSize: 40,
      }),
    [partner],
  )

  const notice = useMemo(
    () =>
      panelTexture({
        key: `notice-${partner.code}`,
        title: '이용 안내',
        lines: [
          '화면을 드래그하면 둘러볼 수 있고, 두 손가락으로 확대·축소할 수 있습니다.',
          'AI 상담 직원이 답변합니다. 진단·처방이 아니며 섭취 방법은 제품 라벨을 따릅니다.',
        ],
        accent: partner.accent,
        footer: `주문·결제·배송·환불은 alfs.kr에서 이뤄집니다 · ${partner.attribution}`,
        titleSize: 54,
        lineSize: 36,
      }),
    [partner],
  )

  return (
    <group>
      {/* 매다는 간판 */}
      <group position={[0, 3.6, 12.4]}>
        <Panel texture={sign} width={6.6} height={1.88} position={[0, 0, 0.07]} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.8, 2.05, 0.14]} />
          <meshStandardMaterial color="#0b1a20" roughness={0.35} metalness={0.45} />
        </mesh>
        {[-2.3, 2.3].map((x) => (
          <mesh key={x} position={[x, 1.75, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 1.5, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, -1.07, 0]}>
          <boxGeometry args={[6.8, 0.04, 0.16]} />
          <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>

      {/* 안내 데스크 */}
      <group position={[0, 0, 13.4]}>
        <ShadowDisc radius={3.2} opacity={0.5} />
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[4.8, 1.1, 1.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.12} />
        </mesh>
        <mesh position={[0, 1.13, 0]}>
          <boxGeometry args={[5.0, 0.07, 1.25]} />
          <meshStandardMaterial color="#f1f5f7" roughness={0.2} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.24, 0.57]}>
          <boxGeometry args={[4.4, 0.06, 0.04]} />
          <meshStandardMaterial color={partner.accent} emissive={partner.accentSoft} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>

        {/* 데스크 명패 */}
        <Panel texture={deskPlate} width={2.6} height={0.92} position={[0, 0.62, 0.58]} />

        {/* 키오스크 — 누르면 상담 직원 호출 */}
        <Clickable onClick={onSummon} hoverScale={1.03} position={[0, 1.6, -0.05]}>
          <mesh>
            <boxGeometry args={[1.75, 1.12, 0.08]} />
            <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.4} />
          </mesh>
          <Panel texture={kiosk} width={1.6} height={1.0} position={[0, 0, 0.05]} />
        </Clickable>
        <mesh position={[0, 1.2, -0.05]}>
          <boxGeometry args={[0.16, 0.32, 0.12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 좌우 안내 패널 */}
      <group position={[-5.7, 1.8, 15.0]} rotation={[0, 1.05, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 2.5, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.15} />
        </mesh>
        <Panel texture={guide} width={1.95} height={1.35} position={[0, 0.35, 0.07]} />
        <mesh position={[0, -0.75, 0.07]}>
          <planeGeometry args={[1.95, 0.4]} />
          <meshBasicMaterial color={partner.accent} toneMapped={false} />
        </mesh>
      </group>

      <group position={[5.7, 1.8, 15.0]} rotation={[0, -1.05, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 2.5, 0.1]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.15} />
        </mesh>
        <Panel texture={notice} width={1.95} height={1.6} position={[0, 0.2, 0.07]} />
      </group>

      {/* 웰컴 라인 조명 */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 0.02, 17.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.9, 5]} />
          <meshStandardMaterial color={partner.accentSoft} emissive={partner.accentSoft} emissiveIntensity={0.5} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}
