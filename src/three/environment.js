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

export function createStage(container, opts = {}) {
  // ?pb=1 — QA 스크린샷용 (drawing buffer 보존). 일반 방문에는 영향 없음.
  const preserve = new URLSearchParams(window.location.search).get('pb') === '1'
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false,
    preserveDrawingBuffer: preserve,
  })
  const mobile = window.matchMedia('(max-width: 900px)').matches
  const quality = opts.quality || (mobile ? 'low' : 'high')
  const shadows = quality !== 'low'
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'low' ? 1.35 : 2))
  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.88
  renderer.shadowMap.enabled = shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x14110d)
  scene.fog = new THREE.FogExp2(0x1a1510, 0.006)

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120)
  camera.position.set(0.9, 3.35, 9)
  camera.lookAt(0, 1.5, -5)

  scene.environment = buildEnvironment(renderer)
  scene.environmentIntensity = 0.3

  /* ---------- 빛 ---------- */
  const hemi = new THREE.HemisphereLight(0xffeeda, 0x2b2219, 0.15)
  scene.add(hemi)

  const spotDefs = [
    // 오륜미네랄 (그림자)
    { pos: [-3.4, 3.95, -3.6], target: [-5.85, 1.35, -4.9], angle: 0.48, penumbra: 0.5, intensity: 165, shadow: true, key: true },
    // 효소세상 (그림자)
    { pos: [3.6, 3.9, -3.8], target: [5.2, 1.25, -5.2], angle: 0.6, penumbra: 0.5, intensity: 200, shadow: true, key: true },
    // 브랜드 월 + 센터
    { pos: [0, 3.9, -3.8], target: [0, 1.7, -8.6], angle: 0.5, penumbra: 0.55, intensity: 165, shadow: false, key: true },
    // 라운지 · B2B 보드
    { pos: [4.3, 3.7, 2.4], target: [4.3, 1.1, 1.9], angle: 0.72, penumbra: 0.55, intensity: 140, shadow: true, key: true },
    // 센터 테이블
    { pos: [-1.0, 3.8, -0.2], target: [-1.25, 0.7, -0.95], angle: 0.42, penumbra: 0.55, intensity: 95, shadow: false, key: true },
  ]

  const spots = []
  for (const d of spotDefs) {
    if (quality === 'low' && !d.key) continue
    const s = new THREE.SpotLight(0xffdcb0, d.intensity, 0, d.angle, d.penumbra, 2)
    s.position.set(...d.pos)
    s.target.position.set(...d.target)
    scene.add(s.target)
    s.castShadow = shadows && d.shadow
    if (s.castShadow) {
      s.shadow.mapSize.set(1024, 1024)
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
    camera.fov = aspect < 0.8 ? 54 : aspect < 1.25 ? 52 : 46
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.8 : 2))
  }
  resize()

  return { renderer, scene, camera, resize, spots, mobile, quality }
}
