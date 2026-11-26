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
  enzymeConsole: [5.12, -5.6],
  lobbyPedestal: [-2.0, 3.9],
  bench: [2.05, 4.55],
  partnerTable: [3.35, -0.25],
  brandBench: [0, -7.8],
  artPanel: [-6.16, 1.5],
  partnerBoard: [6.0, 2.6],
  centerTable: [-1.25, -0.95],
  routineKiosk: [-3.55, -6.5],
}

// 존 전담 매니저가 서 있는 자리 (at: [x, y, z], ry: 바라보는 방향, signAt: 바닥 명패 위치)
export const STAFF_SPOTS = {
  mineral: { at: [-5.9, 0, -4.1], ry: 1.2, signAt: [-5.56, -3.8], signRy: 1.15 },
  enzyme: { at: [5.86, 0, -4.15], ry: -1.05, signAt: [5.2, -3.72], signRy: -1.1 },
}

export const ZONES = [
  {
    id: 'lobby',
    no: '01',
    name: '아틀리에 로비',
    short: '로비',
    sub: 'Brand Wall · Collection',
    pose: { pos: [0.3, 2.45, 5.45], target: [-0.15, 1.26, -4.5] },
    mobile: { pos: [-0.1, 1.98, 5.45], target: [-0.75, 1.12, -4.4] },
    limits: { minDist: 2.0, maxDist: 7.0, minPitch: 0.0, maxPitch: 0.45, yawRange: 0.7 },
  },
  {
    id: 'mineral',
    no: '02',
    name: '오륜미네랄',
    short: '오륜',
    sub: 'Signature 1,000ml',
    // 연단과 그 옆의 전담 매니저가 한 화면에 들어오는 2샷
    pose: { pos: [-3.62, 1.7, -3.45], target: [-5.66, 1.0, -4.5] },
    mobile: { pos: [-3.5, 1.5, -2.95], target: [-5.66, 1.1, -4.32] },
    limits: { minDist: 1.2, maxDist: 3.6, minPitch: -0.05, maxPitch: 0.4, yawRange: 0.8 },
  },
  {
    id: 'enzyme',
    no: '03',
    name: '하루 1.3핏 · 클린바이옴',
    short: '1.3핏',
    sub: '30 Days · 3 Days · Grapefruit',
    // 콘솔의 네 제품과 매니저가 함께 보이는 각도
    pose: { pos: [2.9, 1.5, -2.6], target: [5.12, 1.12, -5.35] },
    mobile: { pos: [2.9, 1.5, -2.6], target: [5.12, 1.12, -5.26] },
    limits: { minDist: 1.2, maxDist: 4.6, minPitch: -0.05, maxPitch: 0.4, yawRange: 0.85 },
  },
  {
    id: 'b2b',
    no: '04',
    name: 'B2B 파트너 라운지',
    short: 'B2B',
    sub: 'Partners · Quotation',
    // 라운지 테이블과 파트너 보드를 함께 보는 화면
    pose: { pos: [-0.8, 1.8, 3.4], target: [3.4, 1.1, 0.7] },
    mobile: { pos: [-0.35, 1.68, 3.85], target: [4.4, 1.26, 1.85] },
    limits: { minDist: 1.5, maxDist: 5.0, minPitch: 0.0, maxPitch: 0.45, yawRange: 0.9 },
  },
  {
    id: 'routine',
    no: '05',
    name: '나의 건강최적 루틴관리 시스템',
    short: '루틴',
    sub: 'Routine Kiosk · Morning · Lunch · Evening',
    // 브랜드 월 왼쪽의 루틴 키오스크를 정면으로 보는 화면
    pose: { pos: [-1.05, 1.6, -4.2], target: [-3.55, 1.2, -6.5] },
    mobile: { pos: [-1.0, 1.52, -3.95], target: [-3.55, 1.24, -6.5] },
    limits: { minDist: 1.2, maxDist: 4.2, minPitch: -0.05, maxPitch: 0.42, yawRange: 0.85 },
  },
]

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]))

// 바닥 링 핫스팟 (존 이동) — 링·명패·발광면 어디를 눌러도 이동합니다.
export const HOTSPOTS = [
  { id: 'mineral', no: '02', name: '오륜미네랄', at: [-2.55, -2.85] },
  { id: 'enzyme', no: '03', name: '하루 1.3핏', at: [2.55, -2.45] },
  { id: 'b2b', no: '04', name: 'B2B 라운지', at: [1.9, 3.15] },
  { id: 'routine', no: '05', name: '건강최적 루틴', at: [-2.35, -5.3] },
]

// 제품 클로즈업 카메라 (제품 anchor 기준)
export function productPose(product, mode = 'desktop') {
  const a = product.anchor
  const v = product.view
  const len = Math.hypot(v[0], v[2]) || 1
  const dist = (product.zoom || 1.25) * (mode === 'mobile' ? 0.82 : 1)
  const dx = (v[0] / len) * dist
  const dz = (v[2] / len) * dist
  return {
    pos: [a[0] + dx, a[1] + 0.3, a[2] + dz],
    target: [a[0], a[1] - 0.04, a[2]],
  }
}
