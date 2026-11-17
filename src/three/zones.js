// 존 정의 — 카메라 프리셋 + 바닥 마커 위치
// 프리셋은 target(바라보는 점)과 spherical(theta, phi, radius)로 표현합니다.

export const ZONES = [
  {
    id: 'lobby',
    no: 1,
    name: '웰컴 로비',
    short: '로비',
    desc: '지점 안내 · 명패',
    target: [0, 1.45, 15.0],
    radius: 8.2,
    theta: 0,
    phi: 1.5,
    marker: [0, 0.02, 19.4],
    bounds: [-7.6, 7.6, 10, 26],
  },
  {
    id: 'mineral',
    no: 2,
    name: '오륜미네랄 존',
    short: '오륜미네랄',
    desc: '중앙 시그니처 · 1,000ml',
    target: [0, 1.55, 4],
    radius: 8.4,
    theta: 0,
    phi: 1.48,
    marker: [0, 0.02, 8.4],
    bounds: [-7.6, 7.6, -1, 10],
  },
  {
    id: 'enzyme',
    no: 3,
    name: '효소세상 · 데일리 케어 존',
    short: '효소세상',
    desc: '6종 진열',
    target: [0, 1.86, -11.9],
    radius: 7.6,
    theta: 0,
    phi: 1.5,
    marker: [0, 0.02, -5.6],
    bounds: [-7.6, 7.6, -15, -5],
  },
  {
    id: 'simulator',
    no: 4,
    name: '고객 루틴 시뮬레이터 존',
    short: '루틴 시뮬레이터',
    desc: '3문항 → 세트 추천',
    target: [0, 1.45, -21.4],
    radius: 6.8,
    theta: 0,
    phi: 1.52,
    marker: [0, 0.02, -17.4],
    bounds: [-7.2, 7.2, -28, -13],
  },
]

export const zoneById = (id) => ZONES.find((z) => z.id === id) ?? ZONES[0]

// 효소세상 진열대 x 좌표 (EnzymeZone 과 같은 값)
export const ENZYME_X = [-4.4, -2.64, -0.88, 0.88, 2.64, 4.4]

// 상품을 눌렀을 때 카메라가 부드럽게 다가가는 위치
export function productFocus(product, narrow = false) {
  if (!product) return null
  const detail = { theta: 0, phi: 1.42, radius: narrow ? 4.6 : 3.9 }
  if (product.zone === 'mineral') {
    return { ...detail, target: [narrow ? 0 : 0.55, narrow ? 1.9 : 1.6, 4], radius: narrow ? 7.0 : 6.2 }
  }
  const i = ['fit30', 'fit3', 'bioenergy', 'zymogen', 'cleanbiome', 'cleanbiome1'].indexOf(product.id)
  const x = ENZYME_X[i >= 0 ? i : 3]
  return {
    ...detail,
    target: [x + (narrow ? 0 : 0.75), narrow ? 2.0 : 1.9, -12.1],
    radius: narrow ? 3.9 : 3.3,
  }
}

// 상담 직원(서연)이 서 있는 자리 — 웰컴 로비 안내 데스크 옆
export const CONCIERGE_POS = [1.85, 0, 16.9]
export const CONCIERGE_ROT = -0.22
