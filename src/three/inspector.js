import * as THREE from 'three'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/**
 * 상품을 진열대에서 공중으로 들어 올려 360도로 살펴보는 연출.
 * - 실제 진열 모델을 복제해 사용하고, 원본은 잠시 숨깁니다.
 * - 드래그로 회전, 휠/핀치로 확대, 닫으면 원래 자리로 내려놓습니다.
 */
export class ProductInspector {
  constructor({ scene, camera, models }) {
    this.scene = scene
    this.camera = camera
    this.models = models || {}

    this.group = new THREE.Group()
    this.group.visible = false
    this.scene.add(this.group)

    this.pivot = new THREE.Group()
    this.group.add(this.pivot)

    this.light = new THREE.PointLight(0xffe7c6, 2.6, 3.4, 2)
    this.light.position.set(0.3, 0.28, 0.55)
    this.group.add(this.light)

    // 상품 뒤로 은은하게 깔리는 어두운 비네트 — 배경을 정리해 상품에 시선을 모읍니다.
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    const g = c.getContext('2d')
    const grad = g.createRadialGradient(256, 256, 16, 256, 256, 250)
    grad.addColorStop(0, 'rgba(11,9,7,0.55)')
    grad.addColorStop(0.5, 'rgba(11,9,7,0.4)')
    grad.addColorStop(0.78, 'rgba(11,9,7,0.18)')
    grad.addColorStop(1, 'rgba(11,9,7,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 512, 512)
    this.backdropTex = new THREE.CanvasTexture(c)
    this.backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.7),
      new THREE.MeshBasicMaterial({
        map: this.backdropTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    )
    this.backdrop.renderOrder = 3
    this.backdrop.visible = false
    this.scene.add(this.backdrop)

    this.state = null
    this.activeId = null
    this.origin = new THREE.Vector3()
    this.baseScale = 1
    this.zoom = 1
    this.spin = 0
    this.autoSpin = true
    this.userRot = new THREE.Vector2(0, 0)
    this.src = null
  }

  get isOpen() {
    return !!this.activeId
  }

  open(id) {
    const src = this.models[id]
    if (!src) return false
    if (this.activeId === id) return true
    if (this.activeId) this.finishClose()

    const bbox = new THREE.Box3().setFromObject(src)
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())
    const cam = this.camera
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    const portrait = cam.aspect < 0.85
    const scale = clamp((portrait ? 0.38 : 0.44) / maxDim, 0.9, 2.4)

    const clone = src.clone(true)
    clone.position.sub(center)
    clone.visible = true
    this.pivot.add(clone)
    this.pivot.rotation.set(0, 0, 0)

    src.visible = false
    this.src = src
    this.activeId = id
    this.origin.copy(center)
    this.baseScale = scale
    this.zoom = 1
    this.spin = 0
    this.autoSpin = true
    this.userRot.set(0, 0)

    // 화면에서 원하는 위치(모바일은 패널 위쪽, 데스크톱은 패널 왼쪽)에 뜨도록
    // NDC 좌표를 3D 공간으로 되돌려 배치합니다. 카메라 각도와 무관하게 같은 자리에 옵니다.
    const dist = portrait ? 1.3 : 1.16
    const ndcPoint = new THREE.Vector3(portrait ? 0 : -0.06, portrait ? 0.55 : 0.04, 0.5).unproject(cam)
    const dirTo = ndcPoint.sub(cam.position).normalize()
    const to = cam.position.clone().addScaledVector(dirTo, dist)

    this.group.position.copy(center)
    this.group.scale.setScalar(1)
    this.group.visible = true
    this.backdrop.visible = false
    this.backdrop.material.opacity = 0
    this.state = {
      t: 0,
      duration: 0.95,
      from: center.clone(),
      to,
      s0: 1,
      s1: scale,
      closing: false,
    }
    return true
  }

  close() {
    if (!this.activeId || !this.state) return
    if (this.state.closing) return
    this.state = {
      t: 0,
      duration: 0.72,
      from: this.group.position.clone(),
      to: this.origin.clone(),
      s0: this.group.scale.x,
      s1: 1,
      closing: true,
    }
  }

  finishClose() {
    if (this.pivot.children.length) {
      for (const child of [...this.pivot.children]) this.pivot.remove(child)
    }
    if (this.src) this.src.visible = true
    this.group.visible = false
    this.backdrop.visible = false
    this.backdrop.material.opacity = 0
    this.activeId = null
    this.state = null
    this.src = null
    this.zoom = 1
  }

  rotateBy(dx, dy) {
    if (!this.activeId) return
    this.autoSpin = false
    this.userRot.y += dx * 0.012
    this.userRot.x = clamp(this.userRot.x + dy * 0.009, -0.55, 0.55)
  }

  zoomBy(factor) {
    if (!this.activeId) return
    this.zoom = clamp(this.zoom * factor, 0.55, 2.2)
  }

  update(dt) {
    if (!this.state) return
    const s = this.state
    s.t = Math.min(1, s.t + dt / s.duration)
    const e = easeOutCubic(s.t)
    this.group.position.lerpVectors(s.from, s.to, e)

    const base = s.s0 + (s.s1 - s.s0) * e
    const zoom = s.closing ? 1 : this.zoom
    this.group.scale.setScalar(base * zoom)

    if (!s.closing) {
      if (this.autoSpin) this.spin += dt * 0.42
      this.pivot.rotation.y = this.userRot.y + this.spin
      this.pivot.rotation.x = this.userRot.x
      this.backdrop.material.opacity = Math.min(1, s.t * 1.6)
    } else {
      this.backdrop.material.opacity = Math.max(0, 1 - s.t * 1.8)
    }

    // 비네트는 항상 카메라 쪽을 바라보며 상품 뒤에 놓입니다.
    const dir = new THREE.Vector3()
    this.camera.getWorldDirection(dir)
    this.backdrop.position.copy(this.group.position).addScaledVector(dir, 0.62)
    this.backdrop.quaternion.copy(this.camera.quaternion)

    if (s.t >= 1) {
      if (s.closing) this.finishClose()
      else this.state.t = 1
    }
  }
}
