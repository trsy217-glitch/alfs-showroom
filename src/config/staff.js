import { SHOP, GENERAL_FOOD_NOTICE } from './products.js'

// 쇼룸 전담 매니저 — 존별 안내 카드 내용.
// ⚠️ 검증된 상품 정보(products.js)만 씁니다. 효능·질병 관련 표현 금지, 일반식품 고지 유지.
export const MANAGERS = [
  {
    id: 'mineral',
    zone: 'mineral',
    title: '오륜미네랄 전담 매니저',
    role: '02 · 오륜미네랄 존 담당',
    lead: '오륜미네랄 연단 옆에서 서 있습니다. 원료와 섭취 방법, 구매까지 안내해 드립니다.',
    look: {
      jacket: 0x1e2a3c,
      blouse: 0xf3ecdd,
      lower: 0x1e2a3c,
      hair: 0x211a17,
      hairStyle: 'bun',
      legs: 'skin',
      heels: 0.07,
    },
    points: [
      ['제품', '오륜미네랄 1,000ml · 1병'],
      ['가격', '220,000원'],
      ['원료', '충북 보은의 어린 뽕잎과 누에에서 얻은 미네랄 원액'],
      ['섭취 방법', '원액을 물에 10~30배 희석 (제품 라벨 안내를 따름)'],
      ['보관', '직사광선을 피해 서늘한 곳에 실온 보관 · 제조일로부터 3년'],
      ['배송', '3,000원 · 50,000원 이상 무료 (한진택배)'],
    ],
    cta: { label: '공식몰에서 보기', href: SHOP.mineral, sub: 'alfs.kr' },
    notice: GENERAL_FOOD_NOTICE,
  },
  {
    id: 'enzyme',
    zone: 'enzyme',
    title: '하루 1.3핏 전담 매니저',
    role: '03 · 하루 1.3핏 · 클린바이옴 존 담당',
    lead: '월넛 콘솔 옆에서 서 있습니다. 30일·3일 프로그램과 클린바이옴 구성을 안내해 드립니다.',
    look: {
      jacket: 0x5c2b32,
      blouse: 0xf5eee1,
      lower: 0x3a2b26,
      hair: 0x3b2a21,
      hairStyle: 'bob',
      legs: 'trousers',
      heels: 0.035,
    },
    points: [
      ['30일 프로그램', '엔자임밀 200ml 9포 + 클린바이옴 100ml 3병 · 396,000원'],
      ['3일 구성', '3일 분량 · 99,000원'],
      ['클린바이옴 자몽', '100ml × 6병 · 107,100원'],
      ['클린바이옴 1병', '100ml × 1병 · 19,950원'],
      ['섭취 방법', '파우치는 물에 풀어 마시고, 클린바이옴은 물 300~500ml에 희석 (라벨 안내를 따름)'],
      ['특징', '무설탕 · 실온보관 · 국산(경기도 여주시)'],
    ],
    cta: { label: '1.3핏 · 클린바이옴 보기', href: SHOP.enzyme, sub: 'alfs.kr' },
    notice: GENERAL_FOOD_NOTICE,
  },
]

export const MANAGER_BY_ID = Object.fromEntries(MANAGERS.map((m) => [m.id, m]))
