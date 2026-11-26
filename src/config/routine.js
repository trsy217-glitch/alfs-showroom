import { SHOP, GENERAL_FOOD_NOTICE } from './products.js'

// "나의 건강최적 루틴관리 시스템" 존 — 하루 루틴 예시.
// ⚠️ 일반식품 안내입니다. 효능·질병 치료 표현 없이, 라벨 기준 섭취 방법만 담습니다.
export const ROUTINE = {
  title: '나의 건강최적 루틴관리 시스템',
  subtitle: 'ROUTINE SYSTEM · MORNING · LUNCH · EVENING',
  lead: '하루 세 번, 챙기기 쉬운 순서로 정리한 루틴 예시입니다. 내 생활 시간에 맞춰 순서와 시각을 바꿔도 됩니다.',
  slots: [
    {
      time: '아침',
      en: 'MORNING',
      product: 'oryun',
      name: '오륜미네랄',
      how: '원액을 물에 10~30배 희석해 한 잔',
      note: '라벨에 표시된 비율을 따릅니다.',
    },
    {
      time: '점심',
      en: 'LUNCH',
      product: 'cleanbiome1',
      name: '클린바이옴',
      how: '상온의 물 300~500ml에 한 병을 희석',
      note: '희석한 뒤 5분 안에 마십니다.',
    },
    {
      time: '저녁',
      en: 'EVENING',
      product: 'fit30',
      name: '하루 1.3핏',
      how: '엔자임밀 파우치를 물에 풀어 마시기',
      note: '하루 분량과 순서는 라벨 안내를 따릅니다.',
    },
  ],
  guide: [
    ['내 시간에 맞추기', '아침·점심·저녁은 예시입니다. 자주 잊는 시간대에 하나씩 배치해 보세요.'],
    ['물과 함께', '모든 제품은 물에 희석하거나 풀어 마시는 방식입니다. 라벨의 비율과 양을 지켜 주세요.'],
    ['비슷한 시간에', '매일 비슷한 시간에 챙기면 루틴이 굳기 쉽습니다.'],
    ['보관', '직사광선을 피해 서늘한 곳에 두고, 개봉 후에는 라벨 안내를 따릅니다.'],
  ],
  cta: { label: '내 루틴 진단하기', href: SHOP.routine, sub: 'alfs.kr/diagnosis' },
  secondary: { label: '카카오톡으로 루틴 상담', href: SHOP.kakao },
  notice: GENERAL_FOOD_NOTICE,
}
