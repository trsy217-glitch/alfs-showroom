import * as THREE from 'three'

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export class CameraRig {
  constructor(camera, dom, { onUserInput } = {}) {
    this.camera = camera
    this.dom = dom
    this.target = new THREE.Vector3(0, 1.5, -5)
    this.yaw = 0
    this.pitch = 0.25
    this.dist = 8
    this.goal = { yaw: 0, pitch: 0.25, dist: 8, target: new THREE.Vector3(0, 1.5, -5) }
    this.baseYaw = 0
    this.limits = { minDist: 1, maxDist: 10, minPitch: 0.02, maxPitch: 0.6, yawRange: 1.15 }
    this.enabled = true
    this.dragging = false
    this.moved = 0
    this.tween = null
    this.onUserInput = onUserInput || null
    this.pointers = new Map()
    this.pinch = null

    dom.addEventListener('pointerdown', (e) => this.onDown(e))
    dom.addEventListener('pointermove', (e) => this.onMove(e))
    dom.addEventListener('pointerup', (e) => this.onUp(e))
    dom.addEventListener('pointercancel', (e) => this.onUp(e))
    dom.addEventListener('wheel', (e) => this.onWheel(e), { passive: false })
    dom.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  setPose(pose, { instant = false, duration = 1.6 } = {}) {
    const t = new THREE.Vector3(...pose.target)
    const p = new THREE.Vector3(...pose.pos)
    const off = p.clone().sub(t)
    const dist = Math.max(0.2, off.length())
    const pitch = Math.asin(clamp(off.y / dist, -1, 1))
    let yaw = Math.atan2(off.x, off.z)

    // 가장 가까운 회전 방향으로
    const from = this.tween ? this.goal.yaw : this.yaw
    while (yaw - from > Math.PI) yaw -= Math.PI * 2
    while (yaw - from < -Math.PI) yaw += Math.PI * 2

    this.baseYaw = yaw
    this.goal.target.copy(t)
    this.goal.yaw = yaw
    this.goal.pitch = pitch
    this.goal.dist = dist

    if (instant) {
      this.target.copy(t)
      this.yaw = yaw
      this.pitch = pitch
      this.dist = dist
      this.tween = null
    } else {
      this.tween = {
        t: 0,
        duration,
        from: {
          target: this.goal.target.clone(),
          yaw: this.goal.yaw,
          pitch: this.goal.pitch,
          dist: this.goal.dist,
        },
      }
      // 목표를 현재 카메라 상태에서 시작
      const cur = this.currentOffsetTarget()
      this.tween.from = cur
      this.tween.to = { target: t.clone(), yaw, pitch, dist }
      this.goal.yaw = cur.yaw
      this.goal.pitch = cur.pitch
      this.goal.dist = cur.dist
      this.goal.target.copy(cur.target)
    }
  }

  currentOffsetTarget() {
    return {
      target: this.target.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
      dist: this.dist,
    }
  }

  setLimits(limits = {}) {
    this.limits = {
      minDist: limits.minDist ?? 1,
      maxDist: limits.maxDist ?? 10,
      minPitch: limits.minPitch ?? 0.02,
      maxPitch: limits.maxPitch ?? 0.6,
      yawRange: limits.yawRange ?? 1.15,
    }
  }

  setYawRange(range) {
    this.limits.yawRange = range
  }

  onDown(e) {
    if (!this.enabled) return
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    this.moved = 0
    this.dragging = true
    this.tween = null
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]
      this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: this.goal.dist }
    }
    try {
      this.dom.setPointerCapture(e.pointerId)
    } catch {}
    if (this.onUserInput) this.onUserInput()
  }

  onMove(e) {
    if (!this.pointers.has(e.pointerId)) return
    const prev = this.pointers.get(e.pointerId)
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    prev.x = e.clientX
    prev.y = e.clientY

    if (this.pointers.size === 2 && this.pinch) {
      const [a, b] = [...this.pointers.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d > 10) {
        this.goal.dist = clamp(this.pinch.dist * (this.pinch.d / d), this.limits.minDist, this.limits.maxDist)
      }
      return
    }

    if (!this.dragging) return
    this.moved += Math.abs(dx) + Math.abs(dy)
    if (this.moved > 3) this.tween = null
    this.goal.yaw = clamp(this.goal.yaw - dx * 0.0042, this.baseYaw - this.limits.yawRange, this.baseYaw + this.limits.yawRange)
    this.goal.pitch = clamp(this.goal.pitch - dy * 0.0032, this.limits.minPitch, this.limits.maxPitch)
  }

  onUp(e) {
    this.pointers.delete(e.pointerId)
    if (this.pointers.size < 2) this.pinch = null
    if (this.pointers.size === 0) this.dragging = false
  }

  onWheel(e) {
    if (!this.enabled) return
    e.preventDefault()
    this.tween = null
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    this.goal.dist = clamp(this.goal.dist * Math.exp(delta * 0.0011), this.limits.minDist, this.limits.maxDist)
    if (this.onUserInput) this.onUserInput()
  }

  update(dt) {
    if (this.tween) {
      const tw = this.tween
      tw.t = Math.min(1, tw.t + dt / tw.duration)
      const e = easeInOut(tw.t)
      this.goal.target.lerpVectors(tw.from.target, tw.to.target, e)
      this.goal.yaw = tw.from.yaw + (tw.to.yaw - tw.from.yaw) * e
      this.goal.pitch = tw.from.pitch + (tw.to.pitch - tw.from.pitch) * e
      this.goal.dist = tw.from.dist + (tw.to.dist - tw.from.dist) * e
      if (tw.t >= 1) this.tween = null
    }

    const k = 1 - Math.exp(-8.5 * Math.min(dt, 0.06))
    this.yaw += (this.goal.yaw - this.yaw) * k
    this.pitch += (this.goal.pitch - this.pitch) * k
    this.dist += (this.goal.dist - this.dist) * k
    this.target.lerp(this.goal.target, k)

    const cp = Math.cos(this.pitch)
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * cp * this.dist,
      this.target.y + Math.sin(this.pitch) * this.dist,
      this.target.z + Math.cos(this.yaw) * cp * this.dist,
    )
    this.camera.lookAt(this.target)
  }
}
