import { ZONES } from '../three/zones.js'
import { partnerList } from '../config/partners.js'

export function TopBar({ partner, zoneId, zoneName, onSummon, onSwitchPartner, onGo }) {
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
        <button type="button" className="btn btn--ghost" onClick={() => onSwitchPartner('hq')} hidden={partner.code === 'hq'} style={partner.code === 'hq' ? { display: 'none' } : undefined}>
          본사 쇼룸
        </button>
        <label className="partner-select">
          <span>지점</span>
          <select value={partner.code} onChange={(e) => onSwitchPartner(e.target.value)} aria-label="파트너샵 선택">
            {partnerList.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
                {p.demo ? ' (예시)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--accent" data-testid="summon-btn" onClick={onSummon}>
          <span className="btn__icon" aria-hidden="true">
            👤
          </span>
          상담 직원 부르기
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
      화면을 드래그해 둘러보고, 바닥 마커나 번호 버튼을 눌러 이동하세요
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
        <div className="loading__sub">화이트 랩 갤러리를 준비하고 있습니다</div>
      </div>
    </div>
  )
}
