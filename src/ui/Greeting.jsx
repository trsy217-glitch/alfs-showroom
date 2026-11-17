import { useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────
// 입장 환영 인사 — 매니저 말풍선이 한 글자씩 입체로 튀어 오릅니다.
//  (소영 님 지정 문구를 그대로 씁니다 — 띄어쓰기·줄바꿈 포함)
// ─────────────────────────────────────────────────────────────
export const WELCOME_LINES = ['알프스에 오신것을 환영합니다.', '편하게 둘러보시고, 궁금하신사항은 매니저를 불러주세요.']

const CHAR_STEP = 30 // ms — 한 글자씩 차례로 등장

export function WelcomeGreeting({ show }) {
  const [mounted, setMounted] = useState(show)

  useEffect(() => {
    if (show) {
      setMounted(true)
      return undefined
    }
    const t = window.setTimeout(() => setMounted(false), 900)
    return () => window.clearTimeout(t)
  }, [show])

  if (!mounted) return null

  let index = 0
  return (
    <div
      className={`welcome ${show ? 'is-in' : 'is-out'}`}
      data-testid="welcome-greeting"
      role="status"
      aria-label={WELCOME_LINES.join(' ')}
    >
      <div className="welcome__card" aria-hidden="true">
        <span className="welcome__eyebrow">AL.F.S · VIRTUAL SHOWROOM</span>
        {WELCOME_LINES.map((line) => (
          <p key={line} className="welcome__line">
            {Array.from(line).map((ch, i) => {
              const delay = index
              index += 1
              return (
                <span key={`${ch}-${i}`} className="welcome__ch" style={{ animationDelay: `${delay * CHAR_STEP}ms` }}>
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              )
            })}
          </p>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 05 라운지 도착 안내 — "차한잔 하세요, 상담도와드릴까요?"
// ─────────────────────────────────────────────────────────────
export function LoungeToast({ show }) {
  const [mounted, setMounted] = useState(show)
  useEffect(() => {
    if (show) {
      setMounted(true)
      return undefined
    }
    const t = window.setTimeout(() => setMounted(false), 700)
    return () => window.clearTimeout(t)
  }, [show])

  if (!mounted) return null
  return (
    <div className={`lounge-toast ${show ? 'is-in' : 'is-out'}`} data-testid="lounge-toast" role="status">
      <span className="lounge-toast__cup" aria-hidden="true">
        ☕
      </span>
      <span className="lounge-toast__text">차한잔 하세요, 상담도와드릴까요?</span>
    </div>
  )
}
