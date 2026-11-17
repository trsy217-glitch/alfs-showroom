import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { consultantGreeting, DEFAULT_PARTNER, resolvePartner } from './config/partners.js'
import { productFocus, zoneById } from './three/zones.js'
import { respond } from './lib/assistant.js'
import { setTextSize, useTextSize } from './lib/textSize.js'
import { ShowroomCanvas } from './three/ShowroomCanvas.jsx'
import { ChapterBar, Hint, LoadingScreen, TextSizeToggle, TopBar } from './ui/Chrome.jsx'
import { Joystick } from './ui/Joystick.jsx'
import { ProductInspector } from './ui/ProductInspector.jsx'
import { AssistantDrawer } from './ui/AssistantDrawer.jsx'
import { SimulatorPanel } from './ui/SimulatorPanel.jsx'
import { StaffMenu } from './ui/StaffMenu.jsx'
import { LoungeToast, WelcomeGreeting } from './ui/Greeting.jsx'

const readPartnerCode = () => {
  if (typeof window === 'undefined') return DEFAULT_PARTNER
  const code = new URLSearchParams(window.location.search).get('p')
  return code || DEFAULT_PARTNER
}

const useNarrow = () => {
  const [narrow, setNarrow] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 760))
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return narrow
}

export default function App() {
  const [partner, setPartner] = useState(() => resolvePartner(readPartnerCode()))
  const [zoneId, setZoneId] = useState('lobby')
  const [glideKey, setGlideKey] = useState(0)
  const [product, setProduct] = useState(null)
  const [messages, setMessages] = useState([])
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [staffMenu, setStaffMenu] = useState(false)
  const [nearStaff, setNearStaff] = useState(false)
  const [welcome, setWelcome] = useState(false)
  const [loungeToast, setLoungeToast] = useState(false)
  const [simOpen, setSimOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState(true)
  const textSize = useTextSize()
  const narrow = useNarrow()
  const loungeRef = useRef({ inside: false, shownAt: 0 })
  const loungeTimer = useRef(0)

  const zone = useMemo(() => zoneById(zoneId), [zoneId])

  // 상품을 열면 그 진열대로 카메라가 부드럽게 다가갑니다
  const focus = useMemo(() => {
    if (!product) return null
    const preset = productFocus(product, narrow)
    return preset ? { key: `p-${product.id}`, ...preset } : null
  }, [product, narrow])

  // 지점이 바뀌면 상담 매니저의 소속 인사말도 바뀝니다
  useEffect(() => {
    setMessages([
      { role: 'staff', text: consultantGreeting(partner), chips: ['오륜미네랄이 뭐예요?', '효소세상 6종 보여줘', '배송비 얼마예요?', '뭘 사야 할지 모르겠어요'] },
    ])
  }, [partner])

  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 8000)
    return () => window.clearTimeout(t)
  }, [])

  // 입장 인사 — 한 글자씩 입체로 나타나는 환영 문구
  useEffect(() => {
    if (!ready) return undefined
    const a = window.setTimeout(() => setWelcome(true), 400)
    const b = window.setTimeout(() => setWelcome(false), 7800)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [ready])

  // 05 라운지 도착 안내 — 챕터 이동으로 오든, 걸어서 들어오든 '도착하면' 한 번씩
  const showLounge = useCallback(() => {
    const now = performance.now()
    if (now - loungeRef.current.shownAt < 12000) return
    loungeRef.current.shownAt = now
    setLoungeToast(true)
    window.clearTimeout(loungeTimer.current)
    loungeTimer.current = window.setTimeout(() => setLoungeToast(false), 7600)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      const cam = typeof window !== 'undefined' ? window.__ALFS_CAM__ : null
      if (!cam) return
      const b = zoneById('lounge').bounds
      // 카메라가 라운지 구역에 실제로 들어와 멈췄을 때 (이동 중에는 띄우지 않음)
      const inside = cam.tx > b[0] && cam.tx < b[1] && cam.tz > b[2] && cam.tz < b[3]
      if (inside && !cam.gliding && !loungeRef.current.inside) showLounge()
      loungeRef.current.inside = inside && !cam.gliding
    }, 450)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(loungeTimer.current)
    }
  }, [showLounge])

  const goZone = useCallback((id) => {
    setProduct(null)
    setZoneId(id)
    setGlideKey((k) => k + 1)
  }, [])

  const switchPartner = useCallback((code) => {
    const next = resolvePartner(code)
    setPartner(next)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('p', next.code)
      window.history.replaceState({}, '', url)
    } catch {
      /* URL 조작이 막힌 환경은 무시하고 지점만 바꿉니다 */
    }
  }, [])

  const summon = useCallback(() => {
    setStaffMenu(true)
  }, [])

  const closeAssistant = useCallback(() => {
    setAssistantOpen(false)
  }, [])

  const ask = useCallback(
    (question) => {
      const q = String(question || '').trim()
      if (!q) return
      setAssistantOpen(true)
      const r = respond(q, partner)
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: q },
        { role: 'staff', text: r.text, chips: r.chips, products: r.products, cta: r.cta },
      ])
    },
    [partner],
  )

  const openProduct = useCallback((p) => setProduct(p), [])

  return (
    <div className="app" style={{ '--accent': partner.accent, '--accent-soft': partner.accentSoft }}>
      <div className="stage" data-testid="stage">
        <ShowroomCanvas
          partner={partner}
          zoneId={zoneId}
          glideKey={glideKey}
          focus={focus}
          narrow={narrow}
          talking={assistantOpen}
          paused={!!product}
          onGo={goZone}
          onSelect={openProduct}
          onSummon={summon}
          onOpenSimulator={() => setSimOpen(true)}
          onNearStaff={setNearStaff}
          onReady={() => window.setTimeout(() => setReady(true), 120)}
        />
      </div>

      <TopBar
        partner={partner}
        zoneId={zoneId}
        zoneName={zone.name}
        onSummon={summon}
        onSwitchPartner={switchPartner}
        onGo={goZone}
        textSize={textSize}
        onTextSize={setTextSize}
      />
      <Hint show={hint && ready && !assistantOpen && !staffMenu} />

      <Joystick />

      <div className="cta-stack">
        <button type="button" className="btn btn--round" onClick={() => setSimOpen(true)} data-testid="open-simulator">
          <span aria-hidden="true">✦</span> 루틴 시뮬레이터
        </button>
      </div>

      <ChapterBar zoneId={zoneId} onGo={goZone} />

      <WelcomeGreeting show={welcome} />
      <LoungeToast show={loungeToast} />

      {nearStaff && !staffMenu && !assistantOpen && !product && (
        <button type="button" className="staff-prompt" onClick={summon} data-testid="staff-prompt">
          <span className="staff-prompt__dot" aria-hidden="true" />
          서연에게 말 걸기
        </button>
      )}

      <ProductInspector product={product} partner={partner} onClose={() => setProduct(null)} onAsk={ask} onGo={goZone} />

      <StaffMenu
        partner={partner}
        open={staffMenu}
        onClose={() => setStaffMenu(false)}
        onAsk={ask}
        onOpenSimulator={() => setSimOpen(true)}
        onOpenProduct={openProduct}
      />

      <AssistantDrawer
        partner={partner}
        open={assistantOpen}
        onClose={closeAssistant}
        messages={messages}
        onAsk={ask}
        onOpenProduct={(p) => {
          openProduct(p)
          setAssistantOpen(false)
        }}
        onOpenSimulator={() => {
          setSimOpen(true)
          setAssistantOpen(false)
        }}
      />

      <SimulatorPanel
        partner={partner}
        open={simOpen}
        onClose={() => setSimOpen(false)}
        onResult={(r) => goZone(r.zone)}
        onAsk={(q) => {
          setSimOpen(false)
          ask(q)
        }}
      />

      <LoadingScreen done={ready} />
    </div>
  )
}
