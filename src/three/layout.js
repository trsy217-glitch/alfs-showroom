// 쇼룸의 좌표계와 카메라 프리셋을 한곳에서 관리합니다. (1 unit = 1m)

export const ROOM = {
  width: 11, // x: -5.5 ~ 5.5
  depth: 15, // z: -8.5 ~ 6.5
  height: 4.2,
  wall: 0.4,
}

export const ARCHES = {
  back: [{ x: 0, width: 4.2, spring: 1.85 }],
  left: [
    { z: -4.9, width: 2.5, spring: 2.0 },
    { z: 1.5, width: 2.1, spring: 2.2 },
  ],
  right: [
    { z: -4.3, width: 3.2, spring: 2.05 },
    { z: 2.6, width: 2.7, spring: 2.1 },
  ],
  front: [{ x: 0, width: 4.4, spring: 1.8 }],
}

// 주요 집기 위치 (x, z)
export const FIXTURE = {
  mineralPlinth: [-5.85, -4.9],
  enzymeConsole: [5.9, -4.3],
  lobbyPedestal: [-2.0, 3.9],
  bench: [2.05, 4.55],
  partnerTable: [3.35, -0.25],
  brandBench: [0, -7.8],
  artPanel: [-6.16, 1.5],
  partnerBoard: [6.0, 2.6],
  centerTable: [-1.25, -0.95],
}

export const ZONES = [
  {
    id: 'lobby',
    no: '01',
    name: '아틀리에 로비',
    sub: 'Brand Wall · Collection',
    pose: { pos: [0.3, 2.45, 5.6], target: [-0.15, 1.26, -4.5] },
    limits: { minDist: 2.0, maxDist: 7.0, minPitch: 0.0, maxPitch: 0.45, yawRange: 0.7 },
  },
  {
    id: 'mineral',
    no: '02',
    name: '오륜미네랄',
    sub: 'Signature 1,000ml',
    pose: { pos: [-4.62, 1.3, -4.08], target: [-5.85, 1.2, -4.9] },
    limits: { minDist: 0.8, maxDist: 2.8, minPitch: -0.05, maxPitch: 0.4, yawRange: 0.8 },
  },
  {
    id: 'enzyme',
    no: '03',
    name: '하루 1.3핏 · 클린바이옴',
    sub: '30 Days · 3 Days · Grapefruit',
    pose: { pos: [4.55, 1.32, -3.42], target: [5.9, 1.15, -4.3] },
    limits: { minDist: 0.8, maxDist: 3.0, minPitch: -0.05, maxPitch: 0.4, yawRange: 0.85 },
  },
  {
    id: 'b2b',
    no: '04',
    name: 'B2B 파트너 라운지',
    sub: 'Partners · Quotation',
    pose: { pos: [0.85, 1.55, 3.95], target: [4.25, 1.2, 1.7] },
    limits: { minDist: 1.3, maxDist: 4.2, minPitch: 0.0, maxPitch: 0.45, yawRange: 0.9 },
  },
]

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]))

// 바닥 링 핫스팟 (존 이동)
export const HOTSPOTS = [
  { id: 'mineral', no: '02', name: '오륜미네랄', at: [-2.55, -2.85] },
  { id: 'enzyme', no: '03', name: '하루 1.3핏', at: [2.55, -2.45] },
  { id: 'b2b', no: '04', name: 'B2B 라운지', at: [1.75, 3.5] },
]

// 제품 클로즈업 카메라 (제품 anchor 기준)
export function productPose(product) {
  const a = product.anchor
  const v = product.view
  const len = Math.hypot(v[0], v[2]) || 1
  const dist = product.zoom || 1.25
  const dx = (v[0] / len) * dist
  const dz = (v[2] / len) * dist
  return {
    pos: [a[0] + dx, a[1] + 0.3, a[2] + dz],
    target: [a[0], a[1] - 0.04, a[2]],
  }
}
