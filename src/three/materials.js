import * as THREE from 'three'
import {
  travertineTexture,
  plasterTexture,
  walnutTexture,
  linenTexture,
  brassRoughness,
  contactShadowTexture,
} from './textures.js'

function rep(tex, x, y) {
  const t = tex.clone()
  t.needsUpdate = true
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(x, y)
  return t
}

export function createMaterials(renderer) {
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const stone = travertineTexture(1024)
  const plaster = plasterTexture(512)
  const walnut = walnutTexture(1024)
  const linen = linenTexture(512)
  const brassRough = brassRoughness(512)

  const stoneFloor = rep(stone, 4, 5.5)
  const stoneWall = rep(stone, 1, 1)
  const stonePlinth = rep(stone, 1, 1)
  const plasterWall = rep(plaster, 6, 2.4)
  const plasterSoft = rep(plaster, 2, 2)
  const walnutMap = rep(walnut, 1.4, 1)
  const walnutMapLong = rep(walnut, 2.6, 1)
  const linenMap = rep(linen, 3, 3)
  const linenCurtain = rep(linen, 2, 1)

  for (const t of [stoneFloor, stoneWall, stonePlinth, plasterWall, plasterSoft, walnutMap, walnutMapLong, linenMap, linenCurtain]) {
    t.anisotropy = aniso
  }
  stoneFloor.colorSpace = THREE.SRGBColorSpace
  stoneWall.colorSpace = THREE.SRGBColorSpace
  stonePlinth.colorSpace = THREE.SRGBColorSpace
  plasterWall.colorSpace = THREE.SRGBColorSpace
  plasterSoft.colorSpace = THREE.SRGBColorSpace
  walnutMap.colorSpace = THREE.SRGBColorSpace
  walnutMapLong.colorSpace = THREE.SRGBColorSpace
  linenMap.colorSpace = THREE.SRGBColorSpace
  linenCurtain.colorSpace = THREE.SRGBColorSpace

  const brassRoughMap = rep(brassRough, 2, 2)
  const shadowTex = new THREE.CanvasTexture(contactShadowTexture(256))
  shadowTex.colorSpace = THREE.SRGBColorSpace

  const M = {
    floor: new THREE.MeshStandardMaterial({
      map: stoneFloor,
      bumpMap: stoneFloor,
      bumpScale: 0.02,
      roughness: 0.42,
      metalness: 0.04,
      envMapIntensity: 0.55,
      color: 0xffffff,
    }),
    wall: new THREE.MeshStandardMaterial({
      map: plasterWall,
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.22,
      color: 0xf7efe1,
    }),
    wallWarm: new THREE.MeshStandardMaterial({
      map: plasterSoft,
      roughness: 0.9,
      metalness: 0,
      envMapIntensity: 0.3,
      color: 0xf3e6d1,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: 0x2b2520,
      roughness: 0.98,
      metalness: 0,
      envMapIntensity: 0.1,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xc09454,
      metalness: 1,
      roughness: 0.34,
      roughnessMap: brassRoughMap,
      envMapIntensity: 1.35,
    }),
    brassDark: new THREE.MeshStandardMaterial({
      color: 0x8d6a3c,
      metalness: 1,
      roughness: 0.46,
      roughnessMap: brassRoughMap,
      envMapIntensity: 1.1,
    }),
    bronze: new THREE.MeshStandardMaterial({ color: 0x6b4f30, metalness: 0.9, roughness: 0.5, envMapIntensity: 0.9 }),
    walnut: new THREE.MeshStandardMaterial({
      map: walnutMap,
      bumpMap: walnutMap,
      bumpScale: 0.004,
      roughness: 0.52,
      metalness: 0,
      envMapIntensity: 0.4,
    }),
    walnutLong: new THREE.MeshStandardMaterial({
      map: walnutMapLong,
      bumpMap: walnutMapLong,
      bumpScale: 0.004,
      roughness: 0.52,
      metalness: 0,
      envMapIntensity: 0.4,
    }),
    stone: new THREE.MeshStandardMaterial({
      map: stonePlinth,
      bumpMap: stonePlinth,
      bumpScale: 0.012,
      roughness: 0.62,
      metalness: 0,
      envMapIntensity: 0.4,
      color: 0xf6eedd,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      map: stoneWall,
      roughness: 0.5,
      metalness: 0.05,
      envMapIntensity: 0.5,
      color: 0xcbbba0,
    }),
    linen: new THREE.MeshStandardMaterial({
      map: linenMap,
      bumpMap: linenMap,
      bumpScale: 0.006,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.18,
      color: 0xf0e7d4,
    }),
    linenCurtain: new THREE.MeshStandardMaterial({
      map: linenCurtain,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      envMapIntensity: 0.25,
      color: 0xefe4cf,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    frost: new THREE.MeshPhysicalMaterial({
      color: 0xf4f7f6,
      transparent: true,
      opacity: 0.34,
      roughness: 0.32,
      metalness: 0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.4,
      envMapIntensity: 1.3,
      side: THREE.DoubleSide,
    }),
    ceramic: new THREE.MeshPhysicalMaterial({
      color: 0xf1e8d6,
      roughness: 0.34,
      metalness: 0,
      clearcoat: 0.7,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.9,
      side: THREE.DoubleSide,
    }),
    ceramicDark: new THREE.MeshPhysicalMaterial({
      color: 0x3b3229,
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.5,
      envMapIntensity: 0.7,
      side: THREE.DoubleSide,
    }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x7d7650, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }),
    stem: new THREE.MeshStandardMaterial({ color: 0x8a7a55, roughness: 0.85, metalness: 0, side: THREE.DoubleSide }),
    glow: new THREE.MeshBasicMaterial({ color: 0xffe6bd, toneMapped: true }),
    glowSoft: new THREE.MeshBasicMaterial({ color: 0xffd9a2, transparent: true, opacity: 0.55 }),
    shadow: new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 }),
    artInk: new THREE.MeshStandardMaterial({ color: 0x3a2f26, roughness: 0.8 }),
  }

  return M
}

/* 공용 지오메트리 만들기 도우미 */
export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function cyl(rTop, rBottom, h, material, seg = 32, open = false) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open), material)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function lathe(points, material, seg = 64) {
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
