// 존 정의 — 카메라 프리셋 + 바닥 마커 위치
// 프리셋은 target(바라보는 점)과 spherical(theta, phi, radius)로 표현합니다.

export const ZONES = [
  {
    id: 'lobby',
    no: 1,
    name: '웰컴 로비',
    short: '로비',
    desc: '지점 안내 · 명패',
    target: [0, 1.4, 15.2],
    radius: 8.2,
    theta: 0,
    phi: 1.52,
    marker: [0, 0.02, 19.4],
    bounds: [-7.6, 7.6, 10, 26],
  },
  {
    id: 'mineral',
    no: 2,
    name: '오륜미네랄 존',
    short: '오륜미네랄',
    desc: '중앙 히어로 · 220,000원',
    target: [0, 1.5, 4],
    radius: 8.4,
    theta: 0,
    phi: 1.5,
    marker: [0, 0.02, 8.4],
    bounds: [-7.6, 7.6, -1, 10],
  },
  {
    id: 'enzyme',
    no: 3,
    name: '효소세상 · 데일리 케어 존',
    short: '효소세상',
    desc: '6종 진열',
    target: [0, 1.5, -12.4],
    radius: 6.6,
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
    target: [0, 1.45, -22],
    radius: 6.6,
    theta: 0,
    phi: 1.5,
    marker: [0, 0.02, -17.4],
    bounds: [-7.2, 7.2, -28, -13],
  },
]

export const zoneById = (id) => ZONES.find((z) => z.id === id) ?? ZONES[0]

// 상담 직원 순찰 경로 (히어로 아일랜드 반경 3.4를 피해 도는 폐곡선)
export const PATROL_PATH = [
  [0, 0, 20.5],
  [-2.6, 0, 17.6],
  [-4.9, 0, 14.5],
  [-5.2, 0, 9],
  [-4.6, 0, 6.5],
  [-2.4, 0, 0.5],
  [0, 0, -1.6],
  [3.1, 0, -1.2],
  [5.1, 0, 2.5],
  [4.6, 0, 8],
  [3.4, 0, 12.6],
  [1.8, 0, 16.2],
  [0, 0, 20.5],
]
