import * as THREE from 'three'
import { ROOM, ARCHES } from './layout.js'
import { brandPlaqueTexture } from './textures.js'

const W = ROOM.width
const H = ROOM.height
const D = ROOM.depth
const T = ROOM.wall
const Z0 = -8.5 // 안쪽 벽
const Z1 = 6.5 // 입구 쪽

function wallGeometry(width, height, arches, thickness) {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, 0)
  shape.lineTo(width / 2, 0)
  shape.lineTo(width / 2, height)
  shape.lineTo(-width / 2, height)
  shape.lineTo(-width / 2, 0)

  for (const a of arches) {
    const r = a.width / 2
    const p = new THREE.Path()
    p.moveTo(a.x - r, 0)
    p.lineTo(a.x - r, a.spring)
    p.absarc(a.x, a.spring, r, Math.PI, 0, true)
    p.lineTo(a.x + r, 0)
    p.closePath()
    shape.holes.push(p)
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 28,
    steps: 1,
  })
  geo.translate(0, 0, -thickness)
  return geo
}

function archTrim(u, spring, r) {
  const pts = []
  pts.push(new THREE.Vector3(u - r, 0.015, 0))
  pts.push(new THREE.Vector3(u - r, spring * 0.55, 0))
  pts.push(new THREE.Vector3(u - r, spring, 0))
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI - (i / 24) * Math.PI
    pts.push(new THREE.Vector3(u + Math.cos(a) * r, spring + Math.sin(a) * r, 0))
  }
  pts.push(new THREE.Vector3(u + r, 0.015, 0))
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.02)
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 140, 0.014, 8, false),
    new THREE.MeshStandardMaterial({ color: 0xc09454, metalness: 1, roughness: 0.36 }),
  )
}

function nicheShell(M, width, spring, depth) {
  const g = new THREE.Group()
  const r = width / 2
  const totalH = spring + r
  // 뒤판
  const back = new THREE.Mesh(new THREE.PlaneGeometry(width + 0.06, totalH + 0.02), M.wallWarm)
  back.position.set(0, (totalH + 0.02) / 2, -depth)
  back.receiveShadow = true
  g.add(back)
  // 바닥
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), M.stoneDark)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0.012, -depth / 2)
  floor.receiveShadow = true
  g.add(floor)
  // 옆벽
  for (const s of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.PlaneGeometry(depth, totalH), M.wallWarm)
    jamb.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2
    jamb.position.set(s * (width / 2), totalH / 2, -depth / 2)
    jamb.receiveShadow = true
    g.add(jamb)
  }
  // 상단 LED 매립
  const led = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 0.022, 0.05), M.glow)
  led.position.set(0, spring + r - 0.16, -depth + 0.16)
  g.add(led)
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.8, 0.9),
    new THREE.MeshBasicMaterial({ color: 0xffdcae, transparent: true, opacity: 0.09, depthWrite: false }),
  )
  glow.position.set(0, totalH - 0.55, -depth + 0.03)
  g.add(glow)
  return g
}

export function buildArchitecture(scene, M) {
  const root = new THREE.Group()

  /* ---------- 바닥 ---------- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.floor)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, (Z0 + Z1) / 2)
  floor.receiveShadow = true
  root.add(floor)

  // 바닥 황동 인레이
  const inlay = new THREE.MeshStandardMaterial({ color: 0xb08b52, metalness: 1, roughness: 0.42 })
  const inlayY = 0.004
  for (const z of [-11.3, 9.3]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(W - 1.6, 0.008, 0.03), inlay)
    line.position.set(0, inlayY, z)
    root.add(line)
  }
  for (const x of [-7.3, 7.3]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, D - 1.4), inlay)
    line.position.set(x, inlayY, (Z0 + Z1) / 2)
    root.add(line)
  }

  // 바닥 테두리 밴드 — 공간에 경계를 만듭니다
  const bandMat = M.stoneDark
  const bands = [
    [W, 0.9, 0, Z0 + 0.45],
    [W, 0.9, 0, Z1 - 0.45],
    [0.9, D - 1.8, -W / 2 + 0.45, (Z0 + Z1) / 2],
    [0.9, D - 1.8, W / 2 - 0.45, (Z0 + Z1) / 2],
  ]
  for (const [bw, bd, bx, bz] of bands) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(bw, bd), bandMat)
    m.rotation.x = -Math.PI / 2
    m.position.set(bx, 0.003, bz)
    m.receiveShadow = true
    root.add(m)
  }

  /* ---------- 천장 ---------- */
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.ceiling)
  ceil.rotation.x = Math.PI / 2
  ceil.position.set(0, H, (Z0 + Z1) / 2)
  ceil.receiveShadow = true
  root.add(ceil)

  // 코브 라이트 — 벽 상단의 은은한 선
  const coveMat = new THREE.MeshBasicMaterial({ color: 0xffd8a4 })
  for (const side of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, D - 0.4), coveMat)
    strip.position.set(side * (W / 2 - 0.16), H - 0.16, (Z0 + Z1) / 2)
    root.add(strip)
  }
  for (const z of [Z0 + 0.18, Z1 - 0.18]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.05, 0.06), coveMat)
    strip.position.set(0, H - 0.16, z)
    root.add(strip)
  }

  // 다운라이트
  const dlGeo = new THREE.CircleGeometry(0.075, 20)
  const dlMat = new THREE.MeshBasicMaterial({ color: 0xfff0d6 })
  for (let z = -7.8; z <= 5.8; z += 2.2) {
    for (const x of [-2.4, 2.4]) {
      const d = new THREE.Mesh(dlGeo, dlMat)
      d.rotation.x = Math.PI / 2
      d.position.set(x, H - 0.01, z)
      root.add(d)
    }
  }

  /* ---------- 벽 ---------- */
  const walls = [
    {
      width: W + T * 2,
      arches: ARCHES.back,
      rotY: 0,
      pos: [0, 0, Z0],
      niche: (a) => ({ width: a.width, spring: a.spring, depth: 0.72 }),
    },
    {
      width: D,
      arches: ARCHES.left.map((a) => ({ ...a, x: -(a.z - (Z0 + Z1) / 2) })),
      rotY: Math.PI / 2,
      pos: [-W / 2, 0, 0],
      niche: (a) => ({ width: a.width, spring: a.spring, depth: 0.72 }),
    },
    {
      width: D,
      arches: ARCHES.right.map((a) => ({ ...a, x: a.z - (Z0 + Z1) / 2 })),
      rotY: -Math.PI / 2,
      pos: [W / 2, 0, 0],
      niche: (a) => ({ width: a.width, spring: a.spring, depth: 0.72 }),
    },
    {
      width: W + T * 2,
      arches: ARCHES.front,
      rotY: Math.PI,
      pos: [0, 0, Z1],
      niche: null,
    },
  ]

  // left/right 벽의 중심 z는 0이 아니라 -1 입니다: 회전 기준 보정
  walls[1].pos = [-W / 2, 0, (Z0 + Z1) / 2]
  walls[2].pos = [W / 2, 0, (Z0 + Z1) / 2]

  for (const spec of walls) {
    const group = new THREE.Group()
    const mesh = new THREE.Mesh(wallGeometry(spec.width, H, spec.arches, T), M.wall)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)

    for (const a of spec.arches) {
      group.add(archTrim(a.x, a.spring, a.width / 2))
      const n = spec.niche && spec.niche(a)
      if (n) {
        const shell = nicheShell(M, n.width, n.spring, n.depth)
        shell.position.x = a.x
        group.add(shell)
      }
    }

    group.rotation.y = spec.rotY
    group.position.set(spec.pos[0], spec.pos[1], spec.pos[2])
    root.add(group)
  }

  /* ---------- 브랜드 월 (안쪽 벽감) ---------- */
  const plaqueTex = brandPlaqueTexture()
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.46),
    new THREE.MeshStandardMaterial({
      map: plaqueTex,
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.85,
      roughness: 0.34,
      emissive: 0x2a1f10,
      emissiveIntensity: 0.6,
      envMapIntensity: 1.6,
    }),
  )
  plaque.position.set(0, 2.02, Z0 - 0.66)
  root.add(plaque)

  // 브랜드 월 뒤판 조명 느낌
  const backGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.0),
    new THREE.MeshBasicMaterial({ color: 0xffe0b6, transparent: true, opacity: 0.06, depthWrite: false }),
  )
  backGlow.position.set(0, 1.9, Z0 - 0.74)
  root.add(backGlow)

  /* ---------- 입구 커튼 ---------- */
  const curtainGeo = (w, h) => {
    const g = new THREE.PlaneGeometry(w, h, 40, 1)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      p.setZ(i, Math.sin((x / w) * Math.PI * 9) * 0.055)
    }
    g.computeVertexNormals()
    return g
  }
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(curtainGeo(1.35, 3.3), M.linenCurtain)
    c.position.set(s * 2.9, 1.85, Z1 - 0.2)
    c.rotation.y = s * 0.06
    root.add(c)
  }

  /* ---------- 벽 스콘 ---------- */
  const sconceAt = (x, z, rotY) => {
    const g = new THREE.Group()
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 10), M.brass)
    stem.position.set(0, 0.25, 0.02)
    g.add(stem)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 20), M.brass)
    cap.position.set(0, 0.5, 0.02)
    g.add(cap)
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0xffe7c2 }),
    )
    globe.position.set(0, 0.56, 0.03)
    g.add(globe)
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd9a2, transparent: true, opacity: 0.16, depthWrite: false }),
    )
    halo.position.copy(globe.position)
    g.add(halo)
    g.position.set(x, 2.0, z)
    g.rotation.y = rotY
    return g
  }
  root.add(sconceAt(-W / 2 + 0.02, -2.2, -Math.PI / 2))
  root.add(sconceAt(-W / 2 + 0.02, 3.9, -Math.PI / 2))
  root.add(sconceAt(W / 2 - 0.02, -1.2, Math.PI / 2))
  root.add(sconceAt(W / 2 - 0.02, 4.2, Math.PI / 2))
  root.add(sconceAt(-3.2, Z0 + 0.02, 0))
  root.add(sconceAt(3.2, Z0 + 0.02, 0))

  scene.add(root)
  return root
}
