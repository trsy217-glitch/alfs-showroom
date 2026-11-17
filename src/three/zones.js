// 존 정의 — 넓은 홀(26×22)의 5구역
//  · 카메라 프리셋은 target(바라보는 점) + spherical(theta, phi, radius)
//  · 01 로비 / 02 오륜미네랄 / 03 효소세상 / 04 성분·체험 / 05 파트너 라운지
//
//  2026-11-17 소영 님 지시 ②: "상품 앞에 서면 카메라가 삐딱하지 않게"
//  → 모든 존 프리셋과 상품 포커스를 '전시물의 정면'에서 계산합니다.
//    front = 전시물이 손님을 바라보는 방향(단위 벡터)
//    관람 지점 = 전시물 중심 + front × stand  (걸어서 설 수 있는 빈 바닥)
//    카메라 각도 = atan2(front.x, front.z)  ← 이 값이면 화면이 정면입니다

import { LOUNGE, LOUNGE_FRONT } from './layout.js'
import { CONCIERGE_STAND } from './colliders.js'

const frontTheta = (front) => Math.atan2(front[0], front[1])

// 전시물 중심·정면·관람 거리로 프리셋을 만듭니다.
const view = ({ display, front, stand, eyeY = 1.3, radius = 3.4, phi = 1.45 }) => ({
  target: [display[0] + front[0] * stand, eyeY, display[1] + front[1] * stand],
  theta: frontTheta(front),
  phi,
  radius,
})

// 05 라운지 — 곡선 소파 정면
const LOUNGE_DISPLAY = [LOUNGE.sofa.x, LOUNGE.sofa.z + 0.2]
const loungeView = (radius, stand = 3.0, eyeY = 1.15, phi = 1.45) =>
  view({ display: LOUNGE_DISPLAY, front: LOUNGE_FRONT, stand, eyeY, radius, phi })

export const ZONES = [
  {
    id: 'lobby',
    no: 1,
    name: '웰컴 로비',
    short: '로비',
    desc: '지점 안내 · 상담 매니저',
    // 입구에서 매니저·안내 데스크를 정면으로 바라보는 자리
    target: [1.2, 1.5, 4.0],
    theta: -0.28,
    phi: 1.5,
    radius: 6.2,
    marker: [-0.6, 0.02, 8.9],
    bounds: [-12, 12, 3.6, 10.5],
    narrow: { target: [2.0, 1.5, 5.2], theta: -0.28, phi: 1.46, radius: 3.8 },
  },
  {
    id: 'mineral',
    no: 2,
    name: '오륜미네랄 전시대',
    short: '오륜미네랄',
    desc: '시그니처 · 1,000ml',
    ...view({ display: [-2.8, 1.4], front: [0, 1], stand: 1.5, eyeY: 1.28, radius: 3.0, phi: 1.44 }),
    marker: [-4.4, 0.02, 4.4],
    bounds: [-8, 3, -2, 6],
    narrow: view({ display: [-2.8, 1.4], front: [0, 1], stand: 1.45, eyeY: 1.3, radius: 2.5, phi: 1.43 }),
  },
  {
    id: 'enzyme',
    no: 3,
    name: '효소세상 컬렉션',
    short: '효소세상',
    desc: '누끼 진열 6종',
    ...view({ display: [-11.05, -0.4], front: [1, 0], stand: 1.8, eyeY: 1.18, radius: 3.8, phi: 1.46 }),
    marker: [-8.4, 0.02, 1.2],
    bounds: [-12, -4, -6, 5],
    narrow: view({ display: [-11.05, -0.4], front: [1, 0], stand: 1.8, eyeY: 1.25, radius: 4.2, phi: 1.47 }),
  },
  {
    id: 'experience',
    no: 4,
    name: '성분 · 체험 존',
    short: '성분·체험',
    desc: '성분 안내 · 루틴 진단',
    ...view({ display: [-0.9, -8.55], front: [0, 1], stand: 1.95, eyeY: 1.25, radius: 3.6, phi: 1.47 }),
    marker: [0, 0.02, -4.6],
    bounds: [-7, 7, -10.5, -2],
    narrow: view({ display: [-0.9, -8.55], front: [0, 1], stand: 1.9, eyeY: 1.25, radius: 3.1, phi: 1.46 }),
  },
  {
    id: 'lounge',
    no: 5,
    name: '파트너 라운지',
    short: '라운지',
    desc: '우드 라운지 · 상담',
    ...loungeView(3.0),
    marker: [LOUNGE.marker[0], 0.02, LOUNGE.marker[1]],
    bounds: [3.6, 12, -3, 8],
    narrow: loungeView(2.6, 2.9, 1.12, 1.44),
  },
]

export const zoneById = (id) => ZONES.find((z) => z.id === id) ?? ZONES[0]

// 효소세상 진열대 위 제품 z 좌표 (EnzymeZone 과 같은 값)
export const ENZYME_Z = [2.45, 1.25, 0.05, -1.15, -2.35, -3.55]
export const ENZYME_X = -11.05

// 오륜미네랄 시그니처 병 위치
export const MINERAL_POS = [-2.8, 0.9, 1.35]

// 상품을 눌렀을 때 카메라가 부드럽게 다가가는 위치 — 전시물 정면에서 관람
export function productFocus(product, narrow = false) {
  if (!product) return null
  if (product.zone === 'mineral') {
    return {
      target: [-2.8, narrow ? 1.3 : 1.28, 2.88],
      theta: 0,
      phi: narrow ? 1.43 : 1.44,
      radius: narrow ? 1.8 : 2.2,
    }
  }
  const i = ['fit30', 'fit3', 'bioenergy', 'zymogen', 'cleanbiome', 'cleanbiome1'].indexOf(product.id)
  const z = ENZYME_Z[i >= 0 ? i : 3]
  return {
    target: [ENZYME_X + 1.5, narrow ? 1.02 : 1.02, z],
    theta: Math.PI / 2,
    phi: 1.44,
    radius: narrow ? 1.5 : 1.9,
  }
}

// ─────────────────────────────────────────────────────────────
// 정면 정렬 대상 — 손님이 이 전시물 앞에 멈추면 카메라가 정면으로 서도록
//  · pos: 전시물 중심 [x, z]
//  · front: 전시물이 향한 방향
//  · stand: 전시물에서 손님이 서는 거리 (충돌 박스 바깥)
// ─────────────────────────────────────────────────────────────
export const DISPLAYS = [
  { id: 'mineral', zone: 'mineral', pos: [-2.8, 1.4], front: [0, 1], stand: 1.5, eyeY: 1.28 },
  ...ENZYME_Z.map((z, i) => ({
    id: `enzyme-${i}`,
    zone: 'enzyme',
    pos: [ENZYME_X, z],
    front: [1, 0],
    stand: 1.5,
    eyeY: 1.02,
  })),
  { id: 'experience', zone: 'experience', pos: [-0.9, -8.55], front: [0, 1], stand: 1.95, eyeY: 1.25 },
  { id: 'lounge', zone: 'lounge', pos: LOUNGE_DISPLAY, front: LOUNGE_FRONT, stand: 3.0, eyeY: 1.12 },
  { id: 'lounge-desk', zone: 'lounge', pos: [LOUNGE.desk.x, LOUNGE.desk.z], front: [Math.sin(LOUNGE.desk.rot), Math.cos(LOUNGE.desk.rot)], stand: 1.4, eyeY: 1.05 },
]

// 전시물 앞 이상적인 관람 지점
export const displayEye = (d) => [d.pos[0] + d.front[0] * d.stand, d.pos[1] + d.front[1] * d.stand]

// 상담 매니저 서연이 서 있는 자리 — 안내 데스크 왼쪽 옆 바닥
//  (충돌 박스와 같은 좌표를 씁니다 — 데스크를 뚫지 않는 자리)
export const CONCIERGE_POS = CONCIERGE_STAND.pos
export const CONCIERGE_ROT = -0.45

// 손님의 시선 지점에서 가장 가까운 '정면을 봐야 할 전시물'
export function nearestDisplay(x, z) {
  let best = null
  let bestDist = Infinity
  for (const d of DISPLAYS) {
    const eye = displayEye(d)
    const dist = Math.hypot(x - eye[0], z - eye[1])
    if (dist > 2.2 || dist >= bestDist) continue
    const vx = x - d.pos[0]
    const vz = z - d.pos[1]
    const along = vx * d.front[0] + vz * d.front[1]
    const lateral = Math.abs(vx * -d.front[1] + vz * d.front[0])
    if (along < 0.4 || along > d.stand + 2.4 || lateral > 1.7) continue
    best = d
    bestDist = dist
  }
  return best
}
