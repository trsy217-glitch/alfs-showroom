// 알프스 3D 쇼룸 상품 카탈로그
// 값의 출처: alfs.kr (2026-11-16 실제 판매가)
//   · 오륜미네랄 → repos/alfs/src/config/site.js
//   · 효소세상 6종 → repos/alfs/src/config/enzyme.js
// ⚠️ 식품표시광고법: 질병 예방·치료, 기능성, 다이어트 같은 효능 표현은 쓰지 않습니다.
//    설명은 구성·용량·섭취 방법 같은 사실만 적습니다.

export const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

// 배송 정책 (상품군마다 다름 — 설계안 2장)
export const shippingPolicy = {
  mineral: { fee: 3000, freeOver: 50000, carrier: '한진택배', label: '기본 3,000원 · 5만 원 이상 무료 · 한진택배' },
  enzyme: { fee: 4000, freeOver: 50000, carrier: '택배', label: '기본 4,000원 · 5만 원 이상 무료 · 제주·도서 추가 6,000원' },
}

export const mineralProduct = {
  id: 'oryun',
  zone: 'mineral',
  group: 'mineral',
  name: '오륜미네랄',
  volume: '1,000ml',
  option: '1,000ml 1병',
  price: 220000,
  listPrice: null,
  badge: '쇼룸 메인',
  image: '/images/oryun-poster.webp',
  imageAlt: '오륜미네랄 1,000ml 병',
  summary:
    '충북 보은의 어린 뽕잎과 누에에서 얻은 바이오 미네랄 원액입니다. 물에 10~30배 희석해 마시는 제품이고, 1,000ml 한 병으로 구성됩니다.',
  facts: [
    ['식품유형', '기타가공품'],
    ['내용량', '1,000ml 1병'],
    ['제조원', '유디아미네랄 (충북 보은)'],
    ['섭취 방법', '원액을 물에 10~30배 희석 (제품 라벨 안내를 따름)'],
    ['보관방법', '실온 보관 (직사광선을 피해 서늘한 곳)'],
    ['유통기한', '제조일로부터 3년'],
    ['원산지', '대한민국'],
    ['배송비', '3,000원 · 50,000원 이상 무료 · 한진택배'],
  ],
  points: ['50여 종 미네랄 함유 뽕잎 원료', '물에 희석해 마시는 원액', '1,000ml 1병'],
  alfsUrl: 'https://alfs.kr/products',
  alfsLabel: 'alfs.kr 오륜미네랄 페이지',
}

export const enzymeProducts = [
  {
    id: 'fit30',
    zone: 'enzyme',
    group: 'enzyme',
    name: '1.3fit 30일',
    fullName: '1.3fit 30일 클렌즈 프로그램',
    volume: '엔자임밀 9포 + 클린바이옴 3병',
    option: '엔자임밀 200ml 9포 + 클린바이옴 100ml 3병',
    price: 396000,
    listPrice: 600000,
    badge: '30일',
    image: '/images/enzyme/13fit-30d.webp',
    imageAlt: '1.3fit 30일 클렌즈 프로그램 박스와 엔자임밀 파우치, 클린바이옴 병',
    summary:
      '엔자임밀 파우치와 클린바이옴 병을 30일 동안 나눠 마시는 구성입니다. 파우치와 병으로 나뉘어 있어 하루 분량을 챙기기 쉽고, 설탕을 넣지 않은 제품입니다.',
    facts: [
      ['구성', '엔자임밀 200ml × 9포 + 클린바이옴 100ml × 3병'],
      ['제조사', '효소세상'],
      ['원산지', '국산(경기도 여주시)'],
      ['특징', '무설탕 · 실온보관'],
      ['섭취 방법', '파우치는 물에 풀어 마시고, 클린바이옴은 물에 희석 (라벨 안내를 따름)'],
      ['배송비', '무료배송'],
    ],
    points: ['엔자임밀 파우치 9포', '클린바이옴 병 3병', '무설탕 · 실온보관'],
    alfsUrl: 'https://alfs.kr/products/enzyme',
  },
  {
    id: 'fit3',
    zone: 'enzyme',
    group: 'enzyme',
    name: '1.3fit 3일',
    fullName: '1.3fit 3일 클렌즈',
    volume: '3일 분량',
    option: '3일 구성 (엔자임밀 + 클린바이옴)',
    price: 99000,
    listPrice: 150000,
    badge: '3일',
    image: '/images/enzyme/13fit-3d.webp',
    imageAlt: '1.3fit 3일 클렌즈 박스와 엔자임밀 파우치, 클린바이옴 병',
    summary:
      '30일 프로그램과 같은 엔자임밀·클린바이옴을 3일 분량으로 묶은 구성입니다. 처음 써 보거나 짧게 시험해 보려는 분들이 찾는 상품입니다.',
    facts: [
      ['구성', '3일 분량 (엔자임밀 · 클린바이옴)'],
      ['브랜드', '1.3fit (일쩜삼)'],
      ['섭취 방법', '제품 라벨 안내를 따름'],
      ['배송비', '무료배송'],
    ],
    points: ['3일 분량 구성', '엔자임밀 + 클린바이옴', '무료배송'],
    alfsUrl: 'https://alfs.kr/products/enzyme',
  },
  {
    id: 'bioenergy',
    zone: 'enzyme',
    group: 'enzyme',
    name: '바이오에너지',
    fullName: '바이오에너지 클렌즈 프로그램',
    volume: '200ml × 8포',
    option: '200ml × 8포 (파우치)',
    price: 220000,
    listPrice: null,
    badge: '8포',
    image: '/images/enzyme/bioenergy.webp',
    imageAlt: '바이오에너지 클렌즈 프로그램 박스와 파우치 8포',
    summary:
      '발효 효소를 파우치에 담은 8포 구성입니다. K·I·L 클린과 L-케어 파우치가 한 상자에 들어 있어, 하루 한 포씩 챙겨 마시는 방식으로 쓰입니다.',
    facts: [
      ['구성', '200ml × 8포'],
      ['제조사', '효소세상'],
      ['원산지', '국산(경기도 이천시)'],
      ['특징', '무설탕 · 실온보관'],
      ['배송비', '무료배송'],
    ],
    points: ['200ml 파우치 8포', '발효 효소', '무설탕 · 실온보관'],
    alfsUrl: 'https://alfs.kr/products/enzyme',
  },
  {
    id: 'zymogen',
    zone: 'enzyme',
    group: 'enzyme',
    name: '자이모젠',
    fullName: '자이모젠 (Zymogen)',
    volume: '100ml × 10병',
    option: '100ml × 10병 (1,000ml)',
    price: 180000,
    listPrice: null,
    badge: '10병',
    image: '/images/enzyme/zymogen.webp',
    imageAlt: '자이모젠 박스와 병 제품',
    summary:
      '효소세상의 미생물 발효 음용 제품입니다. 100ml 병 10병이 한 상자에 담겨 오는 구성으로, 한 병씩 꺼내 마시면 됩니다.',
    facts: [
      ['구성', '100ml × 10병 (1,000ml)'],
      ['제조', '효소세상'],
      ['원산지', '국산(경기도 여주시)'],
      ['배송비', '무료배송'],
    ],
    points: ['100ml 10병 (1,000ml)', '박스 포장', '실온보관'],
    alfsUrl: 'https://alfs.kr/products/enzyme',
  },
  {
    id: 'cleanbiome',
    zone: 'enzyme',
    group: 'enzyme',
    name: '클린바이옴 자몽',
    fullName: '클린바이옴 자몽',
    volume: '100ml × 6병',
    option: '100ml × 6병',
    price: 107100,
    listPrice: 126000,
    badge: '6병',
    image: '/images/enzyme/cleanbiome-grapefruit.webp',
    imageAlt: '클린바이옴 자몽 미생물 발효 음료 100ml 병',
    summary:
      '자몽 맛 미생물 발효 음료 100ml 6병 구성입니다. 상온의 물에 한 병을 희석해 마시는 방식이라, 물만으로는 심심할 때 챙기기 좋습니다.',
    facts: [
      ['구성', '100ml × 6병'],
      ['브랜드', '클린바이옴'],
      ['원산지', '국산'],
      ['섭취 방법', '상온의 물 300~500ml에 한 병을 희석해 5분 안에 마심'],
      ['배송비', '무료배송'],
    ],
    points: ['100ml 6병', '자몽 맛', '물에 희석해 마시는 음료'],
    alfsUrl: 'https://alfs.kr/products/enzyme',
  },
  {
    id: 'cleanbiome1',
    zone: 'enzyme',
    group: 'enzyme',
    name: '클린바이옴 1병',
    fullName: '클린바이옴 1병',
    volume: '100ml × 1병',
    option: '100ml × 1병',
    price: 19950,
    listPrice: 21000,
    badge: '1병',
    image: '/images/enzyme/cleanbiome-1bottle.webp',
    imageAlt: '클린바이옴 미생물 발효 음료 100ml 병 1병',
    summary:
      '클린바이옴 6병 구성과 같은 100ml 병을 한 병만 담은 상품입니다. 여섯 병을 한 번에 사기 전에 한 병만 먼저 써 보려는 분들이 찾습니다.',
    facts: [
      ['구성', '100ml × 1병'],
      ['브랜드', '클린바이옴'],
      ['원산지', '국산(경기도 여주시)'],
      ['배송비', '4,000원 (50,000원 이상 무료배송)'],
    ],
    points: ['100ml 1병', '물에 희석해 마시는 음료', '5만 원 미만은 배송비 4,000원'],
    alfsUrl: 'https://alfs.kr/products/enzyme',
  },
]

export const allProducts = [mineralProduct, ...enzymeProducts]
export const productById = (id) => allProducts.find((p) => p.id === id)

// 상품군별 배송비 (합계 기준으로 두 기준을 나눠 적용)
export function calcShipping(items) {
  const groups = { mineral: 0, enzyme: 0 }
  for (const { product, qty = 1 } of items) {
    groups[product.group] = (groups[product.group] || 0) + product.price * qty
  }
  let fee = 0
  const detail = []
  if (groups.mineral > 0) {
    const f = groups.mineral >= shippingPolicy.mineral.freeOver ? 0 : shippingPolicy.mineral.fee
    fee += f
    detail.push({ group: 'mineral', subtotal: groups.mineral, fee: f })
  }
  if (groups.enzyme > 0) {
    const f = groups.enzyme >= shippingPolicy.enzyme.freeOver ? 0 : shippingPolicy.enzyme.fee
    fee += f
    detail.push({ group: 'enzyme', subtotal: groups.enzyme, fee: f })
  }
  return { fee, detail }
}

export const discountRate = (p) =>
  p.listPrice && p.listPrice > p.price ? Math.round((1 - p.price / p.listPrice) * 100) : 0
