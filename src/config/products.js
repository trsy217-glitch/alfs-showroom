// 검증된 상품 정보만 담습니다.
// 값의 출처: alfs.kr (2026-11-16 실제 판매가) — repos/alfs/src/config/site.js, enzyme.js
// ⚠️ 식품표시광고법: 질병 예방·치료, 기능성, 다이어트 같은 효능 표현은 쓰지 않습니다.
//    구성·용량·섭취 방법 같은 사실만 적습니다.
// ⚠️ 모든 제품은 건강기능식품이 아닌 일반식품입니다.

export const SHOP = {
  mineral: 'https://alfs.kr/products',
  enzyme: 'https://alfs.kr/products/enzyme',
  partner: 'https://alfs.kr/partner#apply-dist',
  kakao: 'https://pf.kakao.com/_JdTPX/chat',
}

export const GENERAL_FOOD_NOTICE =
  '본 제품은 건강기능식품이 아닌 일반식품입니다. 질병의 예방 및 치료를 위한 의약품이 아닙니다.'

export const products = [
  {
    id: 'oryun',
    zone: 'mineral',
    name: '오륜미네랄',
    fullName: '오륜미네랄 1,000ml',
    volume: '1,000ml · 1병',
    badge: '시그니처',
    price: 220000,
    listPrice: null,
    photo: '/images/cutout/mineral-1000.webp',
    model: 'mineral',
    anchor: [-8.32, 1.14, -7.0],
    view: [1, 0.1, 0.42],
    summary:
      '충북 보은의 어린 뽕잎과 누에에서 얻은 미네랄 원액입니다. 원액을 물에 10~30배 희석해 마시는 방식이고, 1,000ml 한 병으로 옵니다.',
    facts: [
      ['식품유형', '기타가공품'],
      ['내용량', '1,000ml 1병'],
      ['제조원', '유디아미네랄 (충북 보은)'],
      ['섭취 방법', '원액을 물에 10~30배 희석 (제품 라벨 안내를 따름)'],
      ['보관 방법', '직사광선을 피해 서늘한 곳에 실온 보관'],
      ['유통기한', '제조일로부터 3년'],
      ['원산지', '대한민국'],
      ['배송비', '3,000원 · 50,000원 이상 무료 · 한진택배'],
    ],
    cta: { label: 'alfs.kr에서 구매', href: SHOP.mineral, sub: 'alfs.kr' },
  },
  {
    id: 'fit30',
    zone: 'enzyme',
    name: '하루 1.3핏 30일',
    fullName: '1.3fit 30일 클렌즈 프로그램',
    volume: '엔자임밀 200ml 9포 + 클린바이옴 100ml 3병',
    badge: '30일 프로그램',
    price: 396000,
    listPrice: 600000,
    photo: '/images/cutout/fit30.webp',
    model: 'box30',
    anchor: [8.5, 1.2425, -7.2],
    view: [-1, 0.08, 0.5],
    summary:
      '엔자임밀 파우치와 클린바이옴 병을 30일 동안 나눠 마시는 구성입니다. 파우치와 병으로 나뉘어 있어 하루 분량을 챙기기 쉽고, 설탕을 넣지 않았습니다.',
    facts: [
      ['구성', '엔자임밀 200ml × 9포 + 클린바이옴 100ml × 3병'],
      ['제조사', '효소세상'],
      ['원산지', '국산(경기도 여주시)'],
      ['특징', '무설탕 · 실온보관'],
      ['섭취 방법', '파우치는 물에 풀어 마시고, 클린바이옴은 물에 희석 (라벨 안내를 따름)'],
      ['배송비', '무료배송'],
    ],
    cta: { label: 'alfs.kr에서 구매', href: SHOP.enzyme, sub: 'alfs.kr' },
  },
  {
    id: 'fit3',
    zone: 'enzyme',
    name: '하루 1.3핏 3일',
    fullName: '1.3fit 3일 클렌즈',
    volume: '3일 분량 · 엔자임밀 + 클린바이옴',
    badge: '3일',
    price: 99000,
    listPrice: 150000,
    photo: '/images/cutout/fit3.webp',
    model: 'box3',
    anchor: [8.5, 1.175, -6.35],
    view: [-1, 0.08, 0.55],
    summary:
      '30일 프로그램과 같은 엔자임밀·클린바이옴을 3일 분량으로 묶은 구성입니다. 처음 써 보거나 짧게 시험해 보려는 분들이 찾는 상품입니다.',
    facts: [
      ['구성', '3일 분량 (엔자임밀 · 클린바이옴)'],
      ['브랜드', '1.3fit (일쩜삼)'],
      ['섭취 방법', '제품 라벨 안내를 따름'],
      ['배송비', '무료배송'],
    ],
    cta: { label: 'alfs.kr에서 구매', href: SHOP.enzyme, sub: 'alfs.kr' },
  },
  {
    id: 'cleanbiome',
    zone: 'enzyme',
    name: '클린바이옴 자몽',
    fullName: '클린바이옴 자몽 100ml × 6병',
    volume: '100ml · 6병',
    badge: '6병',
    price: 107100,
    listPrice: 126000,
    photo: '/images/cutout/cleanbiome6.webp',
    model: 'cluster6',
    anchor: [8.5, 1.1175, -5.5],
    view: [-1, 0.1, 0.5],
    summary:
      '자몽 맛 미생물 발효 음료 100ml 6병 구성입니다. 상온의 물에 한 병을 희석해 마시는 방식이라, 물만으로는 심심할 때 챙기기 좋습니다.',
    facts: [
      ['구성', '100ml × 6병'],
      ['브랜드', '클린바이옴'],
      ['원산지', '국산'],
      ['섭취 방법', '상온의 물 300~500ml에 한 병을 희석해 5분 안에 마심'],
      ['배송비', '무료배송'],
    ],
    cta: { label: 'alfs.kr에서 구매', href: SHOP.enzyme, sub: 'alfs.kr' },
  },
  {
    id: 'cleanbiome1',
    zone: 'enzyme',
    name: '클린바이옴 1병',
    fullName: '클린바이옴 100ml × 1병',
    volume: '100ml · 1병',
    badge: '1병',
    price: 19950,
    listPrice: 21000,
    photo: '/images/cutout/cleanbiome1.webp',
    model: 'single',
    anchor: [8.5, 1.1925, -4.85],
    view: [-1, 0.1, 0.55],
    summary:
      '클린바이옴 6병 구성과 같은 100ml 병을 한 병만 담은 상품입니다. 여섯 병을 한 번에 사기 전에 한 병만 먼저 써 보려는 분들이 찾습니다.',
    facts: [
      ['구성', '100ml × 1병'],
      ['브랜드', '클린바이옴'],
      ['원산지', '국산(경기도 여주시)'],
      ['배송비', '4,000원 · 50,000원 이상 무료배송'],
    ],
    cta: { label: 'alfs.kr에서 구매', href: SHOP.enzyme, sub: 'alfs.kr' },
  },
]

export const productById = (id) => products.find((p) => p.id === id)
export const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`
export const discountRate = (p) =>
  p.listPrice && p.listPrice > p.price ? Math.round((1 - p.price / p.listPrice) * 100) : 0

export const B2B = {
  title: '대리점 · 총판 · 샵인샵',
  eyebrow: '04 · B2B 파트너 라운지',
  lead: '10병 사전판매로 시작해 200병 본계약으로 확장하는 2단계 파트너 프로그램입니다.',
  steps: [
    {
      no: '01',
      title: '10병 사전판매',
      body: '소량으로 먼저 진열해 보고 반응을 확인하는 단계입니다. 거래 조건과 배송은 상담에서 안내드립니다.',
    },
    {
      no: '02',
      title: '200병 본계약',
      body: '판매가 확인된 파트너와 본계약으로 넘어갑니다. 공급 조건·지원 내용은 계약 상담에서 확정합니다.',
    },
  ],
  note:
    '정확한 공급가와 계약 조건은 상담에서 안내드립니다. 파트너 코드로 접속하셨다면 상담 신청 시 그대로 담당자에게 전달됩니다.',
}
