import { enzymeProducts, mineralProduct, shippingPolicy, won } from '../config/catalog.js'
import { enzymeListLine, mineralLine } from './sets.js'
import { CHIP_SETS, knowledgeById, matchKnowledge } from '../config/knowledge.js'

// 쇼룸 AI 상담 직원 '서연'의 답변 엔진.
//  · 답변 본문은 지식베이스(src/config/knowledge.js, Q&A 32건)에서 가져옵니다.
//  · 상품·가격·배송비는 카탈로그(alfs.kr 실제 판매가)와 지식베이스가 같은 값을 씁니다.
//  · 효능·진단·처방·다이어트 같은 표현은 쓰지 않고, 구성·용량·섭취 방법 같은 사실만 답합니다.
//  · 지식베이스에 없는 질문은 지어내지 않고 상담 연결로 넘깁니다.

const clean = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const has = (t, ...words) => words.some((w) => t.includes(w))

const MINERAL_HINTS = ['오륜', '미네랄', '원액', '유디아', '뽕잎', '누에']
const ENZYME_HINTS = ['효소', '1.3', '일쩜삼', '엔자임밀', '클린바이옴', '자이모젠', '바이오에너지', '클렌즈']

const mineralHint = (t) => MINERAL_HINTS.some((w) => t.includes(w))
const enzymeHint = (t) => ENZYME_HINTS.some((w) => t.includes(w))

const productCard = (id) => ({ type: 'product', id })

// 받침 유무에 따라 조사를 고릅니다 (본사로 / 라운지으로 같은 어색한 문장 방지)
const josa = (word, withBatchim, withoutBatchim) => {
  const last = String(word || '').charCodeAt(String(word || '').length - 1)
  if (Number.isNaN(last) || last < 0xac00 || last > 0xd7a3) return withoutBatchim
  return (last - 0xac00) % 28 > 0 ? withBatchim : withoutBatchim
}

const SHIPPING_TEXT =
  `${mineralProduct.name}: 기본 3,000원, 50,000원 이상 무료배송 (한진택배 · 제주·도서 산간 6,000원 추가)\n` +
  `효소세상 6종: 기본 4,000원, 50,000원 이상 무료배송 (제주·도서지역은 6,000원 추가)\n` +
  `두 상품군을 함께 담으면 각 기준으로 계산합니다. 결제 확인 후 2~3영업일 안에 발송됩니다.`

const chipsFor = (entry) => entry.chips ?? CHIP_SETS[entry.group] ?? CHIP_SETS.common

// 지식베이스 항목을 상담 답변 형태로 바꿉니다.
const fromKnowledge = (entry) => {
  if (!entry) return null
  const out = { text: entry.answer, chips: chipsFor(entry) }
  if (entry.productIds?.length) out.products = entry.productIds.map(productCard)
  if (entry.cta) out.cta = entry.cta
  return out
}

// 지식베이스 id로 답합니다 (규칙에서 특정 답을 먼저 고를 때)
const kbEntry = (id) => fromKnowledge(knowledgeById(id))

export function respond(input, partner) {
  const t = clean(input)

  if (!t) {
    return { text: '궁금한 것을 적어 주시면 확인해 둔 내용만 정확히 안내해 드릴게요.', chips: CHIP_SETS.common }
  }

  // 1) 인사
  if (has(t, '안녕', '반가') || /\b(hi|hello)\b/.test(t)) {
    const belong = partner.type === 'hq' ? '알프스 쇼룸' : `${partner.shortName} 상담`
    return {
      text:
        `안녕하세요. ${belong} 매니저 서연입니다. 오륜미네랄과 효소세상 6종의 구성·가격·배송·주문 방법을 안내해 드릴 수 있어요.` +
        `\n\n궁금하신 걸 편하게 물어보세요.`,
      chips: ['오륜미네랄이 뭐예요?', '효소세상 6종 보여줘', '배송비 얼마예요?', '약 대신 먹어도 되나요?'],
    }
  }

  // 2) 약·건강기능식품 — 어떤 질문보다 먼저 안전하게 답합니다
  if (has(t, '약 대신', '약 먹', '약 끊', '건강기능식품', '영양제', '처방', '치료', '병원')) {
    return kbEntry('common-vs-medicine')
  }

  // 2-1) 안전·이상 반응 — 섭취법 질문보다 먼저
  if (has(t, '안전', '부작용', '알레르기', '두드러기', '아토피', '몸에 이상', '이상 반응', '이상반응')) {
    return kbEntry('common-safety')
  }

  // 3) 배송 조회
  if (has(t, '송장', '운송장', '배송 조회', '배송조회', '언제 와', '언제와', '언제 오', '언제오', '며칠', '출고')) {
    return kbEntry('common-shipping-track')
  }

  // 4) 해외·대량 주문
  if (has(t, '해외', '국제', '대량', '기업 구매', '단체', '선물 포장')) {
    return kbEntry('common-overseas')
  }

  // 5) 배송비
  if (
    (has(t, '배송비', '택배비', '무료배송', '한진', '도착', '제주', '도서') ||
      (has(t, '배송') && !has(t, '가격', '얼마', '주문', '해외', '송장', '조회'))) &&
    !has(t, '반품', '환불', '교환', '청약철회')
  ) {
    return {
      text: SHIPPING_TEXT,
      chips: ['주문은 어떻게 하나요?', '가격 알려줘', '언제 배송되나요?'],
    }
  }

  // 6) 주문·결제
  if (has(t, '주문', '구매', '결제', '사고 싶', '살래', '어떻게 사', '장바구니') && !has(t, '재구매', '정기구독', '구독', '쿠폰', '적립', '멤버십')) {
    const base = kbEntry('common-order')
    const note = `\n\n지금 보시는 쇼룸은 ${partner.name}로 접속되어 있어, 주문 요약에 파트너 코드 ${partner.attribution}가 함께 들어갑니다.`
    return {
      text: (base?.text ?? '상품을 고르시면 alfs.kr 주문 화면으로 넘어갑니다.') + note,
      chips: ['배송비 얼마예요?', '교환이나 환불은 어떻게 하나요?', '상담 매니저에게 문의'],
      cta: 'order',
    }
  }

  // 7) 1.3fit 3일 / 30일 (일반 비교보다 먼저)
  if (has(t, '3일', '30일', '클렌즈', '1.3fit', '1.3 fit', '일쩜삼')) {
    return kbEntry('enzyme-3-30')
  }

  // 8) 오륜미네랄 ↔ 효소세상 비교
  if (has(t, '비교', '차이', '뭐가 달라', '어떤 차', '다른 점')) {
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

  // 9) 최저가
  if (has(t, '저렴', '싼', '가장 싼', '최저', '가성비')) {
    return {
      text:
        `한 병으로 가장 가볍게 시작하는 구성은 클린바이옴 1병 ${won(19950)}에 배송비 4,000원을 더한 ${won(23950)}입니다. ` +
        `3일 구성을 보시면 1.3fit 3일 ${won(99000)}이 배송비 무료로 들어갑니다.`,
      chips: ['클린바이옴은 뭐예요?', '1.3fit 3일과 30일 차이', '주문은 어떻게 하나요?'],
      products: [productCard('cleanbiome1'), productCard('fit3')],
    }
  }

  // 10) 추천 요청
  if (has(t, '추천', '뭘 사', '무엇을 사', '어떤 걸 사', '골라', '모르겠')) {
    return {
      text:
        '세 가지만 알려주시면 구성과 합계를 바로 계산해 드립니다. 쇼룸의 [루틴 시뮬레이터]에서 버튼 세 번이면 끝납니다.\n\n' +
        '① 무엇이 궁금한지(매일 관리 / 3일 리셋 / 30일 프로그램 / 선물) ② 예산 ③ 지금 드시는 제품',
      chips: ['루틴 시뮬레이터 열기', '가장 저렴한 구성은?', '매일 기본 추천'],
      cta: 'simulator',
    }
  }

  // 11) 상품군을 특정하지 않은 가격 질문
  if (
    has(t, '가격', '얼마', '비싸', '가격대') &&
    !mineralHint(t) &&
    !enzymeHint(t) &&
    !has(t, '유통기한', '소비기한', '보관', '섭취', '마시', '마셔', '먹', '원재료', '성분', '배송', '송장')
  ) {
    return {
      text: `쇼룸에 진열된 7종 가격입니다.\n· ${mineralLine}\n${enzymeListLine}\n\n배송비는 ${shippingPolicy.mineral.label} / ${shippingPolicy.enzyme.label}`,
      chips: ['배송비 얼마예요?', '추천해 줘', '오륜미네랄 자세히'],
    }
  }

  // 12) 상품군을 특정하지 않은 섭취 방법 질문
  if (has(t, '먹', '마시', '마셔', '섭취', '복용', '희석', '하루') && !mineralHint(t) && !enzymeHint(t)) {
    return {
      text:
        `· 오륜미네랄: 원액을 물에 10~30배 희석해 하루 한 잔\n` +
        `· 엔자임밀: 라벨 기준 1일 3회 200ml씩 (식사 대용·식전·식후, 차나 물에 희석)\n` +
        `· 클린바이옴: 상온의 물 300~500ml에 한 병을 풀어 5분 안에, 식후 2시간 이후나 공복\n\n` +
        `제품마다 기준이 다르니 제품 라벨의 안내를 따라 주세요. 저는 진단이나 처방을 하지 않습니다.`,
      chips: ['오륜미네랄 자세히', '효소세상 6종 보여줘', '상담 매니저에게 문의'],
    }
  }

  // 13) 상담 연결
  if (has(t, '전화', '연락', '카톡', '카카오', '상담 매니저', '원장', '사람과', '사장님', '상담원', '직원', '계세요')) {
    const demo = partner.demo
      ? `\n\n※ ${partner.name}${josa(partner.name, '은', '는')} 화면 구성을 보여 드리는 예시 지점입니다. 실제 상담은 본사로 연결됩니다.`
      : ''
    return {
      text:
        `${partner.name} 연락처입니다.\n· 전화: ${partner.phone}\n· 카카오톡 채널: ${partner.kakao || 'https://pf.kakao.com/_JdTPX'}\n` +
        `· 운영 시간: 평일 10:00 – 18:00 (주말·공휴일 휴무)\n\n지점 주소: ${partner.address}${demo}`,
      chips: ['배송비 얼마예요?', '오륜미네랄 자세히', '주문은 어떻게 하나요?'],
      cta: 'partner',
    }
  }

  // 14) 지식베이스 키워드 매칭 (32건)
  const found = matchKnowledge(t)
  if (found) return fromKnowledge(found.entry)

  // 15) 상품 이름만 말한 경우 → 상품 카드
  const direct = [
    ['oryun', ['오륜미네랄', '오륜']],
    ['fit30', ['1.3fit 30', '30일']],
    ['fit3', ['1.3fit 3', '3일']],
    ['bioenergy', ['바이오에너지']],
    ['zymogen', ['자이모젠', 'zymogen']],
    ['cleanbiome', ['클린바이옴']],
  ]
  for (const [id, words] of direct) {
    if (has(t, ...words)) {
      const p = id === 'oryun' ? mineralProduct : enzymeProducts.find((x) => x.id === id)
      if (!p) continue
      const facts = p.facts.slice(0, 4).map(([k, v]) => `· ${k}: ${v}`).join('\n')
      const extra =
        id === 'oryun' ? `\n\n제조원은 유디아미네랄(충북 보은)이고, 수상·특허 이력은 제조사의 것입니다.` : ''
      return {
        text: `${p.fullName || p.name} — ${p.option}\n판매가 ${won(p.price)}${p.listPrice ? ` (정가 ${won(p.listPrice)})` : ''}\n\n${facts}${extra}\n\n${p.summary}`,
        chips: ['배송비 얼마예요?', '오륜미네랄과 비교', '주문은 어떻게 하나요?'],
        products: [productCard(p.id)],
      }
    }
  }

  // 16) 기본값 — 확인된 정보가 없으면 상담으로
  const text =
    '그 부분은 제가 확인해 둔 정보만으로는 정확히 답하기 어렵습니다. 상품 구성·가격·배송·주문은 바로 안내해 드릴 수 있어요.\n\n' +
    `자세한 상담은 ${partner.name}(${partner.phone})${josa(partner.name, '으로', '로')} 연결해 드리겠습니다.`
  return { text, chips: ['오륜미네랄이 뭐예요?', '효소세상 6종 보여줘', '배송비 얼마예요?', '상담 매니저에게 연결'] }
}

export const QUICK_QUESTIONS = [
  '오륜미네랄이 뭐예요?',
  '효소세상 6종 보여줘',
  '1.3fit 3일과 30일 차이',
  '배송비 얼마예요?',
  '어떤 수상을 한 기록이 있나요?',
  '약 대신 먹어도 되나요?',
  '주문은 어떻게 하나요?',
]
