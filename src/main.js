import './styles.css'
import * as THREE from 'three'
import { createStage } from './three/environment.js'
import { createMaterials } from './three/materials.js'
import { buildArchitecture } from './three/architecture.js'
import { buildFurniture } from './three/furniture.js'
import { buildProducts } from './three/models.js'
import { CameraRig } from './three/rig.js'
import { createUI } from './ui/ui.js'
import { createIntro } from './ui/intro.js'
import { ZONE_BY_ID, HOTSPOTS, productPose } from './three/layout.js'
import { products } from './config/products.js'
import { engraveTexture } from './three/textures.js'

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
  buildProducts(scene, M, register)
  mark('fixtures')

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
      g.add(halo)

      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(0.74, 48),
        new THREE.MeshBasicMaterial({ color: 0xc9a468, transparent: true, opacity: 0.07, depthWrite: false }),
      )
      glow.rotation.x = -Math.PI / 2
      glow.position.y = 0.01
      g.add(glow)

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 10), M.brass)
      stem.position.set(0, 0.3, -0.66)
      g.add(stem)

      const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.54, 0.168),
        new THREE.MeshStandardMaterial({
          map: engraveTexture(`${h.no}  ${h.name}`, 'TOUCH TO ENTER'),
          transparent: true,
          roughness: 0.5,
          metalness: 0.3,
          side: THREE.DoubleSide,
          envMapIntensity: 0.7,
        }),
      )
      plate.position.set(0, 0.56, -0.66)
      plate.rotation.x = -0.3
      plate.userData.pick = { kind: 'zone', id: h.id }
      g.add(plate)
      register(plate)

      g.position.set(h.at[0], 0, h.at[1])
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

  /* ---------------- 카메라 ---------------- */
  const rig = new CameraRig(camera, renderer.domElement)
  rig.setPose({ pos: [0.7, 2.6, 5.8], target: [-0.1, 1.5, -4.4] }, { instant: true })
  rig.setLimits(ZONE_BY_ID.lobby.limits)

  let currentZone = 'lobby'
  let entered = false

  /* ---------------- UI ---------------- */
  function goZone(id, { fromHotspot = false, keepPanel = false } = {}) {
    const zone = ZONE_BY_ID[id]
    if (!zone) return
    currentZone = id
    rig.setLimits(zone.limits)
    const portrait = camera.aspect < 0.8
    const pose = portrait && zone.mobile ? zone.mobile : zone.pose
    rig.setPose(pose, { duration: fromHotspot ? 1.35 : 1.7 })
    ui.setZone(id)
    if (!keepPanel && ui.isOpen()) ui.close(false)
  }

  function focusProduct(id) {
    const p = products.find((x) => x.id === id)
    if (!p) return
    rig.setLimits({ minDist: 0.45, maxDist: 2.2, minPitch: -0.15, maxPitch: 0.42, yawRange: 0.7 })
    rig.setPose(productPose(p, camera.aspect < 0.8 ? 'mobile' : 'desktop'), { duration: 1.3 })
    ui.openProduct(id)
    ui.setZone(p.zone)
    currentZone = p.zone
  }

  const ui = createUI({
    onZone: (id) => goZone(id),
    onPanelClose: (restore = true) => {
      if (!restore) return
      const z = ZONE_BY_ID[currentZone]
      if (z) {
        rig.setLimits(z.limits)
        rig.setPose(z.pose, { duration: 1.2 })
      }
    },
  })
  ui.setZone('lobby')
  if (partnerCode) ui.setPartner(partnerCode)

  intro.onEnter(() => {
    entered = true
    rig.setPose({ pos: [1.05, 2.8, 5.95], target: [0, 1.45, -4.2] }, { instant: true })
    goZone('lobby')
  })

  /* ---------------- 클릭 · 호버 ---------------- */
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let downAt = 0
  let downX = 0
  let downY = 0
  let hoverRaf = 0
  let lastHover = null

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

  renderer.domElement.addEventListener('pointerdown', (e) => {
    downAt = performance.now()
    downX = e.clientX
    downY = e.clientY
  })

  renderer.domElement.addEventListener('pointerup', (e) => {
    const dist = Math.hypot(e.clientX - downX, e.clientY - downY)
    const dt = performance.now() - downAt
    if (dist > 8 || dt > 850) return
    const pick = pickAt(e.clientX, e.clientY)
    if (!pick) return
    if (pick.kind === 'product') {
      focusProduct(pick.id)
    } else if (pick.kind === 'zone') {
      goZone(pick.id, { fromHotspot: true })
      if (pick.id === 'b2b') ui.openB2B(partnerCode)
    } else if (pick.kind === 'b2b') {
      goZone('b2b', { fromHotspot: true, keepPanel: true })
      ui.openB2B(partnerCode)
    }
  })

  renderer.domElement.addEventListener('pointermove', (e) => {
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
        } else if (pick.kind === 'b2b') {
          label = 'B2B 파트너 · 견적 상담'
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

  renderer.domElement.addEventListener('pointerleave', () => {
    ui.tip(null)
    lastHover = null
  })

  /* ---------------- 루프 ---------------- */
  const clock = new THREE.Clock()
  let elapsed = 0

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.06)
    elapsed += dt
    rig.update(dt)

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
  tick()

  window.__SHOWROOM__ = {
    goZone,
    focusProduct,
    rig,
    camera,
    scene,
    renderer,
    products,
    errors: () => window.__SHOWROOM_ERRORS__,
  }
}

boot().catch((err) => {
  console.error('showroom boot failed', err && err.stack ? err.stack : err)
  const bootEl = document.getElementById('boot')
  if (bootEl) bootEl.querySelector('.boot-note').textContent = '쇼룸을 여는 중 문제가 생겼습니다. 새로 고침해 주세요.'
})
