import { products, B2B, GENERAL_FOOD_NOTICE, SHOP, won, discountRate } from '../config/products.js'
import { ZONES } from '../three/layout.js'

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function createUI({ onZone, onEnter, onPanelClose }) {
  const ui = document.getElementById('ui')
  ui.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">AL.F.S</div>
        <div class="brand-sub">Private Showroom · Seoul</div>
      </div>
      <div class="top-right">
        <div class="partner-chip" id="partnerChip" hidden>Partner · <b id="partnerCode"></b></div>
        <a class="top-link" href="${SHOP.kakao}" target="_blank" rel="noopener">상담 문의</a>
      </div>
    </header>

    <nav class="rail" aria-label="존 이동">
      ${ZONES.map(
        (z) => `
        <button class="rail-btn" data-zone="${z.id}" type="button">
          <span class="rail-no">${z.no}</span>
          <span class="rail-name">${esc(z.name)}<small>${esc(z.sub)}</small></span>
        </button>`,
      ).join('')}
    </nav>

    <div class="caps" id="caption" aria-live="polite">
      <span class="caps-no"></span>
      <span class="caps-name"></span>
    </div>

    <div class="hint"><span>드래그 회전</span><span>스크롤 확대</span><span>존을 눌러 이동</span></div>

    <aside class="panel" id="panel" aria-hidden="true">
      <div id="panelContent"></div>
    </aside>

    <div class="tooltip" id="tooltip"></div>
  `

  // 캡션 스타일을 여기서 주입 (UI 전용)
  const style = document.createElement('style')
  style.textContent = `
    .caps{position:absolute;left:50%;bottom:34px;transform:translate(-50%,14px);display:flex;align-items:baseline;gap:14px;
      opacity:0;transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);pointer-events:none;white-space:nowrap}
    .caps.on{opacity:1;transform:translate(-50%,0)}
    .caps-no{font-family:var(--serif);font-size:11px;letter-spacing:.2em;color:var(--gold)}
    .caps-name{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(242,234,217,.62)}
    @media (max-width:900px){.caps{bottom:76px}.caps-name{font-size:9.5px;letter-spacing:.12em}}
    .tooltip{position:fixed;left:0;top:0;pointer-events:none;font-size:10.5px;letter-spacing:.12em;color:#f2ead9;
      background:rgba(20,17,13,.82);border:1px solid rgba(195,160,107,.35);padding:7px 11px;opacity:0;transform:translate(-50%,-160%);
      transition:opacity .25s;white-space:nowrap;backdrop-filter:blur(6px);z-index:6}
    .tooltip.on{opacity:1}
  `
  document.head.appendChild(style)

  const panel = ui.querySelector('#panel')
  const panelContent = ui.querySelector('#panelContent')
  const caption = ui.querySelector('#caption')

  /* ---------------- 인트로 ---------------- */
  const intro = document.createElement('div')
  intro.className = 'intro'
  intro.innerHTML = `
    <div class="intro-inner">
      <div class="intro-eyebrow">AL.F.S · Wellness Atelier</div>
      <h1 class="intro-mark">A L . F . S</h1>
      <p class="intro-sub">Private Showroom</p>
      <div class="intro-rule"></div>
      <p class="intro-ko">
        서울 상암의 웰니스 아틀리에에서 준비한 <b>프라이빗 3D 쇼룸</b>입니다.<br />
        오륜미네랄과 하루 1.3핏 · 클린바이옴을 공간에서 살펴보세요.
      </p>
      <button class="intro-enter" type="button" id="enterBtn">입장하기</button>
      <p class="intro-note">마우스 드래그로 둘러보고, 진열된 제품을 눌러 보세요.</p>
    </div>
    <div class="intro-foot"><span>AL.F.S</span><span>Seoul · 2026</span></div>
  `
  document.getElementById('app').appendChild(intro)

  let entered = false
  const enter = () => {
    if (entered) return
    entered = true
    intro.classList.add('gone')
    setTimeout(() => {
      intro.style.display = 'none'
    }, 1300)
    onEnter && onEnter()
  }
  intro.querySelector('#enterBtn').addEventListener('click', enter)
  intro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enter()
  })

  /* ---------------- 존 이동 ---------------- */
  const railBtns = [...ui.querySelectorAll('.rail-btn')]
  railBtns.forEach((b) => b.addEventListener('click', () => onZone(b.dataset.zone)))
  ui.querySelectorAll('.caps, .hint').forEach((el) => el.setAttribute('aria-hidden', 'true'))

  function setZone(id) {
    railBtns.forEach((b) => b.classList.toggle('on', b.dataset.zone === id))
    const z = ZONES.find((x) => x.id === id)
    if (z) showCaption(z.no, z.name)
  }

  let capTimer = null
  function showCaption(no, name) {
    caption.querySelector('.caps-no').textContent = no
    caption.querySelector('.caps-name').textContent = name
    caption.classList.add('on')
    clearTimeout(capTimer)
    capTimer = setTimeout(() => caption.classList.remove('on'), 4200)
  }

  function setPartner(code) {
    const chip = ui.querySelector('#partnerChip')
    if (!code) {
      chip.hidden = true
      return
    }
    chip.hidden = false
    ui.querySelector('#partnerCode').textContent = String(code).toUpperCase()
  }

  /* ---------------- 패널 ---------------- */
  let isOpen = false
  let closeTimer = null

  function openPanel(html) {
    clearTimeout(closeTimer)
    panelContent.innerHTML = html
    panel.classList.add('open')
    panel.setAttribute('aria-hidden', 'false')
    panel.scrollTop = 0
    isOpen = true
    const closeBtn = panelContent.querySelector('.panel-close')
    if (closeBtn) closeBtn.addEventListener('click', close)
  }

  function close(restore = true) {
    if (!isOpen) return
    isOpen = false
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden', 'true')
    closeTimer = setTimeout(() => {
      panelContent.innerHTML = ''
    }, 500)
    onPanelClose && onPanelClose(restore)
  }

  function openProduct(id) {
    const p = products.find((x) => x.id === id)
    if (!p) return
    const zone = ZONES.find((z) => z.id === p.zone)
    const disc = discountRate(p)
    openPanel(`
      <div class="panel-hero">
        <span class="badge">${esc(p.badge)}</span>
        <button class="panel-close" type="button" aria-label="닫기">✕</button>
        <img src="${p.photo}" alt="${esc(p.fullName)}" />
      </div>
      <div class="panel-body">
        <div class="panel-eyebrow">${zone ? zone.no : ''} · ${esc(zone ? zone.name : '')}</div>
        <h2 class="panel-title">${esc(p.name)}</h2>
        <div class="panel-sub">${esc(p.volume)}</div>
        <div class="panel-price">
          <b>${p.price.toLocaleString('ko-KR')}<span>원</span></b>
          ${p.listPrice ? `<s>${p.listPrice.toLocaleString('ko-KR')}원</s><em>${disc}% OFF</em>` : ''}
        </div>
        <p class="panel-desc">${esc(p.summary)}</p>
        <dl class="facts">
          ${p.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
        <p class="panel-notice">${esc(GENERAL_FOOD_NOTICE)}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${p.cta.href}" target="_blank" rel="noopener">${esc(p.cta.label)} <small>${esc(p.cta.sub)}</small></a>
          <a class="btn btn-ghost" href="${SHOP.kakao}" target="_blank" rel="noopener">카카오톡으로 상담</a>
        </div>
      </div>
    `)
  }

  function openB2B(partnerCode) {
    const [base, hash] = SHOP.partner.split('#')
    const applyHref = partnerCode
      ? `${base}?p=${encodeURIComponent(partnerCode)}${hash ? `#${hash}` : ''}`
      : SHOP.partner
    openPanel(`
      <div class="panel-hero" style="background:linear-gradient(160deg,#2b2219 0%,#1d1711 70%,#15100c 100%)">
        <button class="panel-close" type="button" aria-label="닫기">✕</button>
        <div style="text-align:center;color:#e9d7b4">
          <div style="font-size:9px;letter-spacing:.42em;color:#c9a468;margin-bottom:14px">AL.F.S PARTNER PROGRAM</div>
          <div style="font-family:var(--serif);font-size:46px;letter-spacing:.14em;line-height:1">B2B</div>
          <div style="font-size:10.5px;letter-spacing:.24em;margin-top:14px;color:rgba(242,234,217,.62)">대리점 · 총판 · 샵인샵</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="panel-eyebrow">${esc(B2B.eyebrow)}</div>
        <h2 class="panel-title">${esc(B2B.title)}</h2>
        <p class="panel-desc">${esc(B2B.lead)}</p>
        ${B2B.steps
          .map(
            (s) => `<div class="b2b-step"><i>${s.no}</i><div><b>${esc(s.title)}</b><p>${esc(s.body)}</p></div></div>`,
          )
          .join('')}
        <p class="panel-notice" style="margin-top:18px">${esc(B2B.note)}</p>
        ${
          partnerCode
            ? `<div style="font-size:10.5px;letter-spacing:.1em;color:var(--gold);margin:0 0 18px">파트너 코드 <b>${esc(
                String(partnerCode).toUpperCase(),
              )}</b> 로 접속하셨습니다.</div>`
            : ''
        }
        <div class="actions">
          <a class="btn btn-primary" href="${applyHref}" target="_blank" rel="noopener">대리점 · 총판 상담 신청</a>
          <a class="btn btn-ghost" href="${SHOP.kakao}" target="_blank" rel="noopener">카카오채널로 상담</a>
        </div>
      </div>
    `)
  }

  /* ---------------- 툴팁 ---------------- */
  const tooltip = ui.querySelector('#tooltip')
  function tip(text, x, y) {
    if (!text) {
      tooltip.classList.remove('on')
      return
    }
    tooltip.textContent = text
    tooltip.style.left = `${x}px`
    tooltip.style.top = `${y}px`
    tooltip.classList.add('on')
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
    if (!entered) return
    const idx = ZONES.findIndex((z) => z.id === currentZone)
    if (e.key === 'ArrowRight' && idx >= 0) onZone(ZONES[(idx + 1) % ZONES.length].id)
    if (e.key === 'ArrowLeft' && idx >= 0) onZone(ZONES[(idx - 1 + ZONES.length) % ZONES.length].id)
  })

  let currentZone = ZONES[0].id
  const _setZone = setZone
  setZone = (id) => {
    currentZone = id
    _setZone(id)
  }
  // 초기 상태
  setZone('lobby')

  return {
    setZone,
    setPartner,
    openProduct,
    openB2B,
    close,
    tip,
    enter,
    isOpen: () => isOpen,
    rail: railBtns,
  }
}
