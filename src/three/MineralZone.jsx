import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mineralProduct, won } from '../config/catalog.js'
import { glowTexture, panelTexture, plaqueTexture, shadowTexture, signTexture } from './textures.js'
import { Panel, Clickable, CutoutStand, ShadowDisc, Glow } from './parts.jsx'
import { P } from './palette.js'
import { useTextSize } from '../lib/textSize.js'
import { Pendant, Plant, StoneBackdrop, useOak } from './furniture.jsx'

// 제품을 향해 떨어지는 스포트 — 대상(object3D)을 명시해야 그 자리를 비춥니다
function ProductSpot() {
  const light = useRef(null)
  const target = useRef(null)
  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current
  }, [])
  return (
    <>
      <spotLight ref={light} position={[0, 3.25, 1.0]} angle={0.52} penumbra={0.9} intensity={16} distance={9} decay={2} color="#fff1d6" />
      <object3D ref={target} position={[0, 1.2, 0]} />
    </>
  )
}

// ── ② 오륜미네랄 전시대 — 스톤 테이블 위 누끼 병 진열 (1,000ml) ──
//  2026-11-18 소영 님 지시 ③ + 최우선 원칙:
//   · 뒤 가벽의 굵은 세로 슬랫 줄무늬를 없애고 차분한 스톤 단색으로, 높이도 낮춰
//     홀 뒤쪽 시야가 시원하게 트이도록 정리
//   · 다른 어떤 요소보다 오륜미네랄 제품이 먼저·선명하게 보이도록
//     조명(스포트 + 뒤 후광) · 대비(차분한 배경) · 구도(작은 간판 · 정면 배치)를 다시 잡음
export function MineralZone({ partner, onSelect }) {
  const ts = useTextSize()
  const oak = useOak({ repeat: [2, 1], color: P.oakMid })
  const halo = useMemo(() => glowTexture(), [])
  const contact = useMemo(() => shadowTexture(), [])

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
      {/* 스톤 페데스탈 — 갤러리 진열대처럼 제품만 조용히 받칩니다 */}
      <ShadowDisc radius={1.5} opacity={0.3} />
      <Glow radius={2.4} opacity={0.24} />
      {/* 바닥 받침 링 */}
      <mesh position={[0, 0.028, 0]}>
        <cylinderGeometry args={[0.5, 0.54, 0.056, 56]} />
        <meshStandardMaterial {...oak} />
      </mesh>
      {/* 트라버틴 기둥 — 무늬 없이 차분한 단색 스톤 */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.86, 56]} />
        <meshStandardMaterial color="#bda98a" roughness={0.58} metalness={0.04} />
      </mesh>
      {/* 상단 캡 + 브라스 헤어라인 */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 56]} />
        <meshStandardMaterial color="#d5c4a3" roughness={0.42} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.892, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.325, 0.34, 64]} />
        <meshStandardMaterial color={P.brass} metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.34, 64]} />
        <meshStandardMaterial color={P.oakDark} roughness={0.6} />
      </mesh>

      {/* 제품 뒷면 후광 — 배경에서 제품만 떠 보이게 (은은하게) */}
      <mesh position={[0, 1.52, -2.5]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={halo} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* 제품 접지 그림자 — 캡 위에 확실히 내려앉아 보이게 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.952, 0]}>
        <planeGeometry args={[0.56, 0.38]} />
        <meshBasicMaterial map={contact} transparent opacity={0.7} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* 누끼로 딴 1,000ml 병 — 아크릴 스탠드에 세워 진열 */}
      <CutoutStand
        url="/images/cutout/mineral-1000.webp"
        height={1.18}
        position={[0, 0.91, 0]}
        rotation={[0, 0.06, 0]}
        lean={0.01}
        shadowWidth={1.2}
        onClick={() => onSelect(mineralProduct)}
      />

      {/* 제품을 향한 스포트 + 뒤쪽 림라이트 — 공간에서 가장 밝은 자리 */}
      <ProductSpot />
      <pointLight position={[0, 1.75, -1.95]} intensity={3} distance={3.0} decay={2} color="#ffeecb" />

      {/* 위에서 떨어지는 따뜻한 펜던트 */}
      <Pendant position={[0, 3.15, 0]} drop={1.0} radius={0.3} />

      {/* 뒤쪽 차분한 스톤 가벽 + 존 간판 (줄무늬 없음 · 낮게) */}
      <group position={[0, 0, -2.6]}>
        <StoneBackdrop width={5.2} height={2.9} />
        <group position={[0, 2.46, 0.11]}>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[2.32, 0.68, 0.05]} />
            <meshStandardMaterial color="#fbf5e8" roughness={0.45} metalness={0.1} />
          </mesh>
          <Panel texture={brand} width={2.2} height={0.629} position={[0, 0, 0.015]} />
        </group>
      </group>

      {/* 가격 라벨 — 페데스탈 왼쪽 앞에 낮게 눕힌 안내판 */}
      <group position={[-0.72, 0, 1.02]} rotation={[0, 0.34, 0]}>
        <Clickable onClick={() => onSelect(mineralProduct)} hoverScale={1.05}>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 20]} />
            <meshStandardMaterial color={P.brass} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.028, 0.36, 0.028]} />
            <meshStandardMaterial color={P.oakDark} roughness={0.6} />
          </mesh>
          <group position={[0, 0.42, 0.03]} rotation={[-0.62, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.6, 0.22, 0.02]} />
              <meshStandardMaterial color="#fbf5e8" roughness={0.4} metalness={0.1} />
            </mesh>
            <Panel texture={price} width={0.56} height={0.199} position={[0, 0, 0.013]} />
          </group>
        </Clickable>
      </group>

      {/* 좌우 설명 카드 — 진열대 뒤쪽으로 물려 제품이 먼저 보이게 */}
      <group position={[-1.72, 0, -1.48]} rotation={[0, 1.0, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.03, 0.8, 0.03]} />
          <meshStandardMaterial color={P.oakDark} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.6, 0.39, 0.03]} />
          <meshStandardMaterial color="#fbf5e8" roughness={0.45} />
        </mesh>
        <Panel texture={factLeft} width={0.56} height={0.36} position={[0, 0.72, 0.02]} rotation={[0, 0, 0.06]} />
      </group>
      <group position={[1.72, 0, -1.48]} rotation={[0, -1.0, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.03, 0.8, 0.03]} />
          <meshStandardMaterial color={P.oakDark} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.72, 0]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.6, 0.39, 0.03]} />
          <meshStandardMaterial color="#fbf5e8" roughness={0.45} />
        </mesh>
        <Panel texture={factRight} width={0.56} height={0.36} position={[0, 0.72, 0.02]} rotation={[0, 0, -0.06]} />
      </group>

      {/* 옆 화분 */}
      <Plant position={[2.5, 0, 2.3]} scale={0.78} />
    </group>
  )
}
