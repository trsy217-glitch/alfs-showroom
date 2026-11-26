import './styles.css'
import * as THREE from 'three'
import { createStage } from './three/environment.js'
import { createMaterials } from './three/materials.js'
import { buildArchitecture } from './three/architecture.js'
import { buildFurniture } from './three/furniture.js'
import { buildProducts } from './three/models.js'
import { buildStaff } from './three/staff.js'
import { CameraRig, CAMERA_BOUNDS } from './three/rig.js'
import { ProductInspector } from './three/inspector.js'
import { createUI } from './ui/ui.js'
import { createIntro } from './ui/intro.js'
import { ZONE_BY_ID, HOTSPOTS } from './three/layout.js'
import { products } from './config/products.js'
import { engraveTexture } from './three/textures.js'

const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const params = new URLSearchParams(window.location.search)
const partnerCode = (params.get('p') || '').trim()
const qualityParam = (params.get('q') || '').trim()

/* ------------------------------------------------------------------ */
/* 글꼴 — 라벨 텍스처를 그리기 전에 먼저 준비합니다.                    */
/* ------------------------------------------------------------------ */
async function loadFonts() {
  const specs = [
    ['ALFSerif', '/fonts/alf-serif.woff2'],
    ['ALFSans', '/fonts/alf-sans.woff2'],
  ]
  try {
    const faces = specs.map(
      ([family, url]) => new FontFace(family, `url(${url})`, { weight: '100 900', display: 'swap' }),
    )
    const loaded = await Promise.all(faces.map((f) => f.load()))
    loaded.forEach((f) => document.fonts.add(f))
    await document.fonts.ready
  } catch (err) {
    console.warn('글꼴을 불러오지 못해 시스템 글꼴로 그립니다.', err && err.message)
  }
}

async function boot() {
  const timing = []
  const mark = (name) => timing.push([name, Math.round(performance.now())])
  mark('boot')

  // 인트로를 먼저 띄워 기다림을 줄입니다.
  const intro = createIntro()
  const bootEl = document.getElementById('boot')
  if (bootEl) {
    bootEl.classList.add('gone')
    setTimeout(() => bootEl.remove(), 900)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  mark('intro')

  const container = document.getElementById('stage')
  const stage = createStage(container, { quality: qualityParam || undefined })
  const { renderer, scene, camera } = stage
  mark('stage')

  await loadFonts()
  mark('fonts')

  const M = createMaterials(renderer)
  mark('materials')
  buildArchitecture(scene, M)
  mark('architecture')

  const pickables = []
  const register = (m) => pickables.push(m)

  buildFurniture(scene, M, { register })
  const productBuild = buildProducts(scene, M, register)
  const staff = buildStaff(scene, M, { register })
  const staffModels = staff.root.children.filter((c) => c.type === 'Group' && c.userData.baseRy !== undefined)
  mark('fixtures')

  const inspector = new ProductInspector({ scene, camera, models: productBuild.models })

  /* ---------------- 바닥 핫스팟 ---------------- */
  const hotspotRings = []
  {
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc9a468,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    })
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xe6c489,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    })
    for (const h of HOTSPOTS) {
      const g = new THREE.Group()
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.52, 0.56, 64), ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.014
      ring.userData.pick = { kind: 'zone', id: h.id }
      g.add(ring)
      register(ring)

      const halo = new THREE.Mesh(new THREE.RingGeometry(0.56, 0.74, 64), haloMat.clone())
      halo.rotation.x = -Math.PI / 2
      halo.position.y = 0.012
      halo.userData.pick = { kind: 'zone', id: h.id }
      g.add(halo)
      register(halo)

      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(0.74, 48),
        new THREE.MeshBasicMaterial({ color: 0xc9a468, transparent: true, opacity: 0.07, depthWrite: false }),
      )
      glow.rotation.x = -Math.PI / 2
      glow.position.y = 0.01
      glow.userData.pick = { kind: 'zone', id: h.id }
      g.add(glow)
      register(glow)

      // 보이지 않는 넉넉한 터치 판 — 발광면 어디를 눌러도 존으로 들어갑니다.
      const hit = new THREE.Mesh(new THREE.CircleGeometry(1.05, 40), new THREE.MeshBasicMaterial({ color: 0xc9a468 }))
      hit.rotation.x = -Math.PI / 2
      hit.position.y = 0.02
      hit.visible = false
      hit.userData.pick = { kind: 'zone', id: h.id }
      g.add(hit)
      register(hit)

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 10), M.brass)
      stem.position.set(0, 0.3, -0.66)
      g.add(stem)

      const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 0.193),
        new THREE.MeshStandardMaterial({
          map: engraveTexture(`${h.no}  ${h.name}`, 'TOUCH TO ENTER'),
          transparent: true,
          roughness: 0.42,
          metalness: 0.35,
          emissive: 0x1a1208,
          emissiveIntensity: 0.5,
          side: THREE.DoubleSide,
          envMapIntensity: 1.1,
        }),
      )
      plate.position.set(0, 0.58, -0.7)
      plate.rotation.x = -0.3
      plate.userData.pick = { kind: 'zone', id: h.id }
      g.add(plate)
      register(plate)

      g.position.set(h.at[0], 0, h.at[1])
      g.userData.zone = h.id
      g.userData.halo = halo
      g.userData.ring = ring
      scene.add(g)
      hotspotRings.push(g)
    }
  }

  /* ---------------- 금빛 먼지 ---------------- */
  let dust = null
  {
    const N = 150
    const pos = new Float32Array(N * 3)
    const vel = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = 0.2 + Math.random() * 4.2
      pos[i * 3 + 2] = -11 + Math.random() * 20
      vel[i] = 0.02 + Math.random() * 0.05
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffd9a2,
      size: 0.011,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geo, mat)
    points.frustumCulled = false
    scene.add(points)
    dust = { points, pos, vel, geo }
  }

  /* ---------------- 바닥 터치 목적지 링 ---------------- */
  const destination = (() => {
    const group = new THREE.Group()
    group.visible = false
    group.renderOrder = 2
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe8c88f,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.39, 64), ringMat)
    ring.rotation.x = -Math.PI / 2
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffe3b0,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const core = new THREE.Mesh(new THREE.CircleGeometry(0.27, 48), coreMat)
    core.rotation.x = -Math.PI / 2
    group.add(ring, core)
    scene.add(group)
    return {
      group,
      duration: 1.9,
      t: 0,
      active: false,
      show(x, z) {
        group.position.set(x, 0.022, z)
        group.visible = true
        this.t = 0
        this.active = true
      },
      hide() {
        this.active = false
        group.visible = false
      },
      update(dt) {
        if (!this.active) return
        this.t += dt
        const k = Math.min(1, this.t / this.duration)
        group.scale.setScalar(0.72 + k * 0.5)
        const fade = k < 0.22 ? k / 0.22 : 1 - (k - 0.22) / 0.78
        ringMat.opacity = Math.max(0, fade)
        coreMat.opacity = 0.09 * Math.max(0, fade)
        if (k >= 1) this.hide()
      },
    }
  })()

  /* ---------------- 카메라 ---------------- */
  const rig = new CameraRig(camera, renderer.domElement)
  rig.setPose({ pos: [0.7, 2.6, 5.4], target: [-0.1, 1.5, -4.4] }, { instant: true })
  rig.setLimits(ZONE_BY_ID.lobby.limits)

  // 자유 이동(산책) 충돌 범위 — 벽에서 1m 안쪽, 큰 집기만 부드럽게 피해 갑니다.
  rig.setWalkBounds(
    CAMERA_BOUNDS,
    [
      { x: -5.5, z: -4.9, r: 0.95 },
      { x: 5.12, z: -6.5, r: 0.85 },
      { x: 5.12, z: -5.75, r: 0.75 },
      { x: 5.12, z: -5.0, r: 0.8 },
      { x: 5.12, z: -4.4, r: 0.7 },
      { x: 3.35, z: -0.25, r: 1.2 },
      { x: -1.25, z: -0.95, r: 1.0 },
      { x: -2.0, z: 3.9, r: 0.7 },
      { x: 2.05, z: 4.55, r: 0.95 },
      { x: -3.55, z: -6.5, r: 1.0 },
      { x: 0, z: -7.8, r: 1.25 },
    ],
  )

  let currentZone = 'lobby'
  let walkMode = false
  let entered = false

  /* ---------------- UI ---------------- */
  function exitWalk() {
    if (!walkMode) return
    walkMode = false
    rig.setWalk(false)
    ui.setWalkUI(false)
  }

  function enterWalk() {
    if (walkMode || !entered || inspector.isOpen) return
    walkMode = true
    rig.setWalk(true)
    ui.setWalkUI(true)
  }

  function showZoneHotspots(id) {
    for (const g of hotspotRings) g.visible = g.userData.zone !== id
  }

  function goZone(id, { fromHotspot = false, keepPanel = false } = {}) {
    const zone = ZONE_BY_ID[id]
    if (!zone) return
    exitWalk()
    closeInspect()
    if (rig.enabled === false) rig.enabled = true
    currentZone = id
    rig.setLimits(zone.limits)
    const portrait = camera.aspect < 0.8
    const pose = portrait && zone.mobile ? zone.mobile : zone.pose
    rig.setPose(pose, { duration: fromHotspot ? 1.35 : 1.7 })
    ui.setZone(id)
    showZoneHotspots(id)
    if (!keepPanel && ui.isOpen()) ui.close(false)
  }

  function closeInspect() {
    if (inspector.isOpen) inspector.close()
    rig.enabled = true
  }

  function inspectProduct(id) {
    const p = products.find((x) => x.id === id)
    if (!p) return
    exitWalk()
    for (const g of hotspotRings) g.visible = false
    rig.enabled = false
    inspector.open(id)
    ui.tip(null)
    ui.openInspect(id)
    ui.setZone(p.zone)
  }

  const ui = createUI({
    onZone: (id) => goZone(id),
    onPartnerShop: () => {
      goZone('b2b', { keepPanel: true })
      ui.openB2B(partnerCode)
    },
    onOpenProduct: (id) => inspectProduct(id),
    onPanelClose: (restore, mode) => {
      if (mode === 'inspect') {
        inspector.close()
        rig.enabled = true
        showZoneHotspots(currentZone)
        if (restore) {
          const z = ZONE_BY_ID[currentZone]
          if (z) {
            rig.setLimits(z.limits)
            rig.setPose(camera.aspect < 0.8 && z.mobile ? z.mobile : z.pose, { duration: 1.1 })
          }
        }
        return
      }
      if (!restore) return
      const z = ZONE_BY_ID[currentZone]
      if (z) {
        rig.setLimits(z.limits)
        rig.setPose(camera.aspect < 0.8 && z.mobile ? z.mobile : z.pose, { duration: 1.2 })
      }
    },
  })
  ui.setZone('lobby')
  if (partnerCode) ui.setPartner(partnerCode)

  intro.onEnter(() => {
    entered = true
    rig.setPose({ pos: [1.05, 2.7, 5.42], target: [0, 1.45, -4.2] }, { instant: true })
    goZone('lobby')
    if (!hasHover) ui.showTouchHint()
  })

  /* ---------------- 키보드 · 이동 ---------------- */
  const keys = new Set()
  const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'e']
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase()
    if (!MOVE_KEYS.includes(k)) return
    const tag = e.target && e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    keys.add(k)
    enterWalk()
    e.preventDefault()
  })
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()))
  window.addEventListener('blur', () => keys.clear())

  ui.rail.forEach((b) => {
    // 레일에서 존을 고르면 산책 모드를 나갑니다 (goZone 이 처리).
    b.addEventListener('click', () => keys.clear())
  })

  /* ---------------- 클릭 · 호버 ---------------- */
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let downAt = 0
  let downX = 0
  let downY = 0
  let gesturePointers = 0
  let tapOk = false
  let hoverRaf = 0
  let lastHover = null
  let inspectingDrag = false
  let lastInspect = { x: 0, y: 0 }
  const inspectPointers = new Map()
  let inspectPinch = 0

  function pickAt(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect()
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObjects(pickables, false)
    for (const hit of hits) {
      if (hit.object.userData.pick) return hit.object.userData.pick
    }
    return null
  }

  // 화면 좌표 → 바닥(y=0) 위의 지점. 쇼룸 밖을 가리키면 null.
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const floorHit = new THREE.Vector3()
  function floorPointAt(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect()
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(ndc, camera)
    if (!raycaster.ray.intersectPlane(floorPlane, floorHit)) return null
    const b = rig.bounds
    if (floorHit.x < b.minX - 2 || floorHit.x > b.maxX + 2) return null
    if (floorHit.z < b.minZ - 2 || floorHit.z > b.maxZ + 2) return null
    return { x: floorHit.x, z: floorHit.z }
  }

  renderer.domElement.addEventListener('pointerdown', (e) => {
    gesturePointers += 1
    if (gesturePointers === 1) {
      downAt = performance.now()
      downX = e.clientX
      downY = e.clientY
      tapOk = true
    } else {
      tapOk = false // 두 손가락 이상은 탭이 아닙니다
    }
    if (inspector.isOpen) {
      inspectPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (inspectPointers.size === 1) {
        inspectingDrag = true
        lastInspect = { x: e.clientX, y: e.clientY }
      } else if (inspectPointers.size === 2) {
        inspectingDrag = false
        const [a, b] = [...inspectPointers.values()]
        inspectPinch = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
  })

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (inspector.isOpen) {
      if (inspectPointers.has(e.pointerId)) inspectPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (inspectPointers.size === 2) {
        const [a, b] = [...inspectPointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (inspectPinch > 4 && d > 4) inspector.zoomBy(d / inspectPinch)
        inspectPinch = d
        return
      }
      if (inspectingDrag || e.buttons) {
        const dx = e.clientX - lastInspect.x
        const dy = e.clientY - lastInspect.y
        lastInspect = { x: e.clientX, y: e.clientY }
        inspector.rotateBy(dx, dy)
      }
      return
    }
    if (!hasHover) return
    if (rig.dragging) {
      if (lastHover) {
        ui.tip(null)
        lastHover = null
      }
      return
    }
    if (hoverRaf) return
    const cx = e.clientX
    const cy = e.clientY
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0
      if (inspector.isOpen) {
        ui.tip(null)
        return
      }
      const pick = pickAt(cx, cy)
      const canvas = renderer.domElement
      if (pick) {
        canvas.style.cursor = 'pointer'
        let label = null
        if (pick.kind === 'product') {
          const p = products.find((x) => x.id === pick.id)
          label = p ? `${p.name} · ${p.price.toLocaleString('ko-KR')}원` : null
        } else if (pick.kind === 'zone') {
          const z = ZONE_BY_ID[pick.id]
          label = z ? `${z.no}. ${z.name}` : null
        } else if (pick.kind === 'routine') {
          label = '나의 건강최적 루틴관리 시스템 · 눌러서 보기'
        } else if (pick.kind === 'b2b') {
          label = 'B2B 파트너 · 견적 상담'
        } else if (pick.kind === 'staff') {
          const z = ZONE_BY_ID[pick.id]
          label = z ? `${z.name} 전담 매니저 · 눌러서 상담` : '전담 매니저 · 눌러서 상담'
        }
        ui.tip(label, cx, cy)
        lastHover = pick
      } else {
        canvas.style.cursor = 'grab'
        if (lastHover) {
          ui.tip(null)
          lastHover = null
        }
      }
    })
  })

  renderer.domElement.addEventListener('pointerup', (e) => {
    inspectPointers.delete(e.pointerId)
    if (inspectPointers.size < 2) inspectPinch = 0
    if (inspectPointers.size === 0) inspectingDrag = false
    gesturePointers = Math.max(0, gesturePointers - 1)
    const isTap = tapOk
    if (gesturePointers === 0) tapOk = false
    const dist = Math.hypot(e.clientX - downX, e.clientY - downY)
    const dt = performance.now() - downAt
    if (!isTap || dist > 10 || dt > 900) return
    if (inspector.isOpen) return
    if (!entered) return
    const pick = pickAt(e.clientX, e.clientY)
    if (!pick) {
      // 바닥을 누르면 그 지점까지 걸어서 이동합니다.
      if (ui.isOpen()) return
      const pt = floorPointAt(e.clientX, e.clientY)
      if (!pt) return
      enterWalk()
      rig.glideTo(pt)
      destination.show(rig.goalPos.x, rig.goalPos.z)
      return
    }
    if (pick.kind === 'product') {
      inspectProduct(pick.id)
    } else if (pick.kind === 'staff') {
      ui.tip(null)
      goZone(pick.id, { fromHotspot: true, keepPanel: true })
      ui.openStaffChat(pick.id)
    } else if (pick.kind === 'routine') {
      ui.tip(null)
      goZone('routine', { fromHotspot: true, keepPanel: true })
      ui.openRoutine()
    } else if (pick.kind === 'zone') {
      ui.tip(null)
      goZone(pick.id, { fromHotspot: true })
      if (pick.id === 'b2b') ui.openB2B(partnerCode)
    } else if (pick.kind === 'b2b') {
      goZone('b2b', { fromHotspot: true, keepPanel: true })
      ui.openB2B(partnerCode)
    }
  })

  renderer.domElement.addEventListener(
    'wheel',
    (e) => {
      if (!inspector.isOpen) return
      e.preventDefault()
      inspector.zoomBy(Math.exp(-e.deltaY * 0.0012))
    },
    { passive: false },
  )

  renderer.domElement.addEventListener('pointercancel', (e) => {
    inspectPointers.delete(e.pointerId)
    if (inspectPointers.size < 2) inspectPinch = 0
    gesturePointers = Math.max(0, gesturePointers - 1)
    if (gesturePointers === 0) tapOk = false
  })

  renderer.domElement.addEventListener('pointerleave', () => {
    ui.tip(null)
    lastHover = null
    inspectingDrag = false
    inspectPointers.clear()
    inspectPinch = 0
  })

  /* ---------------- 루프 ---------------- */
  const clock = new THREE.Clock()
  let elapsed = 0
  const SPEED = 2.4
  const TURN = 1.6

  let warmFrames = 0
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.06)
    elapsed += dt

    // 이동 입력 (키보드 — 화면 방향키 없이도 동작)
    if (walkMode && !inspector.isOpen) {
      const fwd =
        (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0)
      const strafe = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0)
      const turn = (keys.has('q') || keys.has('arrowleft') ? 1 : 0) - (keys.has('e') || keys.has('arrowright') ? 1 : 0)
      if (fwd || strafe) rig.moveBy(fwd * SPEED * dt, strafe * SPEED * dt)
      if (turn) rig.turnBy(turn * TURN * dt)
    }

    if (warmFrames < 3) {
      renderer.shadowMap.needsUpdate = true
      warmFrames += 1
    }
    rig.update(dt)
    inspector.update(dt)
    destination.update(dt)

    for (let i = 0; i < staffModels.length; i++) {
      const m = staffModels[i]
      m.position.y = Math.sin(elapsed * 0.8 + i * 1.7) * 0.0035
      m.rotation.y = m.userData.baseRy + Math.sin(elapsed * 0.45 + i * 2.1) * 0.01
    }

    for (let i = 0; i < hotspotRings.length; i++) {
      const g = hotspotRings[i]
      const t = elapsed * 1.1 + i * 2.1
      g.userData.ring.scale.setScalar(1 + Math.sin(t) * 0.035)
      g.userData.halo.material.opacity = 0.1 + (Math.sin(t) * 0.5 + 0.5) * 0.14
    }

    if (dust) {
      const p = dust.pos
      for (let i = 0; i < dust.vel.length; i++) {
        p[i * 3 + 1] += dust.vel[i] * dt
        p[i * 3] += Math.sin(elapsed * 0.4 + i) * 0.0006
        if (p[i * 3 + 1] > 4.5) p[i * 3 + 1] = 0.15
      }
      dust.geo.attributes.position.needsUpdate = true
    }

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
  }

  window.addEventListener('resize', () => stage.resize())

  if (renderer.compileAsync) {
    try {
      await renderer.compileAsync(scene, camera)
    } catch (err) {
      console.warn('compileAsync skipped', err && err.message)
    }
  }
  mark('compiled')
  renderer.render(scene, camera)
  mark('first-render')
  timing.push(['programs', renderer.info.programs ? renderer.info.programs.length : -1])
  timing.push(['quality', stage.quality])
  window.__SHOWROOM_TIMING__ = timing
  window.__SHOWROOM_READY__ = true
  intro.setReady()
  // 첫 프레임에서 그림자를 한 번 더 확실히 굽습니다 (정적 씬 — 이후 갱신 없음)
  renderer.shadowMap.needsUpdate = true
  tick()

  window.__SHOWROOM__ = {
    goZone,
    inspectProduct,
    ui,
    rig,
    inspector,
    camera,
    scene,
    renderer,
    products,
    staff: staff.root,
    walk: () => walkMode,
    destination,
    errors: () => window.__SHOWROOM_ERRORS__,
  }
}

boot().catch((err) => {
  console.error('showroom boot failed', err && err.stack ? err.stack : err)
  const bootEl = document.getElementById('boot')
  if (bootEl) bootEl.querySelector('.boot-note').textContent = '쇼룸을 여는 중 문제가 생겼습니다. 새로 고침해 주세요.'
})
