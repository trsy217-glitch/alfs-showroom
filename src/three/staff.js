import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { engraveTexture } from './textures.js'
import { MANAGERS } from '../config/staff.js'
import { STAFF_SPOTS } from './layout.js'

/* ------------------------------------------------------------------ */
/* 존 전담 매니저 — 부티크 룩의 스탠딩 캐릭터 (절차적 모델)             */
/* 키 약 1.72m, 정면 +Z. 발끝이 원점입니다.                            */
/* ------------------------------------------------------------------ */

const V = (a, b, c) => new THREE.Vector3(a, b, c)

function limb(a, b, r1, r2, material, seg = 16) {
  const va = V(...a)
  const vb = V(...b)
  const dir = vb.clone().sub(va)
  const len = dir.length()
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len, seg, 1), material)
  m.position.copy(va).add(vb).multiplyScalar(0.5)
  m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize())
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function bodyLathe(points, material, zScale = 0.6, seg = 36) {
  const geo = new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  )
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, material)
  m.scale.z = zScale
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function buildManager(spec, M) {
  const L = spec.look
  const g = new THREE.Group()

  const skin = new THREE.MeshStandardMaterial({ color: 0xecceb2, roughness: 0.62, metalness: 0 })
  const skinShade = new THREE.MeshStandardMaterial({ color: 0xdfb99c, roughness: 0.66, metalness: 0 })
  const hair = new THREE.MeshStandardMaterial({ color: L.hair, roughness: 0.5, metalness: 0.08 })
  const jacket = new THREE.MeshStandardMaterial({ color: L.jacket, roughness: 0.74, metalness: 0.04 })
  const blouse = new THREE.MeshStandardMaterial({ color: L.blouse, roughness: 0.7, metalness: 0 })
  const lower = new THREE.MeshStandardMaterial({ color: L.lower, roughness: 0.74, metalness: 0.03 })
  const shoe = new THREE.MeshStandardMaterial({ color: 0x1b1512, roughness: 0.34, metalness: 0.2 })
  const eye = new THREE.MeshStandardMaterial({ color: 0x2b1e17, roughness: 0.3, metalness: 0 })
  const lip = new THREE.MeshStandardMaterial({ color: 0xa9635f, roughness: 0.55, metalness: 0 })
  const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(L.hair).multiplyScalar(1.35), roughness: 0.6, metalness: 0 })
  const brass = new THREE.MeshStandardMaterial({ color: 0xc79b5c, metalness: 1, roughness: 0.4, envMapIntensity: 1.3 })

  const headY = 1.585
  const headR = 0.088

  /* ---------- 구두 ---------- */
  for (const s of [-1, 1]) {
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.078, 0.045, 0.215, 2, 0.016), shoe)
    foot.position.set(s * 0.066, 0.028, 0.05)
    foot.castShadow = true
    g.add(foot)
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.014, L.heels, 12), shoe)
    heel.position.set(s * 0.066, L.heels / 2, -0.048)
    heel.castShadow = true
    g.add(heel)
  }

  /* ---------- 다리 ---------- */
  if (L.legs === 'trousers') {
    for (const s of [-1, 1]) {
      g.add(limb([s * 0.068, 0.05, 0.004], [s * 0.08, 0.92, -0.004], 0.042, 0.072, lower, 20))
    }
    const hip = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), lower)
    hip.scale.set(0.13, 0.1, 0.1)
    hip.position.set(0, 0.93, 0)
    hip.castShadow = true
    g.add(hip)
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.146, 0.15, 0.1, 32, 1, true), jacket)
    hem.scale.z = 0.62
    hem.position.set(0, 0.9, 0)
    hem.material = jacket
    hem.material.side = THREE.DoubleSide
    g.add(hem)
  } else {
    for (const s of [-1, 1]) {
      g.add(limb([s * 0.064, 0.045, 0.006], [s * 0.074, 0.53, 0.0], 0.03, 0.052, skin, 20))
      g.add(limb([s * 0.074, 0.5, 0.0], [s * 0.078, 0.9, -0.004], 0.052, 0.072, skin, 20))
    }
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.182, 0.42, 40, 1, false), lower)
    skirt.scale.z = 0.74
    skirt.position.set(0, 0.71, 0)
    skirt.castShadow = true
    skirt.receiveShadow = true
    g.add(skirt)
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.028, 40), lower)
    band.scale.z = 0.74
    band.position.set(0, 0.912, 0)
    g.add(band)
  }

  /* ---------- 몸통 ---------- */
  const torso = bodyLathe(
    [
      [0.132, 0.0],
      [0.124, 0.08],
      [0.13, 0.17],
      [0.145, 0.28],
      [0.153, 0.38],
      [0.15, 0.46],
      [0.132, 0.52],
      [0.085, 0.55],
    ],
    jacket,
    0.6,
  )
  torso.position.y = 0.885
  g.add(torso)

  // 블라우스 — 재킷 위로 보이는 목선
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.055, 24, 1, true), blouse)
  collar.position.set(0, 1.398, 0.004)
  collar.material.side = THREE.DoubleSide
  g.add(collar)
  const placket = new THREE.Mesh(new RoundedBoxGeometry(0.022, 0.1, 0.011, 2, 0.004), blouse)
  placket.position.set(0, 1.335, 0.086)
  g.add(placket)


  // 단추 · 명찰
  for (let i = 0; i < 2; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 12, 10), brass)
    b.position.set(0.004, 1.14 - i * 0.062, 0.096)
    g.add(b)
  }
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.017), brass)
  badge.position.set(0.072, 1.235, 0.093)
  badge.rotation.y = -0.2
  g.add(badge)

  /* ---------- 팔 ---------- */
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 14), jacket)
    shoulder.position.set(s * 0.116, 1.345, 0)
    shoulder.scale.set(1.15, 0.95, 1)
    shoulder.castShadow = true
    g.add(shoulder)
    g.add(limb([s * 0.121, 1.33, 0.0], [s * 0.144, 1.12, 0.018], 0.027, 0.034, jacket, 14))
    g.add(limb([s * 0.144, 1.13, 0.02], [s * 0.05, 0.99, 0.11], 0.034, 0.026, jacket, 14))
    const cuff = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 12), blouse)
    cuff.scale.set(1, 0.55, 1)
    cuff.position.set(s * 0.055, 0.988, 0.108)
    g.add(cuff)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.023, 16, 12), skin)
    hand.scale.set(0.9, 0.62, 1.2)
    hand.position.set(s * 0.048, 0.962, 0.122)
    hand.castShadow = true
    g.add(hand)
  }

  /* ---------- 목 · 머리 ---------- */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.085, 18), skin)
  neck.position.y = 1.425
  g.add(neck)

  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 32, 24), skin)
  head.scale.set(0.96, 1.16, 1.02)
  head.position.y = headY
  head.castShadow = true
  g.add(head)

  // 얼굴
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 16, 12), eye)
    e.scale.set(1, 0.52, 0.35)
    e.position.set(s * 0.029, headY + 0.014, 0.078)
    g.add(e)
    const brow = new THREE.Mesh(new RoundedBoxGeometry(0.022, 0.0032, 0.004, 2, 0.0012), browMat)
    brow.position.set(s * 0.03, headY + 0.034, 0.076)
    brow.rotation.z = s * 0.1
    g.add(brow)
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.019, 14, 12), skinShade)
    ear.scale.set(0.5, 1, 0.8)
    ear.position.set(s * 0.086, headY + 0.005, -0.004)
    g.add(ear)
    const earring = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 12, 10), brass)
    earring.position.set(s * 0.088, headY - 0.026, 0.002)
    g.add(earring)
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.0105, 12, 10), skinShade)
  nose.scale.set(0.8, 1.15, 0.9)
  nose.position.set(0, headY - 0.008, 0.081)
  g.add(nose)
  const lips = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 16, 12), lip)
  lips.scale.set(1.05, 0.36, 0.45)
  lips.position.set(0, headY - 0.046, 0.076)
  g.add(lips)

  /* ---------- 헤어 ---------- */
  // 앞머리선이 눈썹 위로 올라오도록 — 모자(캡)를 머리보다 확실히 크게
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(headR * 1.09, 36, 26, 0, Math.PI * 2, 0, Math.PI * 0.47),
    hair,
  )
  cap.scale.set(0.98, 1.2, 1.06)
  cap.rotation.x = -0.34
  cap.rotation.z = 0.04
  cap.position.set(0, headY + 0.022, -0.006)
  cap.castShadow = true
  g.add(cap)
  // 뒤통수 — 캡 아래를 덮는 머리 볼륨
  const backHair = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.08, 28, 20), hair)
  backHair.scale.set(0.98, 1.1, 0.85)
  backHair.position.set(0, headY + 0.0, -0.038)
  backHair.castShadow = true
  g.add(backHair)

  if (L.hairStyle === 'bun') {
    // 올림머리 — 낮게 묶은 번 + 옆머리 정돈
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.042, 20, 16), hair)
    bun.scale.set(1, 0.92, 0.95)
    bun.position.set(0, headY - 0.012, -0.1)
    bun.castShadow = true
    g.add(bun)
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0042, 8, 18), brass)
    band.rotation.x = 1.2
    band.position.set(0, headY + 0.01, -0.077)
    g.add(band)
    const sweep = new THREE.Mesh(new THREE.SphereGeometry(0.052, 18, 14), hair)
    sweep.scale.set(1.12, 0.5, 0.8)
    sweep.position.set(0, headY + 0.052, 0.03)
    sweep.rotation.x = -0.25
    g.add(sweep)
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), hair)
      side.scale.set(0.5, 1.05, 1.0)
      side.position.set(s * 0.082, headY + 0.006, -0.03)
      g.add(side)
    }
  } else {
    // 단발 — 턱선까지 오는 보브 (얼굴은 비우고 뒤·옆만)
    const bob = new THREE.Mesh(
      new THREE.CylinderGeometry(headR * 1.1, headR * 1.0, 0.135, 28, 1, true, Math.PI * 0.3, Math.PI * 1.4),
      hair,
    )
    bob.position.set(0, headY - 0.028, -0.006)
    bob.scale.z = 1.03
    bob.material = hair.clone()
    bob.material.side = THREE.DoubleSide
    bob.castShadow = true
    g.add(bob)
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.064, 20, 14), hair)
    fringe.scale.set(1.16, 0.5, 0.66)
    fringe.position.set(0, headY + 0.05, 0.036)
    fringe.rotation.x = -0.2
    g.add(fringe)
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 12), hair)
      side.scale.set(0.5, 1.15, 1.0)
      side.position.set(s * 0.085, headY + 0.0, 0.0)
      g.add(side)
    }
  }

  /* ---------- 접지 그림자 ---------- */
  const shadowMat = M && M.shadow ? M.shadow.clone() : new THREE.MeshBasicMaterial({ color: 0x000000 })
  shadowMat.opacity = 0.5
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.6), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(0, 0.006, 0.03)
  shadow.renderOrder = 1
  g.add(shadow)

  g.traverse((o) => {
    if (o.isMesh) {
      o.userData.pick = { kind: 'staff', id: spec.id }
      o.userData.staffId = spec.id
      // 인물이 존 조명을 가려 진열품을 어둡게 하지 않도록 — 그림자는 발밑 판으로 대신
      o.castShadow = false
    }
  })

  return g
}

/* 바닥 명패 — 매니저 앞에 세우는 작은 황동 팻말 */
function buildSign() {
  const brass = new THREE.MeshStandardMaterial({ color: 0xc79b5c, metalness: 1, roughness: 0.4, envMapIntensity: 1.3 })
  const sign = new THREE.Group()
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.011, 20), brass)
  base.position.y = 0.006
  sign.add(base)
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.46, 10), brass)
  stem.position.y = 0.24
  sign.add(stem)
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.215, 0.068),
    new THREE.MeshStandardMaterial({
      map: engraveTexture('전담 매니저', 'TOUCH TO ASK', true),
      transparent: true,
      roughness: 0.45,
      metalness: 0.3,
      emissive: 0x140e07,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    }),
  )
  plate.position.set(0, 0.49, 0)
  plate.rotation.x = -0.22
  sign.add(plate)
  return sign
}

export function buildStaff(scene, M, { register } = {}) {
  const root = new THREE.Group()
  const pickables = []
  const lights = []

  for (const spec of MANAGERS) {
    const spot = STAFF_SPOTS[spec.id]
    if (!spot) continue
    const model = buildManager({ ...spec, id: spec.id }, M)
    model.position.set(spot.at[0], spot.at[1], spot.at[2])
    model.rotation.y = spot.ry
    model.userData.baseRy = spot.ry
    root.add(model)

    // 따뜻한 포인트 라이트 — 매니저 얼굴과 재킷이 어둠에 묻히지 않도록
    const key = new THREE.PointLight(0xffd8ab, 5.5, 2.8, 2)
    key.position.set(spot.at[0] + 0.62 * Math.sin(spot.ry), 1.95, spot.at[2] + 0.62 * Math.cos(spot.ry))
    root.add(key)
    lights.push(key)

    model.traverse((o) => {
      if (o.isMesh && o.userData.pick) pickables.push(o)
    })
  }

  scene.add(root)
  if (register) pickables.forEach(register)
  return { root, pickables, lights }
}
