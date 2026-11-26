import * as THREE from 'three'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a))

/* 카메라 안전 구역 — 쇼룸 안쪽 벽에서 1.0m 띄운 공간.
   어떤 조작을 해도 이 상자를 벗어나지 않습니다. (1 unit = 1m) */
export const CAMERA_BOUNDS = {
  minX: -4.5,
  maxX: 4.5,
  minZ: -7.5,
  maxZ: 5.5,
  minY: 1.05, // 바닥 위 (눈높이 아래로도 내려가지 않음)
  maxY: 3.0, // 천장(4.2m) 아래
}

const PITCH_MIN = -0.55 // 위로 31°
const PITCH_MAX = 0.95 // 아래로 54°
const EYE = 1.62 // 걸어 다닐 때의 눈높이

/**
 * 1인칭 카메라 리그.
 *
 * 예전에는 target 을 중심으로 카메라가 공전(orbit)해서, 드래그할 때 방 전체가
 * 크게 휘돌아가는 느낌이 났습니다. 지금은 카메라가 제자리에서 시선(yaw·pitch)만
 * 부드럽게 돌고, 위치는 바닥을 눌렀을 때·휠·키보드로만 "걸어서" 움직입니다.
 * - 시선·이동 모두 지수 감쇠(damped)로 이어져 끊김이 없습니다.
 * - 카메라 위치와 시선 목표점은 매 프레임 실내 안전 구역 안으로 고정됩니다.
 */
export class CameraRig {
  constructor(camera, dom, { onUserInput, bounds, colliders } = {}) {
    this.camera = camera
    this.dom = dom
    this.bounds = { ...CAMERA_BOUNDS, ...(bounds || {}) }
    this.colliders = colliders || []

    this.pos = new THREE.Vector3(0.3, 2.2, 5.2)
    this.goalPos = this.pos.clone()
    this.yaw = 0
    this.pitch = 0.1
    this.goalYaw = 0
    this.goalPitch = 0.1
    this.baseYaw = 0
    this.limits = { yawRange: 1.15 }

    this.enabled = true
    this.walk = false
    this.savedYawRange = null
    this.dragging = false
    this.moved = 0
    this.tween = null
    this.gliding = false
    this.onUserInput = onUserInput || null

    this.pointers = new Map()
    this.pinch = null

    this._look = new THREE.Vector3()
    this._step = new THREE.Vector3()

    dom.addEventListener('pointerdown', (e) => this.onDown(e))
    dom.addEventListener('pointermove', (e) => this.onMove(e))
    dom.addEventListener('pointerup', (e) => this.onUp(e))
    dom.addEventListener('pointercancel', (e) => this.onUp(e))
    dom.addEventListener('wheel', (e) => this.onWheel(e), { passive: false })
    dom.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  /* ---------------- 좌표 · 시선 변환 ---------------- */
  // 시선 방향 d = (-sin(yaw)cos(pitch), -sin(pitch), -cos(yaw)cos(pitch))
  static lookFrom(pos, target) {
    const dir = new THREE.Vector3().subVectors(target, pos)
    const len = dir.length() || 1
    const pitch = Math.asin(clamp(-dir.y / len, -1, 1))
    const yaw = Math.atan2(-dir.x, -dir.z)
    return { yaw, pitch: clamp(pitch, PITCH_MIN, PITCH_MAX) }
  }

  /* ---------------- 위치 고정 ---------------- */
  clampPos(p) {
    const b = this.bounds
    p.x = clamp(p.x, b.minX, b.maxX)
    p.z = clamp(p.z, b.minZ, b.maxZ)
    p.y = clamp(p.y, b.minY, b.maxY)
    return p
  }

  // 큰 집기(연단·콘솔·테이블·키오스크)를 부드럽게 밀어냅니다.
  avoidColliders(p, margin = 0.5) {
    for (const c of this.colliders) {
      const dx = p.x - c.x
      const dz = p.z - c.z
      const d = Math.hypot(dx, dz)
      const r = c.r + margin
      if (d < r) {
        if (d < 0.0001) {
          p.x = c.x + r
          p.z = c.z
        } else {
          p.x = c.x + (dx / d) * r
          p.z = c.z + (dz / d) * r
        }
      }
    }
    return this.clampPos(p)
  }

  /* ---------------- 존 구도 ---------------- */
  setPose(pose, { instant = false, duration = 1.6 } = {}) {
    const to = new THREE.Vector3(...pose.pos)
    this.clampPos(to)
    const look = CameraRig.lookFrom(to, new THREE.Vector3(...pose.target))

    this.baseYaw = look.yaw

    if (instant) {
      this.pos.copy(to)
      this.goalPos.copy(to)
      this.yaw = look.yaw
      this.goalYaw = look.yaw
      this.pitch = look.pitch
      this.goalPitch = look.pitch
      this.tween = null
      this.gliding = false
      return
    }

    const from = { pos: this.pos.clone(), yaw: this.yaw, pitch: this.pitch }
    let deltaYaw = wrapAngle(look.yaw - from.yaw)
    this.tween = {
      t: 0,
      duration,
      from,
      to: { pos: to.clone(), yaw: from.yaw + deltaYaw, pitch: look.pitch },
    }
    this.gliding = false
  }

  setLimits(limits = {}) {
    this.limits = {
      yawRange: limits.yawRange ?? 1.15,
    }
  }

  /* ---------------- 자유 이동(산책) 모드 ---------------- */
  setWalk(on) {
    if (this.walk === on) return
    this.walk = on
    this.tween = null
    if (on) {
      this.savedYawRange = this.limits.yawRange
      this.limits = { yawRange: Math.PI * 2 }
      this.baseYaw = this.goalYaw
      // 서 있는 눈높이로 자연스럽게 내려섭니다.
      this.goalPos.y = EYE
    } else if (this.savedYawRange != null) {
      this.limits = { yawRange: this.savedYawRange }
      this.savedYawRange = null
    }
  }

  setWalkBounds(bounds, colliders = []) {
    this.bounds = { ...CAMERA_BOUNDS, ...(bounds || {}) }
    this.colliders = colliders
  }

  /* ---------------- 이동 ---------------- */
  _shiftBy(forward, right) {
    const y = this.goalYaw
    const fx = -Math.sin(y)
    const fz = -Math.cos(y)
    const rx = Math.cos(y)
    const rz = -Math.sin(y)
    const p = this.goalPos.clone()
    p.x += fx * forward + rx * right
    p.z += fz * forward + rz * right
    this.avoidColliders(p, 0.45)
    this.goalPos.copy(p)
    this.tween = null
    this.gliding = true
  }

  // forward / right 는 이번 프레임에 이동할 거리(m)
  moveBy(forward, right) {
    this._shiftBy(forward, right)
  }

  // 휠·핀치 — 시선 방향으로 살짝 앞뒤 이동 (방 안으로 고정)
  glideBy(distance) {
    if (!distance) return
    this._shiftBy(distance, 0)
    if (this.onUserInput) this.onUserInput()
  }

  // 바닥을 누르면 그 지점까지 걷습니다.
  glideTo(point, { eyeY = EYE } = {}) {
    const b = this.bounds
    const p = new THREE.Vector3(clamp(point.x, b.minX, b.maxX), clamp(eyeY, b.minY, b.maxY), clamp(point.z, b.minZ, b.maxZ))
    this.avoidColliders(p, 0.55)
    this.goalPos.copy(p)
    this.tween = null
    this.gliding = true
    if (this.onUserInput) this.onUserInput()
  }

  turnBy(rad) {
    const lo = this.baseYaw - this.limits.yawRange
    const hi = this.baseYaw + this.limits.yawRange
    this.goalYaw = clamp(this.goalYaw + rad, lo, hi)
    this.tween = null
  }

  /* ---------------- 입력 ---------------- */
  onDown(e) {
    if (!this.enabled) return
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    this.moved = 0
    this.dragging = true
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()]
      this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }
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

    if (this.pointers.size === 2) {
      // 두 손가락 — 앞뒤로 살짝 걷기
      const [a, b] = [...this.pointers.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (this.pinch && this.pinch.d > 8) {
        this.glideBy(clamp((d - this.pinch.d) * 0.011, -0.18, 0.18))
      }
      this.pinch = { d }
      return
    }

    if (!this.dragging) return
    this.moved += Math.abs(dx) + Math.abs(dy)
    if (this.moved > 3) this.tween = null
    const lo = this.baseYaw - this.limits.yawRange
    const hi = this.baseYaw + this.limits.yawRange
    this.goalYaw = clamp(this.goalYaw - dx * 0.0044, lo, hi)
    this.goalPitch = clamp(this.goalPitch - dy * 0.0034, PITCH_MIN, PITCH_MAX)
  }

  onUp(e) {
    this.pointers.delete(e.pointerId)
    if (this.pointers.size < 2) this.pinch = null
    if (this.pointers.size === 0) this.dragging = false
  }

  onWheel(e) {
    if (!this.enabled) return
    e.preventDefault()
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    this.glideBy(clamp(-delta * 0.0045, -0.9, 0.9))
  }

  /* ---------------- 프레임 ---------------- */
  update(dt) {
    const step = Math.min(dt, 0.06)

    if (this.tween) {
      const tw = this.tween
      tw.t = Math.min(1, tw.t + step / tw.duration)
      const e = easeInOut(tw.t)
      this.goalPos.lerpVectors(tw.from.pos, tw.to.pos, e)
      this.goalYaw = tw.from.yaw + (tw.to.yaw - tw.from.yaw) * e
      this.goalPitch = tw.from.pitch + (tw.to.pitch - tw.from.pitch) * e
      this.clampPos(this.goalPos)
      if (tw.t >= 1) this.tween = null
    }

    // 목표 또한 매 프레임 실내로 고정 (안전 이중 장치)
    this.clampPos(this.goalPos)
    this.goalPitch = clamp(this.goalPitch, PITCH_MIN, PITCH_MAX)

    const kp = 1 - Math.exp(-6.5 * step)
    const move = this._step.copy(this.goalPos).sub(this.pos).multiplyScalar(kp)
    const maxStep = 3.0 * step // 최대 3 m/s 로 걸어갑니다
    if (move.length() > maxStep) move.setLength(maxStep)
    this.pos.add(move)
    if (this.gliding && this.pos.distanceToSquared(this.goalPos) < 1e-4) this.gliding = false

    const kl = 1 - Math.exp(-15 * step)
    this.yaw += wrapAngle(this.goalYaw - this.yaw) * kl
    this.pitch += (this.goalPitch - this.pitch) * kl

    // 실제 카메라 위치 — 벽·집기 밖으로는 절대 나가지 않습니다.
    this.avoidColliders(this.pos, 0.34)

    const cp = Math.cos(this.pitch)
    this.camera.position.copy(this.pos)
    this._look.set(
      this.pos.x - Math.sin(this.yaw) * cp,
      this.pos.y - Math.sin(this.pitch),
      this.pos.z - Math.cos(this.yaw) * cp,
    )
    this.camera.lookAt(this._look)
  }
}
