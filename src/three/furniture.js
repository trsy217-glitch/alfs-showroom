import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { FIXTURE } from './layout.js'
import { engraveTexture, b2bBoardTexture, artTexture, routineBoardTexture } from './textures.js'

function rbox(w, h, d, r, mat) {
  const g = new RoundedBoxGeometry(w, h, d, 3, r)
  const m = new THREE.Mesh(g, mat)
  m.castShadow = true
  m.receiveShadow = true
  return m
}
function shadowPlane(M, w, d, opacity = 0.5) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.shadow.clone())
  m.material.opacity = opacity
  m.rotation.x = -Math.PI / 2
  m.position.y = 0.006
  m.renderOrder = 1
  return m
}
function circleShadow(M, r, opacity = 0.5) {
  return shadowPlane(M, r * 2, r * 2, opacity)
}

/* ---------- 소품 ---------- */
function vase(M, scale = 1, mat = M.ceramic) {
  const pts = [
    [0, 0],
    [0.09, 0],
    [0.115, 0.05],
    [0.135, 0.16],
    [0.125, 0.3],
    [0.085, 0.42],
    [0.06, 0.5],
    [0.058, 0.56],
  ].map(([x, y]) => [x * scale, y * scale])
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 48), mat)
  body.castShadow = true
  body.receiveShadow = true
  g.add(body)
  return g
}

function pampas(M, scale = 1) {
  const g = new THREE.Group()
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xd8c4a2, roughness: 1, metalness: 0 })
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + i * 0.7
    const lean = 0.14 + (i % 3) * 0.08
    const height = (0.85 + (i % 4) * 0.14) * scale
    const pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(a) * lean * 0.5, height * 0.45, Math.sin(a) * lean * 0.5),
      new THREE.Vector3(Math.cos(a) * lean, height * 0.82, Math.sin(a) * lean),
      new THREE.Vector3(Math.cos(a) * lean * 1.35, height, Math.sin(a) * lean * 1.35),
    ]
    const curve = new THREE.CatmullRomCurve3(pts)
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.006 * scale, 6, false), M.stem)
    g.add(stem)
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 12), hairMat)
    tuft.scale.set(0.032 * scale, 0.16 * scale, 0.032 * scale)
    tuft.position.copy(pts[3])
    tuft.castShadow = false
    g.add(tuft)
  }
  return g
}

function cleanBottle(M) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.12, 24),
    new THREE.MeshPhysicalMaterial({ color: 0xe9dcc4, roughness: 0.3, clearcoat: 0.6, envMapIntensity: 0.8 }),
  )
  body.position.y = 0.06
  body.castShadow = true
  g.add(body)
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 16), M.brass)
  cap.position.y = 0.13
  g.add(cap)
  return g
}

function brassTray(M, r) {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 48), M.brass)
  base.receiveShadow = true
  g.add(base)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 48), M.brass)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.012
  g.add(rim)
  return g
}

function chair(M) {
  const g = new THREE.Group()
  const seat = rbox(0.46, 0.1, 0.46, 0.035, M.linen)
  seat.position.y = 0.44
  g.add(seat)
  const back = rbox(0.46, 0.44, 0.09, 0.035, M.linen)
  back.position.set(0, 0.68, -0.19)
  back.rotation.x = -0.12
  g.add(back)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.44, 12), M.brass)
      leg.position.set(sx * 0.18, 0.22, sz * 0.18)
      leg.castShadow = true
      g.add(leg)
    }
  }
  return g
}

function pendant(M, radius, drop) {
  const g = new THREE.Group()
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, drop, 10), M.brass)
  rod.position.y = -drop / 2
  g.add(rod)
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24), M.brass)
  canopy.position.y = 0
  g.add(canopy)
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.4, radius, 0.26, 40, 1, true), M.brass)
  shade.position.y = -drop - 0.13
  g.add(shade)
  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.93, 40),
    new THREE.MeshBasicMaterial({ color: 0xffe9c6 }),
  )
  inner.rotation.x = Math.PI / 2
  inner.position.y = -drop - 0.24
  g.add(inner)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), M.glow)
  bulb.position.y = -drop - 0.05
  g.add(bulb)
  return g
}

export function buildFurniture(scene, M, { register } = {}) {
  const root = new THREE.Group()
  const pickables = []
  const lights = []

  /* ---------- 02 오륜미네랄 연단 ---------- */
  {
    const [x, z] = FIXTURE.mineralPlinth
    const g = new THREE.Group()
    const base = rbox(0.62, 0.02, 0.62, 0.01, M.brassDark)
    base.position.y = 0.01
    const body = rbox(0.54, 0.78, 0.54, 0.015, M.stone)
    body.position.y = 0.41
    const trim = rbox(0.6, 0.02, 0.6, 0.006, M.brass)
    trim.position.y = 0.815
    const top = rbox(0.56, 0.05, 0.56, 0.008, M.stone)
    top.position.y = 0.85
    g.add(base, body, trim, top)

    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.094),
      new THREE.MeshStandardMaterial({ map: engraveTexture('오륜미네랄', '1,000ml', true), roughness: 0.5, metalness: 0.2, envMapIntensity: 1.1 }),
    )
    plaque.position.set(0, 0.6, 0.276)
    g.add(plaque)

    const sh = circleShadow(M, 0.6, 0.55)
    sh.position.set(x, 0.006, z)
    root.add(sh)
    g.position.set(x, 0, z)
    root.add(g)
  }

  /* ---------- 03 효소세상 콘솔 ---------- */
  {
    const [x, z] = FIXTURE.enzymeConsole
    const g = new THREE.Group()
    const top = rbox(0.44, 0.055, 3.05, 0.012, M.walnutLong)
    top.position.set(0, 0.925, 0)
    g.add(top)
    for (const sz of [-1.42, 1.42]) {
      for (const sx of [-0.15, 0.15]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.9, 12), M.brass)
        leg.position.set(sx, 0.45, sz)
        leg.castShadow = true
        g.add(leg)
      }
    }
    // 얇은 황동 레일
    const railBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 2.84), M.brass)
    railBar.position.set(-0.2, 0.28, 0)
    g.add(railBar)
    const railBack = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 2.84), M.brass)
    railBack.position.set(0.2, 0.28, 0)
    g.add(railBack)

    // 유리 받침
    const risers = [
      { z: -6.5 - z, h: 0.14, r: 0.13 },
      { z: -5.75 - z, h: 0.1, r: 0.12 },
      { z: -5.0 - z, h: 0.08, r: 0.15 },
      { z: -4.4 - z, h: 0.16, r: 0.09 },
    ]
    for (const r of risers) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r.r, r.r, r.h, 40), M.frost)
      m.position.set(0, 0.955 + r.h / 2, r.z)
      m.castShadow = false
      g.add(m)
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(r.r * 0.85, 32),
        new THREE.MeshBasicMaterial({ color: 0xffe4bc, transparent: true, opacity: 0.35, depthWrite: false }),
      )
      glow.rotation.x = -Math.PI / 2
      glow.position.set(0, 0.952, r.z)
      g.add(glow)
    }

    const sh = shadowPlane(M, 0.9, 3.2, 0.5)
    sh.position.set(x + 0.03, 0.006, z)
    root.add(sh)
    g.position.set(x, 0, z)
    root.add(g)
  }

  /* ---------- 04 B2B 라운지 ---------- */
  {
    const [tx, tz] = FIXTURE.partnerTable
    // 러그
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.72, 64), M.linen.clone())
    rug.material.color = new THREE.Color(0xcbb894)
    rug.rotation.x = -Math.PI / 2
    rug.position.set(tx, 0.008, tz)
    rug.receiveShadow = true
    root.add(rug)


    const g = new THREE.Group()
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.075, 64), M.walnut)
    top.scale.z = 0.66
    top.position.y = 0.735
    top.castShadow = true
    top.receiveShadow = true
    g.add(top)
    const inlay = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.008, 8, 80), M.brass)
    inlay.rotation.x = Math.PI / 2
    inlay.scale.y = 0.66
    inlay.position.y = 0.775
    g.add(inlay)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.66, 24), M.brassDark)
    stem.position.y = 0.36
    stem.castShadow = true
    g.add(stem)
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.035, 48), M.stoneDark)
    foot.position.y = 0.018
    foot.castShadow = true
    foot.receiveShadow = true
    g.add(foot)

    // 테이블 위 소품
    const tray = brassTray(M, 0.19)
    tray.position.set(-0.28, 0.778, 0.12)
    g.add(tray)
    const b1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.16, 24),
      new THREE.MeshPhysicalMaterial({ color: 0xd9c5a4, roughness: 0.28, clearcoat: 0.8 }),
    )
    b1.position.set(-0.33, 0.86, 0.1)
    b1.castShadow = true
    g.add(b1)
    const b2 = b1.clone()
    b2.position.set(-0.22, 0.86, 0.16)
    g.add(b2)

    const folder = rbox(0.3, 0.018, 0.22, 0.004, M.linen)
    folder.position.set(0.24, 0.79, -0.06)
    folder.rotation.y = 0.22
    g.add(folder)
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(0.19, 0.26),
      new THREE.MeshStandardMaterial({ map: artTexture(), roughness: 0.9 }),
    )
    card.rotation.x = -Math.PI / 2
    card.rotation.z = 0.2
    card.position.set(0.22, 0.802, 0.18)
    g.add(card)

    g.position.set(tx, 0, tz)
    root.add(g)

    const sh = circleShadow(M, 1.25, 0.5)
    sh.scale.set(1, 0.7, 1)
    sh.position.set(tx, 0.005, tz)
    root.add(sh)

    const seats = [
      [tx - 0.15, tz - 1.5],
      [tx - 1.5, tz - 0.15],
      [tx + 1.35, tz - 0.95],
    ]
    for (const [x, z] of seats) {
      const c = chair(M)
      c.position.set(x, 0, z)
      // 좌판(+Z)이 항상 테이블 중심을 향하도록 — 등받이는 바깥쪽
      c.rotation.y = Math.atan2(tx - x, tz - z)
      root.add(c)
      const s = circleShadow(M, 0.42, 0.42)
      s.position.set(x, 0.005, z)
      root.add(s)
    }
  }

  /* ---------- 센터 테이블 ---------- */
  {
    const [x, z] = FIXTURE.centerTable
    const g = new THREE.Group()
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.075, 64), M.stone)
    top.scale.z = 0.48
    top.position.y = 0.4
    top.castShadow = true
    top.receiveShadow = true
    g.add(top)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.009, 8, 80), M.brass)
    rim.rotation.x = Math.PI / 2
    rim.scale.y = 0.48
    rim.position.y = 0.44
    g.add(rim)
    for (const sx of [-0.55, 0.55]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.024, 0.37, 16), M.brassDark)
      leg.position.set(sx, 0.185, 0)
      leg.castShadow = true
      g.add(leg)
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.025, 0.03), M.brassDark)
    bar.position.y = 0.1
    g.add(bar)

    // 소품
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.6), M.ceramicDark)
    bowl.rotation.x = Math.PI
    bowl.position.set(-0.42, 0.56, 0.06)
    bowl.castShadow = true
    g.add(bowl)

    const stack = rbox(0.34, 0.05, 0.26, 0.004, M.linen)
    stack.position.set(0.32, 0.465, -0.05)
    stack.rotation.y = 0.16
    g.add(stack)
    const stack2 = rbox(0.3, 0.04, 0.23, 0.004, M.stoneDark)
    stack2.position.set(0.33, 0.51, -0.04)
    stack2.rotation.y = 0.1
    g.add(stack2)

    const tray = brassTray(M, 0.15)
    tray.position.set(0.62, 0.44, 0.16)
    g.add(tray)
    for (let i = 0; i < 3; i++) {
      const b = cleanBottle(M)
      b.position.set(0.56 + i * 0.06, 0.45, 0.15 + (i % 2) * 0.03)
      g.add(b)
    }

    const v = vase(M, 1.15)
    v.position.set(-0.05, 0.44, -0.12)
    g.add(v)
    const p = pampas(M, 0.75)
    p.position.set(-0.05, 0.44 + 1.15 * 0.56, -0.12)
    g.add(p)

    g.position.set(x, 0, z)
    root.add(g)
    const sh = circleShadow(M, 1.0, 0.4)
    sh.scale.set(1, 0.55, 1)
    sh.position.set(x, 0.005, z)
    root.add(sh)
  }

  /* ---------- 로비 ---------- */
  {
    const [x, z] = FIXTURE.lobbyPedestal
    const g = new THREE.Group()
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.46, 0.035, 48), M.brassDark)
    base.position.y = 0.017
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.95, 48), M.stone)
    col.position.y = 0.5
    col.castShadow = true
    col.receiveShadow = true
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.035, 48), M.brass)
    top.position.y = 0.99
    g.add(base, col, top)

    const v = vase(M, 1.5)
    v.position.y = 1.006
    g.add(v)
    const p = pampas(M, 1.15)
    p.position.y = 1.55
    g.add(p)

    g.position.set(x, 0, z)
    root.add(g)
    const sh = circleShadow(M, 0.62, 0.5)
    sh.position.set(x, 0.005, z)
    root.add(sh)
  }

  {
    const [x, z] = FIXTURE.bench
    const g = new THREE.Group()
    const seat = rbox(1.7, 0.16, 0.52, 0.04, M.linen)
    seat.position.y = 0.42
    g.add(seat)
    const frame = rbox(1.66, 0.03, 0.48, 0.01, M.brassDark)
    frame.position.y = 0.33
    g.add(frame)
    for (const sx of [-0.74, 0.74]) {
      for (const sz of [-0.18, 0.18]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.33, 10), M.brass)
        leg.position.set(sx, 0.165, sz)
        leg.castShadow = true
        g.add(leg)
      }
    }
    // 접힌 담요
    const throwB = rbox(0.5, 0.06, 0.4, 0.025, M.linen)
    throwB.material = M.linen.clone()
    throwB.material.color = new THREE.Color(0xcdbb9d)
    throwB.position.set(0.42, 0.53, 0.02)
    throwB.rotation.y = 0.12
    g.add(throwB)
    g.position.set(x, 0, z)
    root.add(g)
    const sh = shadowPlane(M, 1.9, 0.7, 0.45)
    sh.position.set(x, 0.005, z)
    root.add(sh)
  }

  /* ---------- 안쪽 브랜드 월 벤치 ---------- */
  {
    const [x, z] = FIXTURE.brandBench
    const g = new THREE.Group()
    const seat = rbox(2.1, 0.34, 0.5, 0.02, M.stone)
    seat.position.y = 0.17
    g.add(seat)
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), M.ceramicDark)
    bowl.rotation.x = Math.PI
    bowl.position.set(-0.5, 0.42, 0)
    bowl.castShadow = true
    g.add(bowl)
    const v = vase(M, 0.8)
    v.position.set(0.62, 0.34, 0)
    g.add(v)
    g.position.set(x, 0, z)
    root.add(g)
    const sh = shadowPlane(M, 2.3, 0.7, 0.45)
    sh.position.set(x, 0.005, z)
    root.add(sh)
  }

  /* ---------- 왼쪽 두 번째 벽감: 아트 패널 ---------- */
  {
    const g = new THREE.Group()
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 1.8),
      new THREE.MeshStandardMaterial({ map: artTexture(), roughness: 0.88, metalness: 0 }),
    )
    art.rotation.y = Math.PI / 2
    art.position.set(-6.16, 2.0, 1.5)
    root.add(art)
    const frameMat = M.brass
    const bars = [
      [0.04, 1.9, 0.06, -6.14, 2.0, 1.5 - 0.7],
      [0.04, 1.9, 0.06, -6.14, 2.0, 1.5 + 0.7],
      [0.04, 0.06, 1.46, -6.14, 2.0 - 0.92, 1.5],
      [0.04, 0.06, 1.46, -6.14, 2.0 + 0.92, 1.5],
    ]
    for (const [w, h, d, x, y, z] of bars) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat)
      m.position.set(x, y, z)
      root.add(m)
    }
    // 받침
    const plinth = rbox(0.6, 0.4, 0.5, 0.01, M.stone)
    plinth.position.set(-5.95, 0.2, 1.5)
    root.add(plinth)
    const v = vase(M, 1.0)
    v.position.set(-5.95, 0.4, 1.5)
    root.add(v)
  }

  /* ---------- B2B 파트너 보드 (이젤) ---------- */
  {
    const boardTex = b2bBoardTexture()
    const g = new THREE.Group()
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(1.72, 1.1),
      new THREE.MeshStandardMaterial({
        map: boardTex,
        roughness: 0.55,
        metalness: 0.15,
        emissive: 0x0f0a05,
        envMapIntensity: 0.9,
        side: THREE.DoubleSide,
      }),
    )
    board.userData.pick = { kind: 'b2b' }
    g.add(board)
    pickables.push(board)

    const fw = 1.78
    const fh = 1.16
    const frame = [
      [0.05, fh, 0.05, -fw / 2, 0, -0.04],
      [0.05, fh, 0.05, fw / 2, 0, -0.04],
      [fw, 0.05, 0.05, 0, fh / 2, -0.04],
      [fw, 0.05, 0.05, 0, -fh / 2, -0.04],
    ]
    for (const [w, h, d, x, y, z] of frame) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.brass)
      m.position.set(x, y, z)
      m.castShadow = true
      g.add(m)
    }
    // A자 이젤 다리
    for (const sx of [-0.6, 0.6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.62, 10), M.brass)
      leg.position.set(sx, -fh / 2 - 0.3, 0.02)
      leg.castShadow = true
      g.add(leg)
      const back = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.7, 10), M.brass)
      back.position.set(sx, -fh / 2 - 0.34, -0.16)
      back.rotation.x = 0.34
      g.add(back)
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.015, 14), M.brassDark)
      foot.position.set(sx, -fh / 2 - 0.6, -0.22)
      g.add(foot)
    }
    g.position.set(4.55, 1.55, 2.2)
    g.rotation.y = -0.8
    root.add(g)
    const sh = shadowPlane(M, 2.2, 0.9, 0.32)
    sh.position.set(4.6, 0.005, 2.45)
    sh.rotation.z = -0.8
    root.add(sh)

  }

  /* ---------- 05 나의 건강최적 루틴관리 시스템 (키오스크) ---------- */
  {
    const [x, z] = FIXTURE.routineKiosk
    const g = new THREE.Group()
    const pick = (mesh) => {
      mesh.userData.pick = { kind: 'routine' }
      pickables.push(mesh)
      return mesh
    }

    const base = rbox(1.34, 0.05, 0.52, 0.01, M.brassDark)
    base.position.y = 0.025
    g.add(base)

    const body = rbox(1.26, 0.8, 0.46, 0.015, M.walnutLong)
    body.position.y = 0.44
    g.add(body)
    pick(body)

    const band = rbox(1.3, 0.02, 0.48, 0.006, M.brass)
    band.position.y = 0.845
    g.add(band)

    const top = rbox(1.3, 0.045, 0.5, 0.008, M.stone)
    top.position.y = 0.878
    g.add(top)

    // 화면 패널 (살짝 뒤로 젖힌 각도)
    const screenGroup = new THREE.Group()
    screenGroup.position.set(0, 1.16, -0.02)
    screenGroup.rotation.x = -0.2
    g.add(screenGroup)

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.12, 0.71),
      new THREE.MeshStandardMaterial({
        map: routineBoardTexture(),
        roughness: 0.42,
        metalness: 0.06,
        emissive: 0x201810,
        emissiveIntensity: 0.55,
        envMapIntensity: 0.7,
      }),
    )
    screen.position.z = 0.026
    screenGroup.add(screen)
    pick(screen)

    const backPanel = rbox(1.2, 0.8, 0.045, 0.008, M.stoneDark)
    screenGroup.add(backPanel)

    const fw = 1.2
    const fh = 0.8
    for (const [w, h, d, px, py] of [
      [0.028, fh, 0.04, -fw / 2, 0],
      [0.028, fh, 0.04, fw / 2, 0],
      [fw, 0.028, 0.04, 0, fh / 2],
      [fw, 0.028, 0.04, 0, -fh / 2],
    ]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.brass)
      bar.position.set(px, py, 0.03)
      bar.castShadow = true
      screenGroup.add(bar)
    }

    // 화면 아래 명패
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.156),
      new THREE.MeshStandardMaterial({
        map: engraveTexture('루틴관리', 'ROUTINE SYSTEM'),
        roughness: 0.5,
        metalness: 0.2,
      }),
    )
    plaque.position.set(0, 0.93, 0.255)
    g.add(plaque)

    // 카운터 위 작은 루틴 카드 3장
    for (let i = 0; i < 3; i++) {
      const card = rbox(0.16, 0.075, 0.012, 0.003, M.linen)
      card.position.set(-0.42 + i * 0.19, 0.94, 0.16)
      card.rotation.x = -0.15
      g.add(card)
    }

    const sh = shadowPlane(M, 1.7, 0.9, 0.5)
    sh.position.set(x, 0.006, z)
    root.add(sh)

    g.position.set(x, 0, z)
    g.rotation.y = 0.38
    root.add(g)

    const keyLight = new THREE.PointLight(0xffd9a8, 9, 3.2, 2)
    keyLight.position.set(x, 1.9, z + 0.5)
    root.add(keyLight)
    lights.push(keyLight)
  }

  /* ---------- 벽 명패 ---------- */
  {
    const plaques = [
      { name: '오륜미네랄', sub: 'SIGNATURE 1,000ML', x: -5.49, y: 1.62, z: -2.9, ry: Math.PI / 2 },
      { name: '하루 1.3핏', sub: 'CLEANSE PROGRAM', x: 5.49, y: 1.62, z: -2.1, ry: -Math.PI / 2 },
      { name: 'B2B 파트너', sub: 'PARTNER LOUNGE', x: 5.49, y: 1.55, z: 4.35, ry: -Math.PI / 2 },
      { name: '나의 건강최적', sub: 'ROUTINE SYSTEM', x: -3.55, y: 2.5, z: -8.44, ry: 0 },
    ]
    for (const p of plaques) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(0.66, 0.206),
        new THREE.MeshStandardMaterial({
          map: engraveTexture(p.name, p.sub, true),
          roughness: 0.5,
          metalness: 0.2,
          envMapIntensity: 1.1,
        }),
      )
      m.position.set(p.x, p.y, p.z)
      m.rotation.y = p.ry
      root.add(m)
    }
  }

  /* ---------- 펜던트 ---------- */
  const pendants = [
    { x: FIXTURE.lobbyPedestal[0], z: FIXTURE.lobbyPedestal[1], drop: 1.32, r: 0.26, i: 14 },
    { x: FIXTURE.partnerTable[0], z: FIXTURE.partnerTable[1], drop: 1.3, r: 0.27, i: 18 },
  ]
  for (const p of pendants) {
    const pg = pendant(M, p.r, p.drop)
    pg.position.set(p.x, 4.8, p.z)
    root.add(pg)
    const light = new THREE.PointLight(0xffcf96, p.i, 7, 2)
    light.position.set(p.x, 4.8 - p.drop - 0.25, p.z)
    root.add(light)
    lights.push(light)
  }

  scene.add(root)
  if (register) pickables.forEach(register)
  return { root, lights, pickables }
}
