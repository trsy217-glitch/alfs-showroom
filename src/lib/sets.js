import { allProducts, calcShipping, enzymeProducts, mineralProduct, productById, won } from '../config/catalog.js'

// 세트 = 상품 묶음. 합계·배송비는 카탈로그 실제 가격으로 계산합니다.
const raw = [
  {
    id: 'first',
    name: '첫 걸음 세트',
    items: [['cleanbiome1', 1]],
    goals: ['unsure'],
    note: '한 병으로 먼저 구성과 맛을 확인하는 조합입니다.',
  },
  {
    id: 'reset3',
    name: '3일 리셋 세트',
    items: [['fit3', 1]],
    goals: ['reset3', 'program30'],
    note: '3일 분량으로 짧게 시작하는 구성입니다.',
  },
  {
    id: 'daily',
    name: '매일 기본 세트',
    items: [['oryun', 1]],
    goals: ['daily', 'unsure'],
    note: '물에 희석해 매일 마시는 기본 구성입니다.',
  },
  {
    id: 'dailyCare',
    name: '매일 + 클린바이옴 세트',
    items: [
      ['oryun', 1],
      ['cleanbiome', 1],
    ],
    goals: ['daily'],
    note: '매일 마시는 미네랄에 희석 음료 6병을 더한 구성입니다.',
  },
  {
    id: 'program30',
    name: '30일 프로그램 세트',
    items: [['fit30', 1]],
    goals: ['program30', 'daily'],
    note: '30일 동안 나눠 마시는 프로그램 구성입니다.',
  },
  {
    id: 'gift',
    name: '소개·선물 세트',
    items: [
      ['zymogen', 1],
      ['cleanbiome1', 1],
    ],
    goals: ['gift', 'unsure'],
    note: '병 제품 두 가지를 함께 담아 건네기 좋은 구성입니다.',
  },
  {
    id: 'full',
    name: '전체 라인업 세트',
    items: allProducts.map((p) => [p.id, 1]),
    goals: ['program30'],
    note: '쇼룸에 진열된 7종을 모두 담은 구성입니다.',
  },
]

export const sets = raw.map((s) => {
  const items = s.items.map(([id, qty]) => ({ product: productById(id), qty }))
  const subtotal = items.reduce((sum, it) => sum + it.product.price * it.qty, 0)
  const { fee } = calcShipping(items)
  return { ...s, items, subtotal, shipping: fee, total: subtotal + fee }
})

export const budgetCaps = {
  u50: { label: '5만 원 이하', cap: 50000 },
  u100: { label: '10만 원 안팎', cap: 150000 },
  u300: { label: '20만~30만 원', cap: 300000 },
  u400: { label: '40만 원까지', cap: 450000 },
}

export const goalLabels = {
  daily: '매일 마시는 기본 관리',
  reset3: '짧게 3일 리셋',
  program30: '30일 프로그램',
  gift: '선물·가족',
  unsure: '아직 잘 모르겠다',
}

export const existingLabels = {
  none: '없음',
  mineral: '미네랄만',
  enzyme: '효소도',
}

// 3문항 → 추천 세트 2개
export function recommend({ goal, budget, existing }) {
  const cap = budgetCaps[budget]?.cap ?? 150000
  const scored = sets
    .map((set) => {
      let score = 0
      // 첫 번째 목적이면 4점, 보조 목적이면 1.5점
      const goalIndex = set.goals.indexOf(goal)
      if (goalIndex === 0) score += 4
      else if (goalIndex > 0) score += 1.5
      if (goal === 'unsure' && set.id === 'first') score += 1
      if (set.id === 'full' && goal !== 'program30') score -= 4
      if (set.total <= cap) score += 2
      else score -= Math.min(4, Math.ceil((set.total - cap) / 100000) + 1)
      const hasMineral = set.items.some((it) => it.product.group === 'mineral')
      const hasEnzyme = set.items.some((it) => it.product.group === 'enzyme')
      if (existing === 'mineral' && hasMineral) score -= 1
      if (existing === 'enzyme' && hasEnzyme) score -= 1
      if (existing === 'none' && set.items.length > 1) score -= 0.5
      return { set, score }
    })
    .sort((a, b) => b.score - a.score)

  const primary = scored[0].set
  const alternative = scored.find((s) => s.set.id !== primary.id)?.set ?? null
  const overBudget = primary.total > cap
  return {
    primary,
    alternative,
    overBudget,
    cap,
    zone: primary.items.some((it) => it.product.group === 'mineral') ? 'mineral' : 'enzyme',
    summary: `${goalLabels[goal]} · 예산 ${budgetCaps[budget]?.label ?? '-'} · 지금 ${existingLabels[existing] ?? '-'}`,
  }
}

export const priceLine = (p) => {
  if (p.listPrice && p.listPrice > p.price) {
    return `${won(p.price)} (정가 ${won(p.listPrice)})`
  }
  return won(p.price)
}

export const enzymeListLine = enzymeProducts
  .map((p) => `· ${p.name} — ${p.volume} · ${won(p.price)}`)
  .join('\n')

export const mineralLine = `${mineralProduct.name} — ${mineralProduct.option} · ${won(mineralProduct.price)}`
