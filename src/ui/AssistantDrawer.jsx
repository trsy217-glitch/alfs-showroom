import { useEffect, useRef, useState } from 'react'
import { QUICK_QUESTIONS } from '../lib/assistant.js'
import { productById } from '../config/catalog.js'

export function AssistantDrawer({ partner, open, onClose, messages, onAsk, onOpenProduct, onOpenSimulator }) {
  const [text, setText] = useState('')
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, open])

  const send = (value) => {
    const q = (value ?? text).trim()
    if (!q) return
    onAsk(q)
    setText('')
  }

  const last = messages[messages.length - 1]

  return (
    <aside className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open} data-testid="assistant-drawer">
      <div className="drawer__head">
        <span className="avatar">
          <img src="/images/staff/concierge-face.png" alt="상담 매니저 서연" />
        </span>
        <div className="drawer__titles">
          <b>상담 매니저 서연</b>
          <small>
            {partner.name}
            {partner.owner ? ` · ${partner.owner} ${partner.ownerTitle}` : ''}
          </small>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="상담 창 닫기" data-testid="drawer-close">
          ✕
        </button>
      </div>

      <div className="drawer__body" ref={bodyRef} data-testid="assistant-messages">
        <div className="chat-notice">AI 상담이 답변합니다 · 진단·처방이 아닙니다 · 섭취 방법은 제품 라벨을 따릅니다</div>
        {messages.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            {m.role === 'staff' && <span className="msg__who">서연 · {partner.shortName}</span>}
            <div className="msg__bubble">{m.text}</div>
            {m.products?.length > 0 && (
              <div className="msg__products">
                {m.products.map((p) => {
                  const prod = p.id ? productById(p.id) : productById(p)
                  if (!prod) return null
                  return (
                    <button key={prod.id} type="button" className="chip chip--product" onClick={() => onOpenProduct(prod)}>
                      {prod.name} · {prod.volume}
                    </button>
                  )
                })}
              </div>
            )}
            {m.cta === 'simulator' && (
              <button type="button" className="chip chip--accent" onClick={onOpenSimulator}>
                루틴 시뮬레이터 열기 →
              </button>
            )}
            {m.cta === 'order' && (
              <a className="chip chip--accent" href="https://alfs.kr/products" target="_blank" rel="noreferrer">
                alfs.kr 주문 페이지 열기 ↗
              </a>
            )}
            {m.cta === 'partner' && (
              <a className="chip chip--accent" href={`tel:${partner.phone.replace(/-/g, '')}`}>
                {partner.phone} 로 전화하기
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="drawer__chips">
        {(last?.chips?.length ? last.chips : QUICK_QUESTIONS).map((q) => (
          <button key={q} type="button" className="chip" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="drawer__form"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="궁금한 것을 적어 주세요"
          aria-label="상담 내용 입력"
          data-testid="assistant-input"
        />
        <button type="submit" className="btn btn--accent" data-testid="assistant-send">
          보내기
        </button>
      </form>
    </aside>
  )
}
