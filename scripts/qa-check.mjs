// 상담 매니저 '서연' 답변 점검 스크립트
//   node scripts/qa-check.mjs
//  · 32건 지식베이스가 각자의 질문으로 제대로 매칭되는지
//  · 실제 고객 질문 문장이 의도한 답으로 가는지
//  · 금지 표현(효능 단정·내부 메모·거래 조건)이 답변에 섞이지 않는지
import { knowledge, matchKnowledge } from '../src/config/knowledge.js'
import { respond } from '../src/lib/assistant.js'
import { partners } from '../src/config/partners.js'

const partner = partners.hq

const FORBIDDEN = [
  '소영',
  '확인 필요',
  '공급가',
  '마진',
  '판매장려금',
  '숙변',
  '다이어트',
  '디톡스',
  '장청소',
  '독소',
  '치료',
  '체지방',
  '처방전',
  '영업 매뉴얼',
]

let fail = 0
const ok = (msg) => console.log(`  ✓ ${msg}`)
const bad = (msg) => {
  fail += 1
  console.log(`  ✗ ${msg}`)
}

// 1) 각 항목의 질문 문장 → 같은 항목으로 매칭
console.log('\n[1] 지식베이스 32건 자기 질문 매칭')
let kbFail = 0
for (const entry of knowledge) {
  const found = matchKnowledge(entry.question)
  if (found?.entry?.id === entry.id) {
    continue
  }
  kbFail += 1
  bad(`${entry.id} → ${found ? found.entry.id : 'no match'} (${found ? found.score.toFixed(1) : 0})`)
}
console.log(`  · 지식베이스 ${knowledge.length}건 중 ${knowledge.length - kbFail}건 일치`)

// 2) 실제 고객 질문 → 기대 답변
const cases = [
  // 오륜미네랄
  ['오륜미네랄은 어디서 만든 제품인가요?', 'mineral-origin'],
  ['오륜미네랄 원산지가 어디예요?', 'mineral-origin'],
  ['오륜미네랄 어떤 수상을 한 기록이 있나요?', 'mineral-awards'],
  ['오륜미네랄 미네랄 성분이 어떤 특징이 있나요?', 'mineral-feature'],
  ['오륜미네랄 효능이 뭔가요?', 'mineral-effect'],
  ['오륜미네랄 어떻게 마시나요?', 'mineral-howto'],
  ['오륜미네랄 부모님 선물로 괜찮나요?', 'mineral-who'],
  ['카페에서 음료로 팔아도 되나요?', 'mineral-cafe'],
  ['오륜미네랄 가격 얼마예요?', 'mineral-price'],
  ['파트너샵 입점은 어떻게 하나요?', 'mineral-partner'],
  ['매장에서 팔고 싶은데 도매 가능한가요?', 'mineral-partner'],
  // 효소세상
  ['효소세상 제품은 어디서 만든 건가요?', 'enzyme-origin'],
  ['효소세상 제품 수상 기록 있나요?', 'enzyme-awards'],
  ['1.3fit 특허번호 알려주세요', 'enzyme-awards'],
  ['효소세상 6종 보여줘', 'enzyme-feature'],
  ['효소 라인업 뭐가 있어요?', 'enzyme-feature'],
  ['효소 먹으면 살 빠지나요?', 'enzyme-effect'],
  ['숙변이 없어지나요?', 'enzyme-effect'],
  ['효소세상 제품은 어떻게 마시나요?', 'enzyme-howto'],
  ['클린바이옴 어떻게 먹어요?', 'enzyme-howto'],
  ['효소세상 제품 어떤 사람이 먹으면 좋을까요?', 'enzyme-who'],
  ['효소 제품을 카페에서 활용할 수 있나요?', 'enzyme-business'],
  ['효소세상 제품 가격 얼마인가요?', 'enzyme-price'],
  ['1.3fit 3일과 30일은 뭐가 다른가요?', 'enzyme-3-30'],
  ['효소세상 제품에 뭐가 들어 있나요?', 'enzyme-ingredients'],
  ['무설탕이라는데 단맛은 어떻게 낸 건가요?', 'enzyme-sugar'],
  ['유통기한은 얼마나 되고 어떻게 보관하나요?', 'enzyme-storage'],
  ['히트메이커스가 어떤 회사예요?', 'enzyme-maker'],
  // 공통
  ['안녕하세요', 'rule:greeting'],
  ['약 대신 먹어도 되나요?', 'common-vs-medicine'],
  ['건강기능식품인가요?', 'common-vs-medicine'],
  ['어떻게 주문하고 결제하나요?', 'rule:order'],
  ['주문한 게 언제 오나요?', 'rule:tracking'],
  ['송장 조회는 어떻게 해요?', 'rule:tracking'],
  ['배송비 얼마예요?', 'rule:shipping'],
  ['교환이나 환불은 어떻게 하나요?', 'common-refund'],
  ['먹어도 안전한가요?', 'common-safety'],
  ['알레르기가 있는데 괜찮을까요?', 'common-safety'],
  ['여기는 어디인가요?', 'common-showroom'],
  ['정기구독이나 재구매 할인이 있나요?', 'common-subscription'],
  ['해외로 보낼 수 있나요?', 'common-overseas'],
  ['알프스는 어떤 회사인가요?', 'common-company'],
  ['오륜미네랄이 뭐예요?', 'mineral-feature'],
  // 규칙 응답
  ['오륜미네랄과 효소세상 뭐가 달라요?', 'rule:compare'],
  ['가장 저렴한 구성은?', 'rule:cheapest'],
  ['뭘 사야 할지 모르겠어요', 'rule:recommend'],
  ['전화번호 알려주세요', 'rule:contact'],
  ['클린바이옴은 뭐예요?', 'rule:product-card'],
]

const byId = new Map(knowledge.map((e) => [e.id, e]))
const answerPrefix = (id) => {
  const e = byId.get(id)
  return e ? e.answer.slice(0, 24) : null
}

console.log('\n[2] 고객 질문 → 기대 답변')
for (const [q, expect] of cases) {
  const r = respond(q, partner)
  if (!r || !r.text) {
    bad(`"${q}" → 답변 없음`)
    continue
  }
  if (expect.startsWith('rule:')) {
    const rule = expect.slice(5)
    const checks = {
      greeting: r.text.includes('매니저 서연입니다'),
      order: r.text.includes('alfs.kr 주문 화면') && r.cta === 'order',
      tracking: r.text.includes('2~3영업일 안에 발송'),
      shipping: r.text.includes('기본 3,000원') && r.text.includes('기본 4,000원'),
      compare: r.text.includes('오륜미네랄은 물에 10~30배'),
      cheapest: r.text.includes('19,950'),
      recommend: r.cta === 'simulator',
      contact: r.text.includes('010-9190-0906') && r.cta === 'partner',
      'product-card': Array.isArray(r.products) && r.products.length > 0,
    }
    if (checks[rule]) ok(`${q} → ${rule}`)
    else bad(`${q} → ${rule} 불일치: ${r.text.slice(0, 40)}…`)
    continue
  }
  const prefix = answerPrefix(expect)
  if (prefix && r.text.includes(prefix.slice(0, 16))) ok(`${q} → ${expect}`)
  else bad(`${q} → ${expect} 아님: ${r.text.slice(0, 40)}…`)
}

// 3) 금지 표현·내부 메모 검사 (지식베이스 본문 + 실제 응답)
console.log('\n[3] 금지 표현 검사')
const scan = (label, text) => {
  const hit = FORBIDDEN.filter((w) => text.includes(w))
  if (hit.length) bad(`${label}: ${hit.join(', ')}`)
  else ok(label)
}
for (const e of knowledge) scan(`KB ${e.id}`, e.answer)
for (const [q] of cases) scan(`답변 "${q}"`, respond(q, partner).text)

// 4) 상품 카드 id가 카탈로그에 있는지
console.log('\n[4] 상품 카드 id 점검')
const validIds = new Set(['oryun', 'fit30', 'fit3', 'bioenergy', 'zymogen', 'cleanbiome', 'cleanbiome1'])
let cardFail = 0
for (const e of knowledge) {
  for (const id of e.productIds ?? []) {
    if (!validIds.has(id)) {
      cardFail += 1
      bad(`${e.id} → 없는 상품 ${id}`)
    }
  }
}
if (!cardFail) ok('모든 productIds 정상')

console.log(`\n결과: ${fail === 0 ? '통과' : `실패 ${fail}건`}`)
process.exit(fail === 0 ? 0 : 1)
