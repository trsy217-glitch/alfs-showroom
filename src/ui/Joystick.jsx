import { useRef, useState } from 'react'
import { walkIntent } from '../three/walkIntent.js'

// 터치·마우스로 걷는 조이스틱 — 값은 walkIntent 로 전달되고 카메라가 부드럽게 따라갑니다.
export function Joystick() {
  const base = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef(false)

  const apply = (e) => {
    const el = base.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const max = r.width / 2 - 16
    let dx = (e.clientX - cx) / max
    let dy = (e.clientY - cy) / max
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    setKnob({ x: dx * (max - 6), y: dy * (max - 6) })
    walkIntent.x = dx
    walkIntent.z = -dy
  }

  const stop = () => {
    active.current = false
    setKnob({ x: 0, y: 0 })
    walkIntent.x = 0
    walkIntent.z = 0
  }

  return (
    <div
      className="joy"
      ref={base}
      role="application"
      aria-label="이동 조이스틱"
      data-testid="joystick"
      onPointerDown={(e) => {
        active.current = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
        apply(e)
      }}
      onPointerMove={(e) => {
        if (!active.current) return
        apply(e)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={() => {
        if (active.current) stop()
      }}
    >
      <div className="joy__knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      <span className="joy__label">이동</span>
    </div>
  )
}
