import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { products } from '../config/products.js'
import { mineralLabelTexture, cleanbiomeLabelTexture, fitBoxTexture, creamSideTexture } from './textures.js'

const SERIF = 'ALFSerif, serif'
void SERIF

function latheMesh(points, material, seg = 64) {
  const geo = new THREE.LatheGeometry(
    points.map((p) => new THREE.Vector2(p[0], p[1])),
    seg,
  )
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, material)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

function capMesh(r, h, material, ribs = true) {
  const g = new THREE.Group()
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.02, h, 40), material)
  cap.castShadow = true
  g.add(cap)
  if (ribs) {
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.005, 0.0016, 6, 40), material)
      ring.rotation.x = Math.PI / 2
      ring.position.y = -h / 2 + 0.006 + i * (h / 4)
      g.add(ring)
    }
  }
  return g
}

/* ---------------- 오륜미네랄 1,000ml ---------------- */
export function mineralBottle(M) {
  const g = new THREE.Group()
  const H = 0.34
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xf3ecdf,
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.32,
    envMapIntensity: 0.9,
  })

  const profile = [
    [0.0, 0.0],
    [0.044, 0.0],
    [0.05, 0.008],
    [0.05, 0.225],
    [0.048, 0.24],
    [0.04, 0.262],
    [0.027, 0.278],
    [0.021, 0.286],
    [0.021, 0.3],
  ]
  const body = latheMesh(profile, bodyMat, 72)
  g.add(body)

  const labelTex = mineralLabelTexture()
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0505, 0.0505, 0.2, 72, 1, true),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.48, metalness: 0.02, envMapIntensity: 0.6 }),
  )
  label.position.y = 0.113
  label.rotation.y = -Math.PI / 2
  label.castShadow = false
  g.add(label)

  const capMat = new THREE.MeshStandardMaterial({ color: 0xf7f3ea, roughness: 0.62, metalness: 0.02 })
  const cap = capMesh(0.0225, 0.042, capMat)
  cap.position.y = 0.318
  g.add(cap)

  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.0215, 0.0022, 8, 40), capMat)
  neckRing.rotation.x = Math.PI / 2
  neckRing.position.y = 0.296
  g.add(neckRing)

  g.userData.height = H
  return g
}

/* ---------------- 클린바이옴 100ml ---------------- */
export function cleanbiomeBottle(M, rotation = Math.PI / 2) {
  const g = new THREE.Group()
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xf6f4ee,
    roughness: 0.28,
    metalness: 0,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1,
  })
  const profile = [
    [0.0, 0.0],
    [0.024, 0.0],
    [0.028, 0.006],
    [0.028, 0.082],
    [0.026, 0.094],
    [0.019, 0.108],
    [0.017, 0.118],
  ]
  const body = latheMesh(profile, bodyMat, 48)
  g.add(body)

  const labelTex = cleanbiomeLabelTexture()
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0284, 0.0284, 0.086, 48, 1, true),
    new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.5, metalness: 0, envMapIntensity: 0.5 }),
  )
  label.position.y = 0.046
  label.rotation.y = rotation
  g.add(label)

  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0 })
  const cap = capMesh(0.0185, 0.03, capMat, true)
  cap.position.y = 0.132
  g.add(cap)

  return g
}

/* ---------------- 1.3fit 박스 ---------------- */
export function fitBox(M, days) {
  const g = new THREE.Group()
  const w = days === 30 ? 0.215 : 0.175
  const h = days === 30 ? 0.3 : 0.245
  const d = days === 30 ? 0.1 : 0.082

  const cream = new THREE.MeshStandardMaterial({
    color: 0xf4ecdc,
    roughness: 0.5,
    metalness: 0,
    map: creamSideTexture('#f4ecdc'),
  })
  const shell = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.006), cream)
  shell.position.y = h / 2
  shell.castShadow = true
  shell.receiveShadow = true
  g.add(shell)

  const tex = fitBoxTexture(days)
  const labelMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.52, metalness: 0 })
  for (const s of [1, -1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.965, h * 0.955), labelMat)
    face.position.set(0, h / 2, s * (d / 2 + 0.0015))
    if (s < 0) face.rotation.y = Math.PI
    g.add(face)
  }
  // 상단 골드 씰
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 24), M.brass)
  seal.position.set(0, h + 0.002, 0)
  g.add(seal)

  g.userData.height = h
  return g
}

/* ---------------- 6병 세트 ---------------- */
export function cleanbiomeCluster(M) {
  const g = new THREE.Group()
  const tray = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.018, 0.22, 3, 0.006), M.walnut)
  tray.position.y = 0.009
  tray.castShadow = true
  tray.receiveShadow = true
  g.add(tray)
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.004, 0.004), M.brass)
  rail.position.set(0, 0.019, 0.11)
  g.add(rail)

  let i = 0
  for (const z of [-0.055, 0.055]) {
    for (const x of [-0.1, 0, 0.1]) {
      const b = cleanbiomeBottle(M, Math.PI / 2 + (i % 2 === 0 ? -0.18 : 0.18))
      b.position.set(x, 0.018, z)
      g.add(b)
      i++
    }
  }
  g.userData.height = 0.17
  return g
}

export function singleBottle(M) {
  const g = new THREE.Group()
  const coaster = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 40), M.brass)
  coaster.position.y = 0.004
  coaster.castShadow = true
  g.add(coaster)
  const b = cleanbiomeBottle(M, Math.PI / 2)
  b.position.y = 0.008
  g.add(b)
  g.userData.height = 0.16
  return g
}

/* ---------------- 조립 ---------------- */
export function buildProducts(scene, M, register) {
  const root = new THREE.Group()
  const pickables = []

  const builders = {
    mineral: () => mineralBottle(M),
    box30: () => fitBox(M, 30),
    box3: () => fitBox(M, 3),
    cluster6: () => cleanbiomeCluster(M),
    single: () => singleBottle(M),
  }

  for (const p of products) {
    const model = builders[p.model]()
    if (p.id === 'oryun') model.scale.setScalar(1.22)
    const h = (model.userData.height || 0.2) * (p.id === 'oryun' ? 1.22 : 1)
    model.position.set(p.anchor[0], p.anchor[1] - h / 2, p.anchor[2])
    root.add(model)

    model.traverse((o) => {
      if (o.isMesh) {
        o.userData.pick = { kind: 'product', id: p.id }
        o.userData.productId = p.id
        pickables.push(o)
      }
    })

    // 보이지 않는 터치 판 — 병 사이 빈틈을 눌러도 제품이 열리도록
    const bbox = new THREE.Box3().setFromObject(model)
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.max(size.x * 1.18, 0.16),
        Math.max(size.y * 1.14, 0.16),
        Math.max(size.z * 1.18, 0.16),
      ),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    )
    hit.position.copy(center)
    hit.visible = false
    hit.userData.pick = { kind: 'product', id: p.id }
    hit.userData.productId = p.id
    root.add(hit)
    pickables.push(hit)
  }

  scene.add(root)
  if (register) pickables.forEach(register)
  return { root, pickables }
}
