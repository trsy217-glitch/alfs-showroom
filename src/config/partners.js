// 프랜차이즈 파트너샵 설정 — 같은 3D 공간에서 명패·인사말·귀속 코드·포인트 컬러만 바뀝니다.
// 주소: ?p=hq (본사), ?p=sangam (예시 파트너샵), ?p=busan (예시 파트너샵)
// 새 지점은 이 파일에 한 줄만 추가하면 됩니다. (설계안 5장 '데이터는 1행')
// 컬러는 30~40대 취향의 밝은 톤(샴페인 골드 · 웜 브론즈 · 딥 세이지) 안에서만 고릅니다.

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
      '알프스 3D 쇼룸에 오신 것을 환영합니다. 상담 매니저 서연입니다. 오륜미네랄과 효소세상 6종의 구성·가격·배송·주문을 안내해 드릴 수 있어요.',
    deskLine: '본사 안내 데스크',
    phone: '010-9190-0906',
    kakao: 'https://pf.kakao.com/_JdTPX',
    accent: '#b08d57',
    accentSoft: '#dcc79f',
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
      '상암 파트너샵에 오신 것을 환영합니다. 상담 매니저 서연입니다. 제품 구성과 섭취 방법은 이 자리에서 바로 여쭤보실 수 있어요.',
    deskLine: '상암 파트너샵 안내 데스크',
    phone: '010-9190-0906',
    kakao: 'https://pf.kakao.com/_JdTPX',
    accent: '#a8794f',
    accentSoft: '#e3c39a',
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
      '부산 서면 파트너샵에 오신 것을 환영합니다. 상담 매니저 서연입니다. 궁금한 점은 이 자리에서 바로 안내해 드릴게요.',
    deskLine: '서면 파트너샵 안내 데스크',
    phone: '010-9190-0906',
    kakao: 'https://pf.kakao.com/_JdTPX',
    accent: '#6d7f5f',
    accentSoft: '#cfd8bf',
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

// 상담 매니저 인사말 (소속이 함께 바뀜)
export function consultantGreeting(partner) {
  const belong =
    partner.type === 'hq'
      ? '알프스 본사'
      : `${partner.name}${partner.owner ? ` (${partner.owner} ${partner.ownerTitle})` : ''}`
  return `${belong} 상담 매니저 서연입니다. 제품 구성, 가격, 배송, 주문 방법을 안내해 드릴 수 있어요. 무엇이 궁금하세요?`
}
