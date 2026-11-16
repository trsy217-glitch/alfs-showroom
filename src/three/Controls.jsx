import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { interaction } from './interaction.js'

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// 카메라: 존 프리셋으로 부드럽게 글라이드 + 드래그 회전 / 휠·핀치 줌
export function CameraRig({ zone, glideKey }) {
  const { camera, gl } = useThree()
  const cur = useRef({
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
  const glide = useRef(null)

  useEffect(() => {
    const now = performance.now()
    // 존을 옮긴 직후 들어오는 '클릭'을 무시 (드래그와 같은 경로로 처리됨)
    interaction.lastDragAt = now
    glide.current = {
      t: 0,
      dur: 1.25,
      from: {
        theta: cur.current.theta,
        phi: cur.current.phi,
        radius: cur.current.radius,
        target: cur.current.target.clone(),
      },
      to: {
        theta: zone.theta,
        phi: zone.phi,
        radius: zone.radius,
        target: new THREE.Vector3(...zone.target),
      },
    }
  }, [zone.id, glideKey, zone.theta, zone.phi, zone.radius, zone.target])

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
          want.current.radius = clamp(pinchRadius * (pinchStart / Math.max(dist, 1)), 3.2, 10)
        }
        interaction.moved = true
        return
      }

      if (Math.abs(dx) + Math.abs(dy) > 2) {
        interaction.moved = true
        interaction.lastDragAt = performance.now()
        glide.current = null
        want.current.theta -= dx * 0.005
        want.current.phi = clamp(want.current.phi - dy * 0.004, 0.62, 1.62)
      }
    }

    const onUp = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchStart = 0
      // 클릭 직후 바로 다시 클릭할 수 있게 잠시 뒤 해제
      window.setTimeout(() => {
        interaction.moved = false
      }, 60)
    }

    const onWheel = (e) => {
      e.preventDefault()
      glide.current = null
      want.current.radius = clamp(want.current.radius + e.deltaY * 0.0045, 3.2, 10)
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
  }, [gl])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const c = cur.current
    const w = want.current

    if (glide.current) {
      const g = glide.current
      g.t += dt / g.dur
      const e = easeInOut(clamp(g.t, 0, 1))
      c.theta = g.from.theta + (g.to.theta - g.from.theta) * e
      c.phi = g.from.phi + (g.to.phi - g.from.phi) * e
      c.radius = g.from.radius + (g.to.radius - g.from.radius) * e
      c.target.lerpVectors(g.from.target, g.to.target, e)
      if (g.t >= 1) {
        glide.current = null
        w.theta = c.theta
        w.phi = c.phi
        w.radius = c.radius
        w.target.copy(c.target)
      }
    } else {
      const k = Math.min(1, dt * 8)
      c.theta += (w.theta - c.theta) * k
      c.phi += (w.phi - c.phi) * k
      c.radius += (w.radius - c.radius) * k
      c.target.lerp(w.target, k)
    }

    const sinPhi = Math.sin(c.phi)
    camera.position.set(
      c.target.x + c.radius * sinPhi * Math.sin(c.theta),
      clamp(c.target.y + c.radius * Math.cos(c.phi), 0.75, 5.4),
      c.target.z + c.radius * sinPhi * Math.cos(c.theta),
    )
    camera.position.x = clamp(camera.position.x, -7.9, 7.9)
    camera.position.z = clamp(camera.position.z, -28.4, 26.2)
    camera.lookAt(c.target)

    // 화면 검증용 상태 노출 (카메라 이동이 끝났는지 확인하는 데 씁니다)
    if (typeof window !== 'undefined') {
      window.__ALFS_CAM__ = {
        x: +camera.position.x.toFixed(3),
        y: +camera.position.y.toFixed(3),
        z: +camera.position.z.toFixed(3),
        tx: +c.target.x.toFixed(3),
        ty: +c.target.y.toFixed(3),
        tz: +c.target.z.toFixed(3),
        gliding: !!glide.current,
      }
    }
  })

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
