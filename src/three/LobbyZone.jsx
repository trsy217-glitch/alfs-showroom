import { useMemo } from 'react'
import { panelTexture, plaqueTexture, screenTexture, signTexture } from './textures.js'
import { Panel, Clickable, ShadowDisc, Glow, LedStrip } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'
import { ClubChair, Plant, Rug, SideTable, Vase, BookStack, useOak, useStone } from './furniture.jsx'

// ── ① 웰컴 로비 — 입구 간판 · 오크 안내 데스크 · 대기석 ────────────
export function LobbyZone({ partner, onSummon }) {
  const ts = useTextSize()
  const oak = useOak({ repeat: [2, 1], color: P.oakLight })
  const oakDark = useOak({ repeat: [1, 1], color: P.oakMid })
  const stone = useStone({ color: '#ffffff' })

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
        lines: ["오른쪽 위 '상담 매니저 부르기'를 누르면 상담이 열립니다.", '제품 구성 · 가격 · 배송 · 주문을 바로 안내합니다.'],
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
        lines: ['01 웰컴 로비 · 지점 안내', '02 오륜미네랄 전시대 · 1,000ml', '03 효소세상 컬렉션 · 6종 진열', '04 성분 · 체험 존 · 루틴 진단', '05 파트너 라운지 · 우드 소파'],
        accent: partner.accent,
        footer: '바닥 마커나 아래 챕터 버튼을 누르면 그 자리로 부드럽게 이동합니다',
        titleSize: 58,
        lineSize: 40,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partner, ts],
  )

  return (
    <group>
      {/* 입구 위 간판 — 오크 보드 + 따뜻한 백라이트 */}
      <group position={[0, 3.62, 10.7]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <boxGeometry args={[6.7, 1.86, 0.12]} />
          <meshStandardMaterial {...oakDark} />
        </mesh>
        <Panel texture={sign} width={6.5} height={1.68} position={[0, 0, 0.07]} />
        <mesh position={[0, -0.98, 0.02]}>
          <boxGeometry args={[6.7, 0.03, 0.12]} />
          <meshStandardMaterial color={P.brass} metalness={0.75} roughness={0.3} emissive={P.goldSoft} emissiveIntensity={0.25} />
        </mesh>
        <LedStrip position={[0, -1.06, -0.06]} size={[6.2, 0.02, 0.04]} intensity={1.2} />
      </group>

      {/* 안내 데스크 — 오크 바디 + 스톤 상판 */}
      <group position={[3.95, 0, 6.95]} rotation={[0, -0.45, 0]}>
        <ShadowDisc radius={2.1} opacity={0.4} />
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[2.72, 0.7, 0.78]} />
          <meshStandardMaterial {...oak} />
        </mesh>
        <mesh position={[0, 0.77, 0]}>
          <boxGeometry args={[2.94, 0.06, 0.92]} />
          <meshStandardMaterial {...stone} />
        </mesh>
        <mesh position={[0, 0.74, 0.395]}>
          <boxGeometry args={[2.74, 0.018, 0.02]} />
          <meshStandardMaterial color={P.brass} metalness={0.8} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.08, 0.395]}>
          <boxGeometry args={[2.74, 0.12, 0.03]} />
          <meshStandardMaterial color={P.oakDeep} roughness={0.55} />
        </mesh>

        {/* 데스크 명패 */}
        <Panel texture={deskPlate} width={1.9} height={0.67} position={[0, 0.42, 0.4]} />

        {/* 키오스크 화면 — 누르면 상담 메뉴 */}
        <Clickable onClick={onSummon} hoverScale={1.04} position={[0.86, 1.02, -0.18]}>
          <group rotation={[-0.16, -0.18, 0]}>
            <mesh>
              <boxGeometry args={[0.76, 0.54, 0.04]} />
              <meshStandardMaterial color={P.oakDeep} roughness={0.5} metalness={0.2} />
            </mesh>
            <Panel texture={kiosk} width={0.68} height={0.47} position={[0, 0, 0.025]} />
          </group>
        </Clickable>

        {/* 작은 데스크 램프 */}
        <group position={[-1.05, 0.8, -0.16]}>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.03, 16]} />
            <meshStandardMaterial color={P.brass} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
            <meshStandardMaterial color={P.brass} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.34, 0.05]}>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshBasicMaterial color="#ffeecd" toneMapped={false} />
          </mesh>
        </group>

        {/* 브로슈어 트레이 */}
        <group position={[0.05, 0.81, 0.3]}>
          <mesh>
            <boxGeometry args={[0.56, 0.03, 0.24]} />
            <meshStandardMaterial color={P.oakDark} roughness={0.6} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.04 + i * 0.006, 0]} rotation={[0, 0.1 * i, 0]}>
              <boxGeometry args={[0.34, 0.012, 0.18]} />
              <meshStandardMaterial color={i === 1 ? '#efe6d4' : '#f7f0e2'} roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 대기석 — 린넨 클럽 체어 + 사이드 테이블 */}
      <ClubChair position={[-8.3, 0, 8.6]} rotation={1.05} />
      <ClubChair position={[-9.6, 0, 7.2]} rotation={1.65} />
      <SideTable position={[-9.3, 0, 8.35]} />
      <BookStack position={[-9.3, 0.52, 8.35]} count={2} rotation={0.3} />
      <ShadowDisc radius={1.6} position={[-8.8, 0.012, 7.9]} opacity={0.28} />

      {/* 콘솔 테이블 + 화병 (앞벽 왼쪽) */}
      <group position={[-7.6, 0, 10.4]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2.4, 0.07, 0.52]} />
          <meshStandardMaterial {...oakDark} />
        </mesh>
        {[-1.0, 1.0].map((x) => (
          <mesh key={x} position={[x, 0.4, 0]}>
            <boxGeometry args={[0.07, 0.78, 0.44]} />
            <meshStandardMaterial {...oak} />
          </mesh>
        ))}
        <Vase position={[-0.55, 0.84, 0]} scale={1.5} />
        <BookStack position={[0.5, 0.84, 0]} count={3} rotation={-0.2} />
      </group>

      {/* 쇼룸 안내 패널 (왼벽) */}
      <group position={[-12.72, 1.92, 6.6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 1.9, 0.06]} />
          <meshStandardMaterial {...oakDark} />
        </mesh>
        <Panel texture={guide} width={2.24} height={1.0} position={[0, 0.32, 0.05]} />
        <mesh position={[0, -0.6, 0.05]}>
          <planeGeometry args={[2.1, 0.02]} />
          <meshStandardMaterial color={P.brass} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 입구 매트 · 화분 */}
      <Rug position={[0, 0, 9.5]} size={[4.8, 2.6]} color="#e4d9c4" />
      <Plant position={[6.2, 0, 9.2]} scale={1.25} tall />
      <Plant position={[-11.6, 0, 9.8]} scale={1.05} />
      <Glow radius={3.4} position={[0, 0.01, 8.4]} opacity={0.22} />
    </group>
  )
}
