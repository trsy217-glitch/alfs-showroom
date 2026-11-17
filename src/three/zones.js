// 존 정의 — 넓은 홀(26×22)의 5구역
//  · 카메라 프리셋은 target(바라보는 점) + spherical(theta, phi, radius)
//  · 01 로비 / 02 오륜미네랄 / 03 효소세상 / 04 성분·체험 / 05 파트너 라운지

export const ZONES = [
  {
    id: 'lobby',
    no: 1,
    name: '웰컴 로비',
    short: '로비',
    desc: '지점 안내 · 상담 매니저',
    target: [1.2, 1.5, 4.0],
    theta: -0.05,
    phi: 1.5,
    radius: 6.2,
    marker: [-0.6, 0.02, 8.9],
    bounds: [-12, 12, 4, 10.5],
    narrow: { target: [2.3, 1.5, 5.5], theta: 0.0, phi: 1.46, radius: 4.4 },
  },
  {
    id: 'mineral',
    no: 2,
    name: '오륜미네랄 전시대',
    short: '오륜미네랄',
    desc: '시그니처 · 1,000ml',
    target: [-2.8, 1.34, 1.3],
    theta: 0.06,
    phi: 1.45,
    radius: 6.0,
    marker: [-4.4, 0.02, 4.4],
    bounds: [-8, 3, -2, 6],
    narrow: { target: [-2.8, 1.45, 1.3], theta: 0.06, phi: 1.44, radius: 4.6 },
  },
  {
    id: 'enzyme',
    no: 3,
    name: '효소세상 컬렉션',
    short: '효소세상',
    desc: '누끼 진열 6종',
    target: [-10.6, 1.22, 0.0],
    theta: 0.95,
    phi: 1.5,
    radius: 5.2,
    marker: [-8.4, 0.02, 1.2],
    bounds: [-12, -4, -6, 5],
    narrow: { target: [-10.5, 1.25, 0.2], theta: 0.95, phi: 1.47, radius: 4.6 },
  },
  {
    id: 'experience',
    no: 4,
    name: '성분 · 체험 존',
    short: '성분·체험',
    desc: '성분 안내 · 루틴 진단',
    target: [0, 1.5, -8.4],
    theta: 0.02,
    phi: 1.5,
    radius: 6.7,
    marker: [0, 0.02, -4.6],
    bounds: [-7, 7, -10.5, -2],
    narrow: { target: [0, 1.5, -8.3], theta: 0.02, phi: 1.48, radius: 5.4 },
  },
  {
    id: 'lounge',
    no: 5,
    name: '파트너 라운지',
    short: '라운지',
    desc: '우드 라운지 · 상담',
    target: [10.0, 1.3, 2.6],
    theta: -1.95,
    phi: 1.51,
    radius: 7.7,
    marker: [5.2, 0.02, 3.4],
    bounds: [3, 12, -3, 8],
    narrow: { target: [9.8, 1.3, 3.0], theta: -1.9, phi: 1.48, radius: 5.8 },
  },
]

export const zoneById = (id) => ZONES.find((z) => z.id === id) ?? ZONES[0]

// 효소세상 진열대 위 제품 z 좌표 (EnzymeZone 과 같은 값)
export const ENZYME_Z = [2.45, 1.25, 0.05, -1.15, -2.35, -3.55]
export const ENZYME_X = -11.05

// 오륜미네랄 시그니처 병 위치
export const MINERAL_POS = [-2.8, 0.9, 1.35]

// 상품을 눌렀을 때 카메라가 부드럽게 다가가는 위치
export function productFocus(product, narrow = false) {
  if (!product) return null
  if (product.zone === 'mineral') {
    return {
      target: [-2.8, narrow ? 1.55 : 1.45, 1.35],
      theta: narrow ? 0.06 : 0.12,
      phi: narrow ? 1.44 : 1.42,
      radius: narrow ? 3.2 : 2.9,
    }
  }
  const i = ['fit30', 'fit3', 'bioenergy', 'zymogen', 'cleanbiome', 'cleanbiome1'].indexOf(product.id)
  const z = ENZYME_Z[i >= 0 ? i : 3]
  return {
    target: [ENZYME_X + 0.25, 1.06, z],
    theta: narrow ? 1.3 : 1.24,
    phi: 1.42,
    radius: narrow ? 2.9 : 2.5,
  }
}

// 상담 매니저 서연이 서 있는 자리 — 로비 안내 데스크 옆
export const CONCIERGE_POS = [2.7, 0, 6.3]
export const CONCIERGE_ROT = -0.4
