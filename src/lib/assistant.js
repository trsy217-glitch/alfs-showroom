import { enzymeProducts, mineralProduct, shippingPolicy, won } from '../config/catalog.js'
import { enzymeListLine, mineralLine } from './sets.js'

// 쇼룸 AI 상담 직원의 답변 엔진.
//  · 상품·가격·배송비는 카탈로그(alfs.kr 실제 판매가)에서만 가져옵니다.
//  · 효능·진단·처방 표현은 쓰지 않고, 구성·용량·섭취 방법 같은 사실만 답합니다.
//  · 모르는 질문은 상담 연결로 넘깁니다.

const has = (t, ...words) => words.some((w) => t.includes(w))

const productCard = (id) => ({ type: 'product', id })

const SHIPPING_TEXT =
  `${mineralProduct.name}: 기본 3,000원, 50,000원 이상 무료배송 (한진택배)\n` +
  `효소세상 6종: 기본 4,000원, 50,000원 이상 무료배송 (제주·도서지역은 6,000원 추가)\n` +
  `두 상품군을 함께 담으면 각 기준으로 계산합니다.`

export function respond(input, partner) {
  const t = String(input || '').toLowerCase().replace(/\s+/g, ' ')

  // 1) 인사
  if (has(t, '안녕', '반가', 'hello', 'hi')) {
    return {
      text: `안녕하세요. ${partner.name} 안내를 맡은 쇼룸 상담 매니저 서연입니다. 제품 구성·가격·배송·주문 방법을 안내해 드릴 수 있어요.`,
      chips: ['오륜미네랄이 뭐예요?', '효소세상 6종 보여줘', '배송비 얼마예요?', '뭘 사야 할지 모르겠어요'],
    }
  }

  // 2) 비교
  if (has(t, '비교', '차이', '뭐가 달라', '어떤 차')) {
    return {
      text:
        `오륜미네랄은 물에 10~30배 희석해 마시는 원액 1,000ml 한 병(${won(mineralProduct.price)})이고, ` +
        `효소세상은 발효 효소를 파우치·병으로 담은 6종입니다(${won(99000)} ~ ${won(396000)}).\n\n` +
        `· ${mineralLine}\n${enzymeListLine}\n\n` +
        `매일 마시는 기본 한 가지를 원하시면 오륜미네랄, 기간을 정해 나눠 마시는 구성을 원하시면 1.3fit 프로그램 쪽을 보시면 됩니다.`,
      chips: ['오륜미네랄 자세히', '1.3fit 3일과 30일 차이', '배송비 얼마예요?'],
      products: [productCard('oryun'), productCard('fit30')],
    }
  }

  // 3) 배송비
  if (has(t, '배송', '택배', '도착', '제주')) {
    return {
      text: SHIPPING_TEXT,
      chips: ['오륜미네랄 주문은 어떻게?', '가장 저렴한 구성은?', '상담 매니저에게 물어보기'],
    }
  }

  // 4) 주문·구매
  if (has(t, '주문', '구매', '결제', '사고 싶', '살래', '어떻게 사')) {
    return {
      text:
        `주문과 결제는 alfs.kr에서 이뤄집니다. 상품을 고르시면 [alfs.kr에서 주문] 버튼이 열리고, 배송·환불 안내도 그 화면에 함께 있습니다.\n\n` +
        `지금 보시는 쇼룸은 ${partner.name} 지점으로 접속되어 있어, 주문 요약에 파트너 코드 ${partner.attribution} 가 함께 들어갑니다.`,
      chips: ['배송비 얼마예요?', '오륜미네랄 주문', '전화로 문의'],
      cta: 'order',
    }
  }

  // 5) 1.3fit 3일/30일
  if (has(t, '3일', '30일', '1.3', '클렌즈')) {
    const p3 = enzymeProducts.find((p) => p.id === 'fit3')
    const p30 = enzymeProducts.find((p) => p.id === 'fit30')
    return {
      text:
        `1.3fit 3일은 3일 분량 구성 ${won(p3.price)}(정가 ${won(p3.listPrice)})이고, ` +
        `30일은 엔자임밀 200ml 9포 + 클린바이옴 100ml 3병 구성 ${won(p30.price)}(정가 ${won(p30.listPrice)})입니다. ` +
        `두 상품 모두 배송비 무료입니다.\n\n` +
        `처음이면 3일 구성으로 먼저 확인하시고, 이어서 하실 거면 30일 구성을 보시는 순서가 일반적입니다. 섭취 방법은 제품 라벨 안내를 따릅니다.`,
      chips: ['클린바이옴은 뭐예요?', '30일 구성 자세히', '배송비 얼마예요?'],
      products: [productCard('fit3'), productCard('fit30')],
    }
  }

  // 6) 개별 상품
  const direct = [
    ['oryun', ['오륜미네랄', '미네랄', '원액']],
    ['cleanbiome', ['클린바이옴', '자몽']],
    ['zymogen', ['자이모젠', 'zymogen']],
    ['bioenergy', ['바이오에너지']],
    ['fit30', ['엔자임밀']],
  ]
  for (const [id, words] of direct) {
    if (has(t, ...words)) {
      const p = id === 'oryun' ? mineralProduct : enzymeProducts.find((x) => x.id === id)
      if (!p) break
      const facts = p.facts.slice(0, 4).map(([k, v]) => `· ${k}: ${v}`).join('\n')
      const extra =
        id === 'oryun'
          ? `\n\n제조원은 유디아미네랄(충북 보은)이고, 수상·특허 이력은 제조사의 것입니다.`
          : ''
      return {
        text: `${p.fullName || p.name} — ${p.option}\n판매가 ${won(p.price)}${p.listPrice ? ` (정가 ${won(p.listPrice)})` : ''}\n\n${facts}${extra}\n\n${p.summary}`,
        chips: ['배송비 얼마예요?', '오륜미네랄과 비교', '주문은 어떻게?'],
        products: [productCard(p.id)],
      }
    }
  }

  // 7) 효소세상 전체
  if (has(t, '효소', '효소세상', '6종', '라인업')) {
    return {
      text:
        `효소세상은 6종을 쇼룸에 진열해 두었습니다.\n${enzymeListLine}\n\n` +
        `모두 효소세상의 발효 효소 제품이고, 섭취 방법과 보관 방법은 제품 라벨 안내를 따릅니다.`,
      chips: ['1.3fit 3일과 30일 차이', '클린바이옴은 뭐예요?', '추천해 줘'],
    }
  }

  // 8) 추천 요청
  if (has(t, '추천', '뭘 사', '무엇을 사', '골라', '모르겠')) {
    return {
      text:
        '세 가지만 알려주시면 구성과 합계를 바로 계산해 드립니다. 쇼룸의 [루틴 시뮬레이터]에서 버튼 세 번이면 끝납니다.\n\n' +
        '① 무엇이 궁금한지(매일 관리 / 3일 리셋 / 30일 프로그램 / 선물) ② 예산 ③ 지금 드시는 제품',
      chips: ['루틴 시뮬레이터 열기', '가장 저렴한 구성은?', '매일 기본 추천'],
      cta: 'simulator',
    }
  }

  // 9) 상담·파트너·연락
  if (has(t, '상담', '파트너', '전화', '연락', '카톡', '카카오', '원장')) {
    return {
      text:
        `${partner.name} 연락처입니다.\n· 전화: ${partner.phone}\n· 카카오톡 채널: https://pf.kakao.com/_JdTPX\n` +
        `· 운영 시간: 평일 10:00 – 18:00 (주말·공휴일 휴무)\n\n` +
        `지점 주소: ${partner.address}`,
      chips: ['배송비 얼마예요?', '오륜미네랄 자세히', '주문은 어떻게?'],
      cta: 'partner',
    }
  }

  // 10) 섭취 방법
  if (has(t, '먹', '마시', '섭취', '복용', '희석', '하루')) {
    return {
      text:
        `· 오륜미네랄: 원액을 물에 10~30배 희석해 마십니다.\n` +
        `· 클린바이옴: 상온의 물 300~500ml에 한 병을 풀어 5분 안에 마시도록 안내하고 있습니다.\n` +
        `· 1.3fit: 엔자임밀 파우치는 물에 풀어 마시고, 클린바이옴은 물에 희석해 마십니다.\n\n` +
        `제품마다 기준이 다르니 제품 라벨의 안내를 따라 주세요. 저는 진단이나 처방을 하지 않습니다.`,
      chips: ['오륜미네랄 자세히', '클린바이옴은 뭐예요?', '상담 매니저에게 물어보기'],
    }
  }

  // 11) 최저가
  if (has(t, '저렴', '싼', '가장 싼', '최저', '가성비')) {
    return {
      text:
        `한 병으로 가장 가볍게 시작하는 구성은 클린바이옴 1병 ${won(19950)}에 배송비 4,000원을 더한 ${won(23950)}입니다. ` +
        `3일 구성을 보시면 1.3fit 3일 ${won(99000)}이 배송비 무료로 들어갑니다.`,
      chips: ['클린바이옴은 뭐예요?', '1.3fit 3일과 30일 차이', '주문은 어떻게?'],
      products: [productCard('cleanbiome1'), productCard('fit3')],
    }
  }

  // 12) 가격 문의
  if (has(t, '가격', '얼마', '비싸', '원')) {
    return {
      text: `쇼룸에 진열된 7종 가격입니다.\n· ${mineralLine}\n${enzymeListLine}\n\n배송비는 ${shippingPolicy.mineral.label} / ${shippingPolicy.enzyme.label}`,
      chips: ['배송비 얼마예요?', '추천해 줘', '오륜미네랄 자세히'],
    }
  }

  // 13) 감사·끝맺음
  if (has(t, '고마', '감사', '수고', '땡큐')) {
    return {
      text: '천천히 둘러보세요. 다른 것이 궁금하시면 이 창에 그대로 적어 주시면 됩니다.',
      chips: ['효소세상 6종 보여줘', '배송비 얼마예요?', '루틴 시뮬레이터 열기'],
    }
  }

  // 14) 기본값 — 모르는 질문은 상담으로
  const text =
    '그 부분은 제가 확인해 둔 정보만으로는 정확히 답하기 어렵습니다. 상품 구성·가격·배송·주문은 바로 안내해 드릴 수 있어요.\n\n' +
    `자세한 상담은 ${partner.name}(${partner.phone})으로 연결해 드리겠습니다.`
  return { text, chips: ['상품 가격 알려줘', '배송비 얼마예요?', '상담 매니저에게 연결'] }
}

export const QUICK_QUESTIONS = [
  '오륜미네랄이 뭐예요?',
  '효소세상 6종 보여줘',
  '배송비 얼마예요?',
  '1.3fit 3일과 30일 차이',
  '뭘 사야 할지 모르겠어요',
  '주문은 어떻게 하나요?',
]
