import { ZONES } from '../three/zones.js'
import { partnerList } from '../config/partners.js'

// 글자 크기 선택 — 보통 / 크게 (누르는 즉시 UI·3D 라벨·상담창이 함께 커집니다)
export function TextSizeToggle({ value, onChange }) {
  return (
    <div className="textsize" role="group" aria-label="글자 크기" data-testid="textsize">
      <button
        type="button"
        className={`textsize__btn ${value === 'normal' ? 'is-on' : ''}`}
        aria-pressed={value === 'normal'}
        onClick={() => onChange('normal')}
        data-testid="textsize-normal"
      >
        <span className="ga" aria-hidden="true">가</span>보통
      </button>
      <button
        type="button"
        className={`textsize__btn ${value === 'large' ? 'is-on' : ''}`}
        aria-pressed={value === 'large'}
        onClick={() => onChange('large')}
        data-testid="textsize-large"
      >
        <span className="ga" aria-hidden="true">가</span>크게
      </button>
    </div>
  )
}

export function TopBar({ partner, zoneId, zoneName, onSummon, onSwitchPartner, onGo, textSize, onTextSize }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="logo">AL.F.S</span>
        <span className="topbar__partner" data-testid="partner-name">
          {partner.name}
          {partner.demo && <em className="tag-demo">예시 지점</em>}
          {partner.owner && <em className="tag-owner">{partner.owner} {partner.ownerTitle}</em>}
        </span>
      </div>

      <div className="topbar__zones" aria-label="존 이동">
        {ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            className={`zonetab ${z.id === zoneId ? 'is-active' : ''}`}
            onClick={() => onGo(z.id)}
          >
            <span>{z.no}</span>
            {z.short}
          </button>
        ))}
      </div>

      <div className="topbar__zone">
        <span className="dot" style={{ background: partner.accent }} />
        {zoneName}
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onSwitchPartner('hq')}
          hidden={partner.code === 'hq'}
          style={partner.code === 'hq' ? { display: 'none' } : undefined}
        >
          본사 쇼룸
        </button>
        <label className="partner-select">
          <span>지점</span>
          <select value={partner.code} onChange={(e) => onSwitchPartner(e.target.value)} aria-label="파트너샵 선택" data-testid="partner-select">
            {partnerList.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
                {p.demo ? ' (예시)' : ''}
              </option>
            ))}
          </select>
        </label>
        <TextSizeToggle value={textSize} onChange={onTextSize} />
        <button type="button" className="btn btn--accent" data-testid="summon-btn" onClick={onSummon}>
          <span className="btn__icon" aria-hidden="true">
            ✦
          </span>
          상담 매니저 부르기
        </button>
      </div>
    </header>
  )
}

export function ChapterBar({ zoneId, onGo }) {
  return (
    <nav className="chapters" aria-label="존 이동">
      {ZONES.map((z) => (
        <button
          key={z.id}
          type="button"
          className={`chapter ${z.id === zoneId ? 'is-active' : ''}`}
          data-zone={z.id}
          onClick={() => onGo(z.id)}
        >
          <span className="chapter__no">{z.no}</span>
          <span className="chapter__label">
            <b>{z.short}</b>
            <small>{z.desc}</small>
          </span>
        </button>
      ))}
    </nav>
  )
}

export function Hint({ show }) {
  if (!show) return null
  return (
    <div className="hint">
      화면을 드래그해 둘러보세요 · 마커·챕터 버튼으로 부드럽게 이동 · W A S D / 조이스틱으로 걷기
    </div>
  )
}

export function LoadingScreen({ done }) {
  return (
    <div className={`loading ${done ? 'is-done' : ''}`} aria-hidden={done}>
      <div className="loading__inner">
        <div className="loading__logo">AL.F.S</div>
        <div className="loading__title">알프스 3D 쇼룸</div>
        <div className="loading__bar">
          <span />
        </div>
        <div className="loading__sub">밝은 크림 갤러리를 준비하고 있습니다</div>
      </div>
    </div>
  )
}
