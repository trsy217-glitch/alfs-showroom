import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/* 스튜디오 환경맵 — 따뜻한 반사광을 만듭니다. */
function buildEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  const room = new RoomEnvironment()
  const rt = pmrem.fromScene(room, 0.04)
  pmrem.dispose()
  room.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose()
      if (o.material) o.material.dispose()
    }
  })
  return rt.texture
}

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false,
  })
  const mobile = window.matchMedia('(max-width: 900px)').matches
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.8 : 2))
  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x14110d)
  scene.fog = new THREE.FogExp2(0x1a1510, 0.006)

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120)
  camera.position.set(0.9, 3.35, 9)
  camera.lookAt(0, 1.5, -5)

  scene.environment = buildEnvironment(renderer)
  scene.environmentIntensity = 0.26

  /* ---------- 빛 ---------- */
  const hemi = new THREE.HemisphereLight(0xffeeda, 0x2c241c, 0.16)
  scene.add(hemi)

  const spotDefs = [
    // 오륜미네랄
    { pos: [-4.5, 3.95, -5.0], target: [-6.85, 1.2, -6.2], angle: 0.3, penumbra: 0.55, intensity: 210, shadow: true },
    // 효소세상
    { pos: [4.7, 3.95, -4.2], target: [6.9, 1.15, -5.6], angle: 0.3, penumbra: 0.55, intensity: 230, shadow: true },
    // B2B 보드
    { pos: [5.3, 3.7, 1.8], target: [7.0, 1.85, 2.2], angle: 0.36, penumbra: 0.7, intensity: 150, shadow: false },
    // 브랜드 월
    { pos: [0, 3.95, -6.6], target: [0, 2.1, -10.4], angle: 0.34, penumbra: 0.7, intensity: 200, shadow: false },
    // 라운지 테이블
    { pos: [4.0, 3.9, 1.8], target: [4.0, 0.75, 1.8], angle: 0.46, penumbra: 0.85, intensity: 150, shadow: true },
    // 로비 페데스탈
    { pos: [-2.3, 3.9, 4.4], target: [-2.3, 0.95, 4.4], angle: 0.44, penumbra: 0.8, intensity: 130, shadow: true },
    // 아트 벽감
    { pos: [-5.4, 3.8, 1.6], target: [-7.0, 1.75, 1.6], angle: 0.32, penumbra: 0.8, intensity: 110, shadow: false },
    // 벽 워시 — 왼쪽
    { pos: [-4.2, 3.6, -1.0], target: [-6.4, 1.6, -1.4], angle: 0.75, penumbra: 1, intensity: 70, shadow: false },
    // 벽 워시 — 오른쪽
    { pos: [4.2, 3.6, 0.4], target: [6.4, 1.6, 0.6], angle: 0.75, penumbra: 1, intensity: 70, shadow: false },
  ]

  const spots = []
  for (const d of spotDefs) {
    const s = new THREE.SpotLight(0xffdcb0, d.intensity, 0, d.angle, d.penumbra, 2)
    s.position.set(...d.pos)
    s.target.position.set(...d.target)
    scene.add(s.target)
    s.castShadow = d.shadow
    if (d.shadow) {
      s.shadow.mapSize.set(mobile ? 1024 : 1536, mobile ? 1024 : 1536)
      s.shadow.bias = -0.0009
      s.shadow.normalBias = 0.022
      s.shadow.camera.near = 0.6
      s.shadow.camera.far = 11
      s.shadow.radius = 3
    }
    scene.add(s)
    spots.push(s)
  }

  // 벽을 살짝 훑는 필 라이트
  const key = new THREE.DirectionalLight(0xffe8c9, 0.1)
  key.position.set(-4, 6, 8)
  scene.add(key)

  function resize() {
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.fov = aspect < 0.8 ? 62 : aspect < 1.25 ? 52 : 46
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.8 : 2))
  }
  resize()

  return { renderer, scene, camera, resize, spots, mobile }
}
