import * as THREE from 'three'
import {
  travertineTexture,
  plasterTexture,
  walnutTexture,
  linenTexture,
  brassRoughness,
  contactShadowTexture,
} from './textures.js'

function tex(canvas, rx, ry, aniso, srgb = true) {
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(rx, ry)
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = aniso
  t.needsUpdate = true
  return t
}

export function createMaterials(renderer) {
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const stoneCanvas = travertineTexture(1024)
  const plasterCanvas = plasterTexture(512)
  const walnutCanvas = walnutTexture(1024)
  const linenCanvas = linenTexture(512)
  const brassRoughCanvas = brassRoughness(512)

  const stoneFloor = tex(stoneCanvas, 4, 5.5, aniso)
  const stoneWall = tex(stoneCanvas, 1.4, 1.4, aniso)
  const stonePlinth = tex(stoneCanvas, 1, 1, aniso)
  const plasterWall = tex(plasterCanvas, 6, 2.4, aniso)
  const plasterSoft = tex(plasterCanvas, 2, 2, aniso)
  const walnutMap = tex(walnutCanvas, 1.4, 1, aniso)
  const walnutMapLong = tex(walnutCanvas, 2.6, 1, aniso)
  const linenMap = tex(linenCanvas, 3, 3, aniso)
  const linenCurtain = tex(linenCanvas, 2, 1, aniso)

  const brassRoughMap = tex(brassRoughCanvas, 2, 2, aniso, false)
  const shadowTex = new THREE.CanvasTexture(contactShadowTexture(256))
  shadowTex.colorSpace = THREE.SRGBColorSpace

  const M = {
    floor: new THREE.MeshStandardMaterial({
      map: stoneFloor,
      bumpMap: stoneFloor,
      bumpScale: 0.02,
      roughness: 0.5,
      metalness: 0.03,
      envMapIntensity: 0.35,
      color: 0xd8cab2,
    }),
    wall: new THREE.MeshStandardMaterial({
      map: plasterWall,
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.2,
      color: 0xdccdb6,
    }),
    wallWarm: new THREE.MeshStandardMaterial({
      map: plasterSoft,
      roughness: 0.9,
      metalness: 0,
      envMapIntensity: 0.26,
      color: 0xe4d3b9,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: 0x4f4133,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.12,
      emissive: 0x221a12,
      emissiveIntensity: 0.9,
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
