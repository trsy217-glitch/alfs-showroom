import { useEffect, useState } from 'react'
import { won } from '../config/catalog.js'
import { budgetCaps, existingLabels, goalLabels, recommend } from '../lib/sets.js'
import { buildOrderSummary, copyText } from '../lib/order.js'

const QUESTIONS = [
  {
    key: 'goal',
    title: '① 무엇이 가장 궁금하신가요?',
    options: Object.entries(goalLabels),
  },
  {
    key: 'budget',
    title: '② 예산은 어느 정도인가요?',
    options: Object.entries(budgetCaps).map(([k, v]) => [k, v.label]),
  },
  {
    key: 'existing',
    title: '③ 지금 드시는 제품이 있나요?',
    options: Object.entries(existingLabels),
  },
]

export function SimulatorPanel({ partner, open, onClose, onResult, onAsk }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ goal: null, budget: null, existing: null })
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(0)
      setAnswers({ goal: null, budget: null, existing: null })
      setResult(null)
      setCopied(false)
    }
  }, [open])

  const choose = (key, value) => {
    const next = { ...answers, [key]: value }
    setAnswers(next)
    if (step < 2) {
      setStep(step + 1)
    } else {
      const r = recommend(next)
      setResult(r)
      onResult?.(r)
    }
  }

  const copy = async () => {
    const ok = await copyText(buildOrderSummary({ set: result.primary, partner }))
    setCopied(ok)
    window.setTimeout(() => setCopied(false), 2400)
  }

  const q = QUESTIONS[step]

  return (
    <div className={`sim ${open ? 'is-open' : ''}`} aria-hidden={!open} data-testid="simulator">
      <div className="sim__sheet">
        <div className="sim__head">
          <div>
            <span className="badge" style={{ background: partner.accent }}>
              고객 루틴 시뮬레이터
            </span>
            <h2>{result ? '추천 구성' : '3문항으로 구성 찾기'}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기" data-testid="simulator-close">
            ✕
          </button>
        </div>

        {!result && (
          <>
            <div className="sim__progress">
              {[0, 1, 2].map((i) => (
                <span key={i} className={i <= step ? 'on' : ''} />
              ))}
            </div>
            <h3 className="sim__q" data-testid="simulator-question">
              {q.title}
            </h3>
            <div className="sim__options">
              {q.options.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="sim__option"
                  data-testid={`sim-option-${value}`}
                  onClick={() => choose(q.key, value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="sim__foot">
              <button type="button" className="btn btn--link" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
                ← 이전
              </button>
              <span className="muted small">{step + 1} / 3</span>
            </div>
          </>
        )}

        {result && (
          <div className="sim__result" data-testid="simulator-result">
            <p className="muted small">{result.summary}</p>
            <h3 className="set-name">{result.primary.name}</h3>
            <ul className="set-items">
              {result.primary.items.map((it) => (
                <li key={it.product.id}>
                  <b>{it.product.name}</b>
                  <span>{it.product.option}</span>
                  <em>{won(it.product.price * it.qty)}</em>
                </li>
              ))}
            </ul>
            <div className="set-total">
              <div>
                <span>상품 합계</span>
                <b>{won(result.primary.subtotal)}</b>
              </div>
              <div>
                <span>배송비</span>
                <b>{result.primary.shipping ? won(result.primary.shipping) : '무료'}</b>
              </div>
              <div className="set-total__sum">
                <span>총 결제 예정</span>
                <b>{won(result.primary.total)}</b>
              </div>
            </div>
            {result.overBudget && (
              <p className="warn">
                선택하신 예산({won(result.cap)})보다 높은 구성입니다. 아래 대안을 함께 확인해 보세요.
              </p>
            )}
            <p className="set-note">{result.primary.note}</p>

            {result.alternative && (
              <div className="alt">
                <span className="alt__label">다른 구성</span>
                <b>{result.alternative.name}</b>
                <span>{won(result.alternative.total)}</span>
                <button
                  type="button"
                  className="btn btn--link"
                  onClick={() => {
                    setResult({ ...result, primary: result.alternative, alternative: result.primary, overBudget: false })
                    onResult?.({ ...result, primary: result.alternative, zone: result.alternative.items.some((it) => it.product.group === 'mineral') ? 'mineral' : 'enzyme' })
                  }}
                >
                  이 구성 보기
                </button>
              </div>
            )}

            <div className="stack">
              <a className="btn btn--accent btn--full" href={result.primary.items[0].product.alfsUrl} target="_blank" rel="noreferrer">
                alfs.kr에서 주문하기 ↗
              </a>
              <div className="row">
                <button type="button" className="btn btn--ghost" onClick={copy}>
                  {copied ? '복사했습니다 ✓' : '주문 요약 복사'}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => onAsk(`${result.primary.name} 구성 알려줘`)}>
                  상담 직원에게 묻기
                </button>
              </div>
              <button type="button" className="btn btn--link" onClick={() => { setResult(null); setStep(0); setAnswers({ goal: null, budget: null, existing: null }) }}>
                다시 처음부터
              </button>
            </div>

            <p className="fineprint">
              참고용 안내입니다. 진단이나 처방이 아니며, 섭취 방법은 제품 라벨을 따릅니다. {partner.name} · {partner.attribution}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
