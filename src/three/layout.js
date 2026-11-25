// 쇼룸의 좌표계와 카메라 프리셋을 한곳에서 관리합니다. (1 unit = 1m)

export const ROOM = {
  width: 13, // x: -6.5 ~ 6.5
  depth: 17, // z: -10 ~ 7
  height: 4.4,
  wall: 0.4,
}

export const ARCHES = {
  back: [{ x: 0, width: 4.4, spring: 1.95 }],
  left: [
    { z: -6.2, width: 2.6, spring: 2.1 },
    { z: 1.6, width: 2.2, spring: 2.3 },
  ],
  right: [
    { z: -5.6, width: 3.4, spring: 2.15 },
    { z: 2.2, width: 2.8, spring: 2.2 },
  ],
  front: [{ x: 0, width: 4.6, spring: 1.9 }],
}

// 주요 집기 위치 (x, z)
export const FIXTURE = {
  mineralPlinth: [-6.85, -6.2],
  enzymeConsole: [6.9, -5.6],
  lobbyPedestal: [-2.3, 4.4],
  bench: [2.35, 5.15],
  partnerTable: [4.0, 1.8],
  brandBench: [0, -9.25],
  artPanel: [-7.16, 1.6],
  partnerBoard: [7.0, 2.2],
}

export const ZONES = [
  {
    id: 'lobby',
    no: '01',
    name: '아틀리에 로비',
    sub: 'Brand Wall · Collection',
    pose: { pos: [0.75, 2.55, 6.2], target: [-0.1, 1.42, -5.2] },
    limits: { minDist: 2.2, maxDist: 8.0, minPitch: 0.0, maxPitch: 0.5, yawRange: 0.8 },
  },
  {
    id: 'mineral',
    no: '02',
    name: '오륜미네랄',
    sub: 'Signature 1,000ml',
    pose: { pos: [-4.95, 1.34, -5.15], target: [-6.85, 1.18, -6.2] },
    limits: { minDist: 0.8, maxDist: 3.0, minPitch: -0.05, maxPitch: 0.4, yawRange: 0.8 },
  },
  {
    id: 'enzyme',
    no: '03',
    name: '하루 1.3핏 · 클린바이옴',
    sub: '30 Days · 3 Days · Grapefruit',
    pose: { pos: [4.95, 1.34, -4.35], target: [6.9, 1.12, -5.6] },
    limits: { minDist: 0.8, maxDist: 3.2, minPitch: -0.05, maxPitch: 0.4, yawRange: 0.85 },
  },
  {
    id: 'b2b',
    no: '04',
    name: 'B2B 파트너 라운지',
    sub: 'Partners · Quotation',
    pose: { pos: [1.15, 1.72, 4.85], target: [4.2, 0.95, 1.85] },
    limits: { minDist: 1.4, maxDist: 4.6, minPitch: 0.0, maxPitch: 0.45, yawRange: 0.9 },
  },
]

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]))

// 바닥 링 핫스팟 (존 이동)
export const HOTSPOTS = [
  { id: 'mineral', no: '02', name: '오륜미네랄', at: [-3.7, -3.6] },
  { id: 'enzyme', no: '03', name: '하루 1.3핏', at: [3.8, -3.1] },
  { id: 'b2b', no: '04', name: 'B2B 라운지', at: [2.5, 3.4] },
]

// 제품 클로즈업 카메라 (제품 anchor 기준)
export function productPose(product) {
  const a = product.anchor
  const v = product.view
  const len = Math.hypot(v[0], v[2]) || 1
  const dist = 1.15
  const dx = (v[0] / len) * dist
  const dz = (v[2] / len) * dist
  return {
    pos: [a[0] + dx, a[1] + 0.14, a[2] + dz],
    target: [a[0], a[1] - 0.03, a[2]],
  }
}
