// 쇼룸의 좌표계와 카메라 프리셋을 한곳에서 관리합니다. (1 unit = 1m)

export const ROOM = {
  width: 16, // x: -8 ~ 8
  depth: 22, // z: -12 ~ 10
  height: 4.8,
  wall: 0.5,
}

export const ARCHES = {
  back: [{ x: 0, width: 3.4, spring: 2.5 }],
  left: [
    { z: -7.0, width: 2.5, spring: 2.25 },
    { z: 1.1, width: 2.1, spring: 2.35 },
  ],
  right: [
    { z: -6.3, width: 3.2, spring: 2.35 },
    { z: 2.9, width: 2.9, spring: 2.45 },
  ],
  front: [{ x: 0, width: 4.6, spring: 2.05 }],
}

// 주요 집기 위치
export const FIXTURE = {
  mineralPlinth: [-8.32, -7.0], // x, z  (벽감 안)
  mineralVase: [-7.55, 9.6],
  enzymeConsole: [8.5, -6.3], // x, z
  lobbyPedestal: [-2.5, 6.5],
  bench: [2.9, 7.1],
  partnerTable: [5.1, 3.0],
  brandBench: [0, -11.1],
}

export const ZONES = [
  {
    id: 'lobby',
    no: '01',
    name: '아틀리에 로비',
    sub: 'Brand Wall · Collection',
    pose: { pos: [0.9, 3.35, 9.0], target: [0, 1.55, -5.0] },
    /* 로비는 자유 시점 */
    limits: { minDist: 2.6, maxDist: 9.5, minPitch: 0.02, maxPitch: 0.55 },
  },
  {
    id: 'mineral',
    no: '02',
    name: '오륜미네랄',
    sub: 'Signature 1,000ml',
    pose: { pos: [-6.2, 1.45, -5.7], target: [-8.3, 1.2, -7.0] },
    limits: { minDist: 0.85, maxDist: 3.4, minPitch: -0.05, maxPitch: 0.42 },
  },
  {
    id: 'enzyme',
    no: '03',
    name: '하루 1.3핏 · 클린바이옴',
    sub: '30 Days · 3 Days · Grapefruit',
    pose: { pos: [6.15, 1.45, -4.75], target: [8.4, 1.12, -6.3] },
    limits: { minDist: 0.85, maxDist: 3.4, minPitch: -0.05, maxPitch: 0.42 },
  },
  {
    id: 'b2b',
    no: '04',
    name: 'B2B 파트너 라운지',
    sub: 'Partners · Quotation',
    pose: { pos: [1.9, 1.98, 6.1], target: [5.35, 1.0, 3.0] },
    limits: { minDist: 1.5, maxDist: 5.0, minPitch: 0.0, maxPitch: 0.5 },
  },
]

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]))

// 바닥 링 핫스팟 (존 이동)
export const HOTSPOTS = [
  { id: 'mineral', no: '02', name: '오륜미네랄', at: [-4.4, -4.4] },
  { id: 'enzyme', no: '03', name: '하루 1.3핏', at: [4.5, -3.9] },
  { id: 'b2b', no: '04', name: 'B2B 라운지', at: [3.3, 5.2] },
]

// 제품 클로즈업 카메라 (제품 anchor 기준)
export function productPose(product) {
  const a = product.anchor
  const v = product.view
  const len = Math.hypot(v[0], v[2]) || 1
  const dist = 1.2
  const dx = (v[0] / len) * dist
  const dz = (v[2] / len) * dist
  return {
    pos: [a[0] + dx, a[1] + 0.16, a[2] + dz],
    target: [a[0], a[1] - 0.02, a[2]],
  }
}
