import { useMemo } from 'react'
import { panelTexture, plaqueTexture, screenTexture, signTexture } from './textures.js'
import { Panel, Clickable, ShadowDisc } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'

// ── ① 웰컴 로비 & 파트너샵 안내 ────────────────────────────────
export function LobbyZone({ partner, onSummon }) {
  const ts = useTextSize()

  const sign = useMemo(
    () =>
      signTexture({
        key: `sign-${partner.code}`,
        brand: 'AL.F.S  VIRTUAL SHOWROOM',
        title: partner.name,
        sub: `${partner.region} · ${partner.deskLine}`,
        accent: partner.accent,
        theme: 'light',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const kiosk = useMemo(
    () =>
      screenTexture({
        key: `kiosk-${partner.code}`,
        title: '상담 매니저 서연',
        lines: ['오른쪽에 서 있는 상담 매니저를 눌러도 상담이 열립니다.', '제품 구성 · 가격 · 배송 · 주문을 바로 안내합니다.'],
        accent: partner.accent,
        cta: '눌러서 상담 열기',
        theme: 'light',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const guide = useMemo(
    () =>
      panelTexture({
        key: `guide-${partner.code}`,
        title: '쇼룸 안내',
        lines: ['① 웰컴 로비', '② 오륜미네랄 존', '③ 효소세상 · 데일리 케어 존', '④ 고객 루틴 시뮬레이터 존'],
        accent: partner.accent,
        footer: '바닥 마커나 챕터 버튼을 누르면 그 자리로 부드럽게 이동합니다',
        titleSize: 58,
        lineSize: 40,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  const notice = useMemo(
    () =>
      panelTexture({
        key: `notice-${partner.code}`,
        title: '이용 안내',
        lines: [
          '화면을 드래그하면 둘러볼 수 있고, 두 손가락으로 확대·축소할 수 있습니다.',
          'W A S D · 방향키 또는 왼쪽 조이스틱으로 직접 걸어 다닐 수 있습니다.',
          'AI 상담이 답변합니다. 진단·처방이 아니며 섭취 방법은 제품 라벨을 따릅니다.',
        ],
        accent: partner.accent,
        footer: `주문·결제·배송·환불은 alfs.kr에서 이뤄집니다 · ${partner.attribution}`,
        titleSize: 54,
        lineSize: 36,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  return (
    <group>
      {/* 매다는 간판 — 크림 석재 보드 + 샴페인 골드 라인 */}
      <group position={[0, 3.62, 12.4]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6.84, 2.06, 0.14]} />
          <meshStandardMaterial color="#fbf3e4" roughness={0.38} metalness={0.16} />
        </mesh>
        <Panel texture={sign} width={6.66} height={1.9} position={[0, 0, 0.08]} />
        {[-2.3, 2.3].map((x) => (
          <mesh key={x} position={[x, 1.75, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 1.5, 8]} />
            <meshStandardMaterial color={P.brass} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, -1.05, 0.02]}>
          <boxGeometry args={[6.84, 0.03, 0.16]} />
          <meshStandardMaterial color={P.gold} emissive={P.goldSoft} emissiveIntensity={0.45} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 안내 데스크 — 크림 석재 */}
      <group position={[0, 0, 13.4]}>
        <ShadowDisc radius={3.2} opacity={0.4} />
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[4.8, 1.1, 1.1]} />
          <meshStandardMaterial color="#fdf7ec" roughness={0.32} metalness={0.12} />
        </mesh>
        <mesh position={[0, 1.13, 0]}>
          <boxGeometry args={[5.0, 0.06, 1.25]} />
          <meshStandardMaterial color={P.stoneTop} roughness={0.16} metalness={0.32} />
        </mesh>
        <mesh position={[0, 1.17, 0.62]}>
          <boxGeometry args={[5.0, 0.014, 0.02]} />
          <meshStandardMaterial color={P.brass} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.26, 0.57]}>
          <boxGeometry args={[4.4, 0.03, 0.03]} />
          <meshStandardMaterial color={P.gold} emissive={P.goldSoft} emissiveIntensity={0.5} metalness={0.7} />
        </mesh>

        {/* 데스크 명패 */}
        <Panel texture={deskPlate} width={2.6} height={0.92} position={[0, 0.62, 0.58]} />

        {/* 키오스크 — 누르면 상담 열기 */}
        <Clickable onClick={onSummon} hoverScale={1.03} position={[0, 1.62, -0.05]}>
          <mesh>
            <boxGeometry args={[1.75, 1.12, 0.08]} />
            <meshStandardMaterial color="#e9dcc3" roughness={0.4} metalness={0.35} />
          </mesh>
          <Panel texture={kiosk} width={1.6} height={1.0} position={[0, 0, 0.06]} />
        </Clickable>
        <mesh position={[0, 1.2, -0.05]}>
          <boxGeometry args={[0.16, 0.32, 0.12]} />
          <meshStandardMaterial color={P.brass} metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* 좌우 안내 패널 */}
      <group position={[-5.7, 1.8, 15.0]} rotation={[0, 1.05, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 2.5, 0.1]} />
          <meshStandardMaterial color="#fdf8ee" roughness={0.42} metalness={0.14} />
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
          <meshStandardMaterial color="#fdf8ee" roughness={0.42} metalness={0.14} />
        </mesh>
        <Panel texture={notice} width={1.95} height={1.6} position={[0, 0.2, 0.07]} />
      </group>

      {/* 웰컴 라인 조명 */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, 0.02, 17.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.7, 5]} />
          <meshStandardMaterial color={P.goldSoft} emissive={P.goldSoft} emissiveIntensity={0.4} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}
