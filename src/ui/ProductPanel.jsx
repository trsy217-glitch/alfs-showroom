import { useState } from 'react'
import { calcShipping, discountRate, won } from '../config/catalog.js'
import { buildOrderSummary, copyText, orderLink } from '../lib/order.js'

export function ProductPanel({ product, partner, onClose, onAsk, onGo }) {
  const [copied, setCopied] = useState(false)
  if (!product) return null
  const { fee } = calcShipping([{ product, qty: 1 }])
  const rate = discountRate(product)

  const copy = async () => {
    const ok = await copyText(buildOrderSummary({ product, partner }))
    setCopied(ok)
    window.setTimeout(() => setCopied(false), 2400)
  }

  return (
    <div className="sheet sheet--product" role="dialog" aria-label={`${product.name} 상세`}>
      <div className="sheet__head">
        <div>
          <span className="badge" style={{ background: partner.accent }}>
            {product.zone === 'mineral' ? '오륜미네랄 존' : '효소세상 존'}
          </span>
          <h2>{product.name}</h2>
          <p className="muted">{product.fullName && product.fullName !== product.name ? product.fullName : product.option}</p>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기" data-testid="product-close">
          ✕
        </button>
      </div>

      <div className="product__media">
        <img src={product.image} alt={product.imageAlt || product.name} loading="lazy" />
      </div>

      <div className="product__price">
        {rate > 0 && <span className="rate">{rate}%</span>}
        <strong>{won(product.price)}</strong>
        {product.listPrice && <s>{won(product.listPrice)}</s>}
        <span className="product__ship">{fee ? `배송비 ${won(fee)}` : '무료배송'}</span>
      </div>

      <p className="product__summary">{product.summary}</p>

      <dl className="facts">
        {product.facts.map(([k, v]) => (
          <div key={k} className="facts__row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="stack">
        <a
          className="btn btn--accent btn--full"
          href={orderLink(product)}
          target="_blank"
          rel="noreferrer"
          data-testid="order-link"
        >
          alfs.kr에서 주문하기 ↗
        </a>
        <div className="row">
          <button type="button" className="btn btn--ghost" onClick={copy} data-testid="copy-order">
            {copied ? '복사했습니다 ✓' : '주문 요약 복사'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => onAsk(`${product.name} 자세히 알려줘`)}>
            서연에게 묻기
          </button>
        </div>
        <button type="button" className="btn btn--link" onClick={() => onGo(product.zone)}>
          진열 위치로 이동 →
        </button>
      </div>

      <p className="fineprint">
        결제·배송·환불은 alfs.kr에서 이뤄집니다. 이 쇼룸은 {partner.name} 지점으로 접속되어 있어 주문 요약에 파트너 코드{' '}
        <b>{partner.attribution}</b> 가 함께 남습니다.
      </p>
    </div>
  )
}
