import { useMemo, useState } from 'react'
import { allProducts, mineralProduct } from '../config/catalog.js'

// 카브제 팝업스토어의 점원 메뉴처럼: 점원을 누르면 "무엇을 도와드릴까요?" 메뉴가 열립니다.
//  · 제품 물어보기(제품별 안내) · 배송·주문 안내 · 루틴 추천 · 상담 대화
export function StaffMenu({ partner, open, onClose, onAsk, onOpenSimulator, onOpenProduct }) {
  const [tab, setTab] = useState('main')

  const openNow = useMemo(() => {
    // 상담 가능 시간: 평일 10:00–18:00 (한국 시간)
    const now = new Date(Date.now() + 9 * 3600 * 1000)
    const day = now.getUTCDay()
    const h = now.getUTCHours()
    return day >= 1 && day <= 5 && h >= 10 && h < 18
  }, [])

  const products = allProducts

  if (!open) return null

  return (
    <div className="staffsheet" role="dialog" aria-modal="false" aria-label="상담 매니저 메뉴" data-testid="staff-menu">
      <button type="button" className="staffsheet__scrim" aria-label="닫기" onClick={onClose} />
      <div className="staffsheet__panel">
        <div className="staffsheet__head">
          <span className="staffsheet__avatar">
            <img src="/images/staff/concierge-face.png" alt="상담 매니저 서연" />
          </span>
          <div className="staffsheet__who">
            <b>{tab === 'main' ? '무엇을 도와드릴까요?' : '제품을 골라 주세요'}</b>
            <small>
              서연 · {partner.type === 'hq' ? '알프스 쇼룸 매니저' : `${partner.shortName} 상담 매니저`}
            </small>
          </div>
          <span className={`staffsheet__pill ${openNow ? 'is-on' : ''}`}>{openNow ? '상담 가능' : '상담 시간 아님'}</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="메뉴 닫기" data-testid="staff-menu-close">
            ✕
          </button>
        </div>

        {tab === 'main' ? (
          <div className="staffsheet__rows">
            <button type="button" className="srow" onClick={() => setTab('products')} data-testid="staff-products">
              <span className="srow__ic" aria-hidden="true">✦</span>
              <span className="srow__tx">
                <b>제품 물어보기</b>
                <small>오륜미네랄 · 효소세상 6종 구성과 가격</small>
              </span>
              <span className="srow__chev" aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              className="srow"
              onClick={() => {
                onAsk('배송비 얼마예요?')
                onClose()
              }}
              data-testid="staff-shipping"
            >
              <span className="srow__ic" aria-hidden="true">▤</span>
              <span className="srow__tx">
                <b>배송 · 주문 안내</b>
                <small>배송비 · 무료배송 기준 · 주문 방법</small>
              </span>
              <span className="srow__chev" aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              className="srow"
              onClick={() => {
                onOpenSimulator()
                onClose()
              }}
              data-testid="staff-simulator"
            >
              <span className="srow__ic" aria-hidden="true">◎</span>
              <span className="srow__tx">
                <b>루틴 추천 받기</b>
                <small>3문항으로 구성과 합계 계산</small>
              </span>
              <span className="srow__chev" aria-hidden="true">›</span>
            </button>

            <button
              type="button"
              className="srow"
              onClick={() => {
                onAsk('상담 매니저에게 물어보기')
                onClose()
              }}
              data-testid="staff-chat"
            >
              <span className="srow__ic" aria-hidden="true">✉</span>
              <span className="srow__tx">
                <b>상담 매니저와 대화하기</b>
                <small>{partner.name} · {partner.phone}</small>
              </span>
              <span className="srow__chev" aria-hidden="true">›</span>
            </button>
          </div>
        ) : (
          <div className="staffsheet__rows staffsheet__rows--products">
            <button type="button" className="srow srow--back" onClick={() => setTab('main')}>
              <span className="srow__chev" aria-hidden="true">‹</span>
              <span className="srow__tx">
                <b>뒤로 가기</b>
              </span>
            </button>
            {products.map((p) => (
              <div key={p.id} className="srow srow--product">
                <button
                  type="button"
                  className="srow__main"
                  onClick={() => {
                    onAsk(`${p.name} 자세히 알려주세요`)
                    onClose()
                  }}
                  data-testid={`staff-product-${p.id}`}
                >
                  <span className="srow__thumb">
                    <img src={p.image} alt="" />
                  </span>
                  <span className="srow__tx">
                    <b>{p.name}</b>
                    <small>
                      {p.volume} · {`${Number(p.price).toLocaleString('ko-KR')}원`}
                    </small>
                  </span>
                </button>
                <button
                  type="button"
                  className="srow__mini"
                  onClick={() => {
                    onOpenProduct(p)
                    onClose()
                  }}
                  aria-label={`${p.name} 상세 열기`}
                >
                  보기
                </button>
              </div>
            ))}
            <p className="staffsheet__note">
              {mineralProduct.name}은 1,000ml 1병 구성입니다. 표시 가격은 alfs.kr 판매가와 같습니다.
            </p>
          </div>
        )}

        <div className="staffsheet__foot">
          AI 상담이 답변합니다 · 진단·처방이 아닙니다 · 섭취 방법은 제품 라벨을 따릅니다
        </div>
      </div>
    </div>
  )
}
