import { products, B2B, GENERAL_FOOD_NOTICE, MANUAL_SLOT, SHOP, discountRate } from '../config/products.js'
import { MANAGER_BY_ID } from '../config/staff.js'
import { ROUTINE } from '../config/routine.js'
import { ZONES } from '../three/layout.js'

const esc = (s) => String(s).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function createUI({ onZone, onPanelClose, onPartnerShop, onMove, onTurn, onOpenProduct }) {
  const ui = document.getElementById('ui')
  const zoneBtns = ZONES.map(
    (z) => `
      <button class="rail-btn" data-zone="${z.id}" type="button">
        <span class="rail-no">${z.no}</span>
        <span class="rail-name">${esc(z.name)}<small>${esc(z.sub)}</small></span>
        <span class="rail-short">${esc(z.short || z.name)}</span>
      </button>`,
  ).join('')

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

    <nav class="rail" aria-label="카테고리">
      <span class="rail-label">CATEGORY</span>
      ${zoneBtns}
      <button class="rail-btn rail-partner" data-partner="1" type="button">
        <span class="rail-no">SHOP</span>
        <span class="rail-name">파트너샵<small>Partner Shop · B2B</small></span>
        <span class="rail-short">파트너샵</span>
      </button>
    </nav>

    <div class="caps" id="caption" aria-live="polite">
      <span class="caps-no"></span>
      <span class="caps-name"></span>
    </div>

    <div class="hint"><span>드래그 회전</span><span>WASD 이동</span><span>Q/E 방향</span><span>휠 확대</span></div>

    <button class="staff-chip" id="staffChip" type="button" hidden>
      <span class="staff-chip-dot"></span>전담 매니저 상담
    </button>

    <div class="navpad" id="navpad" aria-label="이동 조작">
      <div class="navpad-pad">
        <button class="np np-f" data-move="f" type="button" aria-label="앞으로">▲</button>
        <button class="np np-l" data-move="l" type="button" aria-label="왼쪽으로">◀</button>
        <span class="np-core">이동</span>
        <button class="np np-r" data-move="r" type="button" aria-label="오른쪽으로">▶</button>
        <button class="np np-b" data-move="b" type="button" aria-label="뒤로">▼</button>
      </div>
      <div class="navpad-turn">
        <button class="np np-turn" data-turn="-1" type="button" aria-label="왼쪽으로 돌기">↺</button>
        <button class="np np-turn" data-turn="1" type="button" aria-label="오른쪽으로 돌기">↻</button>
      </div>
    </div>

    <aside class="panel" id="panel" aria-hidden="true">
      <div id="panelContent"></div>
    </aside>

    <div class="tooltip" id="tooltip"></div>
  `

  // 캡션·툴팁 스타일 (UI 전용)
  const style = document.createElement('style')
  style.textContent = `
    .caps{position:absolute;left:50%;bottom:34px;transform:translate(-50%,14px);display:flex;align-items:baseline;gap:14px;
      opacity:0;transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);pointer-events:none;white-space:nowrap}
    .caps.on{opacity:1;transform:translate(-50%,0)}
    .caps-no{font-family:var(--serif);font-size:11px;letter-spacing:.2em;color:var(--gold)}
    .caps-name{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(242,234,217,.62)}
    @media (max-width:900px){.caps{bottom:150px;left:auto;right:14px;transform:translateY(10px)}.caps.on{transform:none}.caps-name{font-size:9.5px;letter-spacing:.12em}}
    .tooltip{position:fixed;left:0;top:0;pointer-events:none;font-size:10.5px;letter-spacing:.12em;color:#f2ead9;
      background:rgba(20,17,13,.82);border:1px solid rgba(195,160,107,.35);padding:7px 11px;opacity:0;transform:translate(-50%,-160%);
      transition:opacity .25s;white-space:nowrap;backdrop-filter:blur(6px);z-index:6}
    .tooltip.on{opacity:1}
  `
  document.head.appendChild(style)

  const panel = ui.querySelector('#panel')
  const panelContent = ui.querySelector('#panelContent')
  const caption = ui.querySelector('#caption')
  const staffChip = ui.querySelector('#staffChip')
  const rail = ui.querySelector('.rail')

  /* ---------------- 카테고리 / 존 이동 ---------------- */
  const railBtns = [...ui.querySelectorAll('.rail-btn[data-zone]')]
  railBtns.forEach((b) => b.addEventListener('click', () => onZone(b.dataset.zone)))
  ui.querySelector('.rail-partner').addEventListener('click', () => {
    if (onPartnerShop) onPartnerShop()
    else onZone('b2b')
  })
  staffChip.addEventListener('click', () => openStaffChat(staffChip.dataset.zone))
  ui.querySelectorAll('.caps, .hint').forEach((el) => el.setAttribute('aria-hidden', 'true'))

  /* ---------------- 이동 패드 ---------------- */
  const moveState = { f: false, b: false, l: false, r: false }
  const turnState = { '-1': false, '1': false }

  function bindHold(el, onDown, onUp) {
    const start = (e) => {
      e.preventDefault()
      el.classList.add('down')
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
      onDown()
    }
    const end = () => {
      if (!el.classList.contains('down')) return
      el.classList.remove('down')
      onUp()
    }
    el.addEventListener('pointerdown', start)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
    el.addEventListener('lostpointercapture', end)
  }

  ui.querySelectorAll('[data-move]').forEach((el) => {
    const dir = el.dataset.move
    bindHold(
      el,
      () => {
        moveState[dir] = true
        onMove && onMove(moveState)
      },
      () => {
        moveState[dir] = false
        onMove && onMove(moveState)
      },
    )
  })
  ui.querySelectorAll('[data-turn]').forEach((el) => {
    const dir = el.dataset.turn
    bindHold(
      el,
      () => {
        turnState[dir] = true
        onTurn && onTurn(turnState)
      },
      () => {
        turnState[dir] = false
        onTurn && onTurn(turnState)
      },
    )
  })

  function setZone(id) {
    railBtns.forEach((b) => b.classList.toggle('on', b.dataset.zone === id))
    const z = ZONES.find((x) => x.id === id)
    if (z) showCaption(z.no, z.name)
    staffChip.hidden = !MANAGER_BY_ID[id]
    staffChip.dataset.zone = id
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
  let mode = null

  function openPanel(html, nextMode) {
    clearTimeout(closeTimer)
    panelContent.innerHTML = html
    panel.classList.add('open')
    panel.classList.toggle('panel-inspect', nextMode === 'inspect')
    panel.setAttribute('aria-hidden', 'false')
    panel.scrollTop = 0
    isOpen = true
    mode = nextMode || null
    const closeBtn = panelContent.querySelector('.panel-close')
    if (closeBtn) closeBtn.addEventListener('click', () => close())
    return panelContent
  }

  function close(restore = true) {
    if (!isOpen) return
    isOpen = false
    const prevMode = mode
    mode = null
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden', 'true')
    closeTimer = setTimeout(() => {
      panelContent.innerHTML = ''
    }, 500)
    onPanelClose && onPanelClose(restore, prevMode)
  }

  /* ---------------- 상품 살펴보기 (공중 부양) ---------------- */
  function openInspect(id) {
    const p = products.find((x) => x.id === id)
    if (!p) return
    const zone = ZONES.find((z) => z.id === p.zone)
    const disc = discountRate(p)
    const detail = `
      <p class="panel-desc">${esc(p.summary)}</p>
      <div class="manual-slot">
        <div class="manual-frame">
          <span class="manual-badge">IMAGE SLOT</span>
          <b>${esc(MANUAL_SLOT.title)}</b>
          <span>${esc(MANUAL_SLOT.note)}</span>
        </div>
      </div>
      <dl class="facts">
        ${p.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    `
    const usage = `
      <p class="usage-lead">제품 라벨에 표시된 방법을 기준으로 정리한 안내입니다.</p>
      <ol class="usage-list">
        ${(p.usage || [])
          .map(
            ([no, title, body]) => `
            <li><i>${esc(no)}</i><div><b>${esc(title)}</b><p>${esc(body)}</p></div></li>`,
          )
          .join('')}
      </ol>
      <p class="panel-notice">${esc(GENERAL_FOOD_NOTICE)} 개인에 따라 맞는 양과 방법이 다를 수 있으니 라벨 안내를 먼저 확인해 주세요.</p>
    `

    const el = openPanel(
      `
      <div class="inspect-head">
        <span class="badge">${esc(p.badge)}</span>
        <button class="panel-close" type="button" aria-label="닫기">✕</button>
        <div class="inspect-eyebrow">${zone ? zone.no : ''} · ${esc(zone ? zone.name : '')}</div>
        <h2 class="panel-title">${esc(p.name)}</h2>
        <div class="panel-sub">${esc(p.volume)}</div>
        <div class="panel-price">
          <b>${p.price.toLocaleString('ko-KR')}<span>원</span></b>
          ${p.listPrice ? `<s>${p.listPrice.toLocaleString('ko-KR')}원</s><em>${disc}% OFF</em>` : ''}
        </div>
        <div class="inspect-tip">손가락으로 돌려 360°로 살펴보세요 · 두 손가락/휠로 확대</div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab on" type="button" data-tab="detail" role="tab" aria-selected="true">상세설명 보기</button>
        <button class="tab" type="button" data-tab="usage" role="tab" aria-selected="false">활용법</button>
      </div>
      <div class="tab-body">
        <div class="tab-pane on" data-pane="detail">${detail}</div>
        <div class="tab-pane" data-pane="usage">${usage}</div>
      </div>
      <div class="inspect-foot">
        <a class="btn btn-primary" href="${p.cta.href}" target="_blank" rel="noopener">구매 페이지 열기 <small>${esc(p.cta.sub)}</small></a>
        <button class="btn btn-ghost" type="button" data-close>내려놓기</button>
      </div>
      `,
      'inspect',
    )

    panel.classList.add('panel-inspect')

    el.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('.tab').forEach((t) => {
          const on = t === tab
          t.classList.toggle('on', on)
          t.setAttribute('aria-selected', on ? 'true' : 'false')
        })
        el.querySelectorAll('.tab-pane').forEach((pane) => {
          pane.classList.toggle('on', pane.dataset.pane === tab.dataset.tab)
        })
      })
    })
    el.querySelector('[data-close]').addEventListener('click', () => close())
  }

  /* ---------------- 전담 매니저 대화 ---------------- */
  function openStaffChat(id) {
    const m = MANAGER_BY_ID[id]
    if (!m) return
    const zone = ZONES.find((z) => z.id === m.zone)
    const el = openPanel(
      `
      <div class="panel-hero staff-hero chat-hero">
        <button class="panel-close" type="button" aria-label="닫기">✕</button>
        <div class="staff-hero-inner">
          <span class="staff-eyebrow">AL.F.S · SHOWROOM ATTENDANT</span>
          <span class="chat-avatar">${esc(m.short)}</span>
          <span class="staff-mark">${esc(m.name)}</span>
          <span class="staff-zone">${zone ? `${zone.no} · ${esc(zone.name)}` : ''}</span>
        </div>
      </div>
      <div class="panel-body chat-body">
        <div class="chat-log" id="chatLog">
          <div class="chat-row manager">
            <div class="chat-avatar sm">${esc(m.short)}</div>
            <div class="chat-bubble">${esc(m.greeting)}</div>
          </div>
        </div>
        <div class="chat-faq-head">자주 묻는 질문 <b>10</b> <span>눌러서 답변을 받아 보세요</span></div>
        <div class="chat-chips">
          ${m.faqs
            .map(
              (f, i) =>
                `<button class="faq-chip" type="button" data-i="${i}"><i>Q${String(i + 1).padStart(2, '0')}</i>${esc(f.q)}</button>`,
            )
            .join('')}
        </div>
        <div class="chat-actions">
          ${m.products
            .map(
              (pid) =>
                `<button class="chat-product" type="button" data-product="${pid}">${esc(
                  (products.find((p) => p.id === pid) || {}).name || '',
                )} 살펴보기</button>`,
            )
            .join('')}
        </div>
        <div class="actions">
          <a class="btn btn-primary" href="${m.cta.href}" target="_blank" rel="noopener">${esc(m.cta.label)} <small>${esc(m.cta.sub)}</small></a>
          <a class="btn btn-ghost" href="${SHOP.kakao}" target="_blank" rel="noopener">카카오톡으로 상담</a>
        </div>
        <p class="panel-notice">${esc(m.notice)}</p>
      </div>
      `,
      'staff',
    )

    const log = el.querySelector('#chatLog')
    const scrollLog = () => {
      log.scrollTop = log.scrollHeight
    }

    el.querySelectorAll('.faq-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const f = m.faqs[Number(chip.dataset.i)]
        if (!f) return
        chip.classList.add('asked')
        const rowQ = document.createElement('div')
        rowQ.className = 'chat-row user'
        rowQ.innerHTML = `<div class="chat-bubble user">${esc(f.q)}</div>`
        log.appendChild(rowQ)
        scrollLog()
        const rowA = document.createElement('div')
        rowA.className = 'chat-row manager'
        rowA.innerHTML = `<div class="chat-avatar sm">${esc(m.short)}</div><div class="chat-bubble typing"><span></span><span></span><span></span></div>`
        log.appendChild(rowA)
        scrollLog()
        const bubble = rowA.querySelector('.chat-bubble')
        setTimeout(() => {
          bubble.classList.remove('typing')
          bubble.textContent = f.a
          scrollLog()
        }, 420)
      })
    })

    el.querySelectorAll('[data-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        close(false)
        if (onOpenProduct) onOpenProduct(btn.dataset.product)
      })
    })
  }

  /* ---------------- 나의 건강최적 루틴관리 시스템 ---------------- */
  function openRoutine() {
    const el = openPanel(
      `
      <div class="panel-hero routine-hero">
        <button class="panel-close" type="button" aria-label="닫기">✕</button>
        <div class="routine-hero-inner">
          <span class="staff-eyebrow">AL.F.S · DAILY ROUTINE</span>
          <span class="routine-mark">건강최적<br />루틴관리</span>
          <span class="staff-zone">MORNING · LUNCH · EVENING</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="panel-eyebrow">05 · 나의 건강최적 루틴관리 시스템</div>
        <h2 class="panel-title">${esc(ROUTINE.title)}</h2>
        <p class="panel-desc">${esc(ROUTINE.lead)}</p>
        <div class="routine-slots">
          ${ROUTINE.slots
            .map(
              (s, i) => `
            <div class="routine-slot">
              <div class="routine-time"><b>${esc(s.time)}</b><span>${esc(s.en)}</span></div>
              <div class="routine-info">
                <strong>${esc(s.name)}</strong>
                <p>${esc(s.how)}</p>
                <small>${esc(s.note)}</small>
              </div>
              <button class="routine-look" type="button" data-product="${s.product}" aria-label="${esc(s.name)} 살펴보기">보기</button>
              ${i < ROUTINE.slots.length - 1 ? '<span class="routine-link"></span>' : ''}
            </div>`,
            )
            .join('')}
        </div>
        <ul class="routine-guide">
          ${ROUTINE.guide.map(([t, b]) => `<li><b>${esc(t)}</b><span>${esc(b)}</span></li>`).join('')}
        </ul>
        <p class="panel-notice">${esc(ROUTINE.notice)}</p>
        <div class="actions">
          <a class="btn btn-primary" href="${ROUTINE.cta.href}" target="_blank" rel="noopener">${esc(ROUTINE.cta.label)} <small>${esc(ROUTINE.cta.sub)}</small></a>
          <a class="btn btn-ghost" href="${ROUTINE.secondary.href}" target="_blank" rel="noopener">${esc(ROUTINE.secondary.label)}</a>
        </div>
      </div>
      `,
      'routine',
    )

    el.querySelectorAll('[data-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        close(false)
        if (onOpenProduct) onOpenProduct(btn.dataset.product)
      })
    })
  }

  /* ---------------- 파트너샵 ---------------- */
  function openB2B(partnerCode) {
    const [base, hash] = SHOP.partner.split('#')
    const applyHref = partnerCode
      ? `${base}?p=${encodeURIComponent(partnerCode)}${hash ? `#${hash}` : ''}`
      : SHOP.partner
    openPanel(
      `
      <div class="panel-hero b2b-hero">
        <button class="panel-close" type="button" aria-label="닫기">✕</button>
        <div class="b2b-hero-inner">
          <div class="staff-eyebrow">AL.F.S · PARTNER PROGRAM</div>
          <div class="b2b-mark">PARTNER<br />SHOP</div>
          <div class="staff-zone">대리점 · 총판 · 샵인샵</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="panel-eyebrow">파트너샵 · 04 B2B 파트너 라운지</div>
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
            ? `<div class="partner-note">파트너 코드 <b>${esc(
                String(partnerCode).toUpperCase(),
              )}</b> 로 접속하셨습니다. 상담 신청 시 담당자에게 함께 전달됩니다.</div>`
            : ''
        }
        <div class="actions">
          <a class="btn btn-primary" href="${applyHref}" target="_blank" rel="noopener">대리점 · 총판 상담 신청</a>
          <a class="btn btn-ghost" href="${SHOP.kakao}" target="_blank" rel="noopener">카카오채널로 상담</a>
        </div>
      </div>
      `,
      'b2b',
    )
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
  })

  setZone('lobby')

  function setWalkUI(on) {
    rail.classList.toggle('walking', on)
    ui.querySelector('#navpad').classList.toggle('active', on)
    const chip = ui.querySelector('.hint')
    if (chip) chip.classList.toggle('walking', on)
  }

  return {
    setZone,
    setPartner,
    openInspect,
    openB2B,
    openStaffChat,
    openRoutine,
    close,
    tip,
    setWalkUI,
    isOpen: () => isOpen,
    mode: () => mode,
    rail: railBtns,
  }
}
