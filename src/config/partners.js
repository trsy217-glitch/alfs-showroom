// 프랜차이즈 파트너샵 설정 — 같은 3D 공간에서 명패·인사말·귀속 코드만 바뀝니다.
// 주소: ?p=hq (본사), ?p=sangam (예시 파트너샵), ?p=busan (예시 파트너샵)
// 새 지점은 이 파일에 한 줄만 추가하면 됩니다. (설계안 5장 '데이터는 1행')

export const DEFAULT_PARTNER = 'hq'

export const partners = {
  hq: {
    code: 'hq',
    type: 'hq',
    name: '알프스 본사',
    shortName: '알프스',
    region: '서울 마포 · 상암',
    owner: null,
    ownerTitle: null,
    greeting:
      '알프스 3D 쇼룸에 오신 것을 환영합니다. 오륜미네랄과 효소세상 제품을 3D 공간에서 직접 살펴보세요.',
    deskLine: '본사 안내 데스크',
    phone: '010-9190-0906',
    kakao: 'https://pf.kakao.com/_JdTPX',
    accent: '#0f766e',
    accentSoft: '#5eead4',
    attribution: 'ALFS-hq',
    demo: false,
    address: '서울특별시 마포구 월드컵북로 434, 지하 1층 136호(상암 IT Tower)',
  },
  sangam: {
    code: 'sangam',
    type: 'partner',
    name: '상암 파트너샵',
    shortName: '상암점',
    region: '서울 마포 · 상암',
    owner: '김하늘',
    ownerTitle: '원장',
    greeting:
      '상암 파트너샵에 오신 것을 환영합니다. 제품 구성과 섭취 방법은 안내 데스크에서 바로 여쭤보실 수 있습니다.',
    deskLine: '상암 파트너샵 안내 데스크',
    phone: '010-9190-0906',
    kakao: 'https://pf.kakao.com/_JdTPX',
    accent: '#0e7490',
    accentSoft: '#67e8f9',
    attribution: 'ALFS-sangam',
    demo: true,
    address: '서울 마포구 상암동 (예시 지점)',
  },
  busan: {
    code: 'busan',
    type: 'partner',
    name: '부산 서면 파트너샵',
    shortName: '서면점',
    region: '부산 부산진구 · 서면',
    owner: '박정우',
    ownerTitle: '원장',
    greeting:
      '부산 서면 파트너샵에 오신 것을 환영합니다. 궁금한 점은 상담 직원이 안내해 드립니다.',
    deskLine: '서면 파트너샵 안내 데스크',
    phone: '010-9190-0906',
    kakao: 'https://pf.kakao.com/_JdTPX',
    accent: '#1d4ed8',
    accentSoft: '#93c5fd',
    attribution: 'ALFS-busan',
    demo: true,
    address: '부산 부산진구 서면 (예시 지점)',
  },
}

export const partnerList = Object.values(partners)

export function resolvePartner(code) {
  if (code && partners[code]) return partners[code]
  return partners[DEFAULT_PARTNER]
}

// 상담 직원 인사말 (소속이 함께 바뀜)
export function consultantGreeting(partner) {
  const belong =
    partner.type === 'hq'
      ? '알프스 본사'
      : `${partner.name}${partner.owner ? ` (${partner.owner} ${partner.ownerTitle})` : ''}`
  return `${belong} 상담 직원입니다. 제품 구성, 가격, 배송, 주문 방법을 안내해 드릴 수 있어요. 무엇이 궁금하세요?`
}
