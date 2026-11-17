import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { interaction } from './interaction.js'
import { walkIntent } from './walkIntent.js'

// ─────────────────────────────────────────────────────────────
// 카메라: 모든 변화가 "미끄러지듯" 이어집니다.
//  · 존/상품 이동 → smootherstep 이징 글라이드
//  · 드래그 시선 회전 → 지수 감쇠(lerp) 추종
//  · 키보드·조이스틱 걷기 → 가속/감속이 붙은 이동 + 감쇠 추종
//  · 어떤 경우에도 위치가 순간이동하지 않습니다 (하드 클램프 대신 소프트 경계)
// ─────────────────────────────────────────────────────────────

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10)
// 경계를 넘을 때 잘라내지 않고 완만하게 눌러 주는 경계 (프레임 간 불연속 없음)
const softClamp = (v, min, max) => (v < min ? min + (v - min) * 0.22 : v > max ? max + (v - max) * 0.22 : v)

const LIMIT = { x: 7.4, zMin: -27.5, zMax: 25.6, yMin: 0.95, yMax: 5.6 }
const WALK_SPEED = 2.9

export function CameraRig({ zone, glideKey, focus }) {
  const { camera, gl, size } = useThree()

  const view = useRef({
    theta: zone.theta,
    phi: zone.phi,
    radius: zone.radius,
    target: new THREE.Vector3(...zone.target),
  })
  const want = useRef({
    theta: zone.theta,
    phi: zone.phi,
    radius: zone.radius,
    target: new THREE.Vector3(...zone.target),
  })
  const vel = useRef(new THREE.Vector3())
  const glide = useRef(null)
  const lookAt = useRef(new THREE.Vector3(...zone.target))
  const prevPos = useRef(null)
  const metrics = useRef({ maxStep: 0, sum: 0, frames: 0, lastZone: zone.id })

  const cancelGlide = () => {
    if (!glide.current) return
    glide.current = null
    want.current.theta = view.current.theta
    want.current.phi = view.current.phi
    want.current.radius = view.current.radius
    want.current.target.copy(view.current.target)
  }

  // 존 · 상품 이동 → 부드러운 글라이드 시작
  useEffect(() => {
    const to = focus && focus.target
      ? {
          theta: focus.theta ?? 0,
          phi: focus.phi ?? 1.44,
          radius: focus.radius ?? 4.4,
          target: new THREE.Vector3(...focus.target),
        }
      : {
          theta: zone.theta,
          phi: zone.phi,
          radius: zone.radius,
          target: new THREE.Vector3(...zone.target),
        }

    const from = {
      theta: view.current.theta,
      phi: view.current.phi,
      radius: view.current.radius,
      target: view.current.target.clone(),
    }

    const distance =
      from.target.distanceTo(to.target) + Math.abs(from.radius - to.radius) + Math.abs(from.theta - to.theta) * 4

    interaction.lastDragAt = performance.now()
    glide.current = {
      t: 0,
      dur: clamp(0.7 + distance * 0.055, 0.9, 2.4),
      from,
      to,
    }
    metrics.current.maxStep = 0
    metrics.current.sum = 0
    metrics.current.frames = 0
    // 이동 중에는 걷기 의도를 비웁니다 (글라이드와 겹치지 않게)
    vel.current.set(0, 0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.id, glideKey, focus?.key, zone.theta, zone.phi, zone.radius, zone.target])

  // 드래그 회전 · 휠/핀치 줌
  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map()
    let pinchStart = 0
    let pinchRadius = 0

    const onDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      interaction.moved = false
      el.setPointerCapture?.(e.pointerId)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y)
        pinchRadius = want.current.radius
      }
    }

    const onMove = (e) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchStart > 0) {
          want.current.radius = clamp(pinchRadius * (pinchStart / Math.max(dist, 1)), 3.4, 10.5)
        }
        interaction.moved = true
        return
      }

      if (Math.abs(dx) + Math.abs(dy) > 2) {
        interaction.moved = true
        interaction.lastDragAt = performance.now()
        cancelGlide()
        want.current.theta -= dx * 0.005
        want.current.phi = clamp(want.current.phi - dy * 0.004, 0.66, 1.6)
      }
    }

    const onUp = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchStart = 0
      window.setTimeout(() => {
        interaction.moved = false
      }, 60)
    }

    const onWheel = (e) => {
      e.preventDefault()
      cancelGlide()
      want.current.radius = clamp(want.current.radius + e.deltaY * 0.0045, 3.4, 10.5)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl])

  // 키보드 걷기 (WASD · 방향키) — 입력창에 글을 쓸 때는 동작하지 않습니다
  useEffect(() => {
    const pressed = new Set()
    const apply = () => {
      let side = 0
      let fwd = 0
      if (pressed.has('a') || pressed.has('arrowleft')) side -= 1
      if (pressed.has('d') || pressed.has('arrowright')) side += 1
      if (pressed.has('w') || pressed.has('arrowup')) fwd += 1
      if (pressed.has('s') || pressed.has('arrowdown')) fwd -= 1
      const len = Math.hypot(side, fwd)
      walkIntent.x = len > 0 ? side / len : 0
      walkIntent.z = len > 0 ? fwd / len : 0
    }
    const isTyping = () => {
      const el = document.activeElement
      if (!el) return false
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable
    }
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if (!['a', 'd', 'w', 's', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) return
      if (isTyping()) return
      e.preventDefault()
      cancelGlide()
      pressed.add(k)
      apply()
    }
    const onKeyUp = (e) => {
      pressed.delete(e.key.toLowerCase())
      apply()
    }
    const onBlur = () => {
      pressed.clear()
      apply()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      pressed.clear()
      apply()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 화면 검증용 계측기 (프레임 간 카메라 이동량)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    window.__ALFS_CAM_RESET__ = () => {
      metrics.current = { maxStep: 0, sum: 0, frames: 0, lastZone: zone.id }
    }
    return () => {
      delete window.__ALFS_CAM_RESET__
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    // 낮은 프레임에서도 걷기 속도가 급격히 느려지지 않도록 상한을 0.1초로 둡니다
    const dt = Math.min(delta, 0.1)
    const c = view.current
    const w = want.current

    if (glide.current) {
      const g = glide.current
      // 글라이드는 벽시계 시간 기준으로 진행하되,
      // 프레임이 아주 느릴 때도 최소 7프레임 이상 이어지도록 한 프레임 진행을 제한합니다.
      g.t = Math.min(1, g.t + Math.min(Math.min(delta, 0.5) / g.dur, 0.14))
      const e = smootherstep(g.t)
      c.theta = g.from.theta + (g.to.theta - g.from.theta) * e
      c.phi = g.from.phi + (g.to.phi - g.from.phi) * e
      c.radius = g.from.radius + (g.to.radius - g.from.radius) * e
      c.target.lerpVectors(g.from.target, g.to.target, e)
      // 글라이드가 끝나는 순간에도 목표값이 같도록 계속 동기화합니다 (끝에서 튀지 않음)
      w.theta = c.theta
      w.phi = c.phi
      w.radius = c.radius
      w.target.copy(c.target)
      if (g.t >= 1) glide.current = null
    } else {
      // 걷기: 의도 → 가속 → 감속 (지수 감쇠)
      const fx = -Math.sin(c.theta)
      const fz = -Math.cos(c.theta)
      const rx = Math.cos(c.theta)
      const rz = -Math.sin(c.theta)
      const tvx = (fx * walkIntent.z + rx * walkIntent.x) * WALK_SPEED
      const tvz = (fz * walkIntent.z + rz * walkIntent.x) * WALK_SPEED
      const accel = 1 - Math.exp(-dt * 7)
      vel.current.x += (tvx - vel.current.x) * accel
      vel.current.z += (tvz - vel.current.z) * accel

      if (Math.abs(vel.current.x) + Math.abs(vel.current.z) > 0.002) {
        w.target.x += vel.current.x * dt
        w.target.z += vel.current.z * dt
        const bx = LIMIT.x
        const bzMin = LIMIT.zMin
        const bzMax = LIMIT.zMax
        if (w.target.x < -bx || w.target.x > bx) {
          w.target.x = clamp(w.target.x, -bx, bx)
          vel.current.x = 0
        }
        if (w.target.z < bzMin || w.target.z > bzMax) {
          w.target.z = clamp(w.target.z, bzMin, bzMax)
          vel.current.z = 0
        }
        w.target.y = clamp(w.target.y, 1.1, 2.2)
      }

      // 시선·거리도 같은 감쇠로 따라갑니다
      const k = 1 - Math.exp(-dt * 9)
      c.theta += (w.theta - c.theta) * k
      c.phi += (w.phi - c.phi) * k
      c.radius += (w.radius - c.radius) * k
      c.target.lerp(w.target, k)
    }

    const sinPhi = Math.sin(c.phi)
    const px = softClamp(c.target.x + c.radius * sinPhi * Math.sin(c.theta), -LIMIT.x, LIMIT.x)
    const py = clamp(c.target.y + c.radius * Math.cos(c.phi), LIMIT.yMin, LIMIT.yMax)
    const pz = softClamp(c.target.z + c.radius * sinPhi * Math.cos(c.theta), LIMIT.zMin, LIMIT.zMax)
    camera.position.set(px, py, pz)

    // 시선 목표도 한 번 더 감쇠시켜 미세한 떨림을 없앱니다
    lookAt.current.lerp(c.target, 1 - Math.exp(-dt * 14))
    camera.lookAt(lookAt.current)

    // 계측: 프레임마다 카메라가 움직인 거리
    const m = metrics.current
    m.frames += 1
    if (prevPos.current) {
      const step = camera.position.distanceTo(prevPos.current)
      m.sum += step
      if (step > m.maxStep) m.maxStep = step
    } else {
      prevPos.current = camera.position.clone()
    }
    prevPos.current.copy(camera.position)

    if (typeof window !== 'undefined') {
      window.__ALFS_CAM__ = {
        x: +camera.position.x.toFixed(3),
        y: +camera.position.y.toFixed(3),
        z: +camera.position.z.toFixed(3),
        tx: +c.target.x.toFixed(3),
        ty: +c.target.y.toFixed(3),
        tz: +c.target.z.toFixed(3),
        gliding: !!glide.current,
        maxStep: +m.maxStep.toFixed(4),
        avgStep: +(m.sum / Math.max(1, m.frames)).toFixed(4),
        frames: m.frames,
      }
    }
  })

  void size

  return null
}

// 모바일은 화면이 좁아 시야각을 넓혀 한 존이 한 화면에 들어오게 합니다.
export function ResponsiveCamera() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useEffect(() => {
    const ratio = size.width / Math.max(size.height, 1)
    camera.fov = ratio < 0.85 ? 72 : ratio < 1.2 ? 60 : 50
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}
