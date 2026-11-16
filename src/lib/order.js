import { won, calcShipping } from '../config/catalog.js'

export function orderLink(product) {
  return product.alfsUrl || 'https://alfs.kr/products'
}

// 주문 요약문 — 파트너 귀속 코드가 한 줄로 남습니다. (설계안 5장)
export function buildOrderSummary({ product, qty = 1, partner, set }) {
  const lines = []
  lines.push(`[알프스 3D 쇼룸 주문 문의]`)
  if (set) {
    lines.push(`세트: ${set.name}`)
    for (const it of set.items) {
      lines.push(`· ${it.product.fullName || it.product.name} — ${it.product.option} × ${it.qty} = ${won(it.product.price * it.qty)}`)
    }
    lines.push(`상품 합계: ${won(set.subtotal)}`)
    lines.push(`배송비: ${set.shipping ? won(set.shipping) : '무료'}`)
    lines.push(`총 결제 예정: ${won(set.total)}`)
  } else {
    const { fee } = calcShipping([{ product, qty }])
    lines.push(`상품: ${product.fullName || product.name} — ${product.option} × ${qty}`)
    lines.push(`상품 금액: ${won(product.price * qty)}`)
    lines.push(`배송비: ${fee ? won(fee) : '무료'}`)
    lines.push(`합계: ${won(product.price * qty + fee)}`)
  }
  lines.push(`파트너: ${partner.name}${partner.owner ? ` (${partner.owner} ${partner.ownerTitle})` : ''} — ${partner.attribution}`)
  lines.push(`쇼룸 주소: ${typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}?p=${partner.code}`)
  lines.push('결제·배송·환불은 alfs.kr에서 진행됩니다.')
  return lines.join('\n')
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}
