import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ProductModel, modelSize } from '../three/ProductModel.jsx'
import { calcShipping, discountRate, won } from '../config/catalog.js'
import { buildOrderSummary, copyText, orderLink } from '../lib/order.js'

// ─────────────────────────────────────────────────────────────
// 상품 인스펙터 — 상품을 누르면 평면 사진이 아니라 3D 상품이
// 들려 올라오듯 나타나고, 드래그·터치로 360° 둘러볼 수 있습니다.
// 같은 화면에서 가격·구성·배송·주문까지 이어집니다.
// ─────────────────────────────────────────────────────────────

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function StageScene({ product, view }) {
  const { camera, size } = useThree()
  const group = useRef(null)
  const cameraAim = useRef(new THREE.Vector3())
  const born = useRef(null)

  const H = useMemo(() => modelSize(product), [product])
  const centerY = H.h * 0.52
  const baseR = Math.max(H.h * 2.3, H.w * 2.55, 2.0)

  useEffect(() => {
    camera.fov = size.width < 560 ? 38 : 34
    camera.updateProjectionMatrix()
  }, [camera, size.width])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (born.current === null) born.current = performance.now()
    const elapsed = (performance.now() - born.current) / 1000
    const rise = Math.min(1, elapsed / 0.95)
    const e = 1 - Math.pow(1 - rise, 3)

    const v = view.current
    if (!v.dragging && performance.now() - v.lastInput > 2600) {
      // 손을 떼면 천천히 제자리에서 돌아갑니다 (전시 턴테이블처럼)
      v.targetYaw += dt * 0.42
    }

    const k = 1 - Math.exp(-dt * 9)
    v.yaw += (v.targetYaw - v.yaw) * k
    v.pitch += (v.targetPitch - v.pitch) * k
    v.zoom += (v.targetZoom - v.zoom) * k

    if (group.current) {
      group.current.rotation.y = v.yaw
      group.current.position.y = -0.42 * (1 - e)
      group.current.scale.setScalar(0.88 + 0.12 * e)
    }

    const R = baseR / v.zoom
    const pitch = clamp(v.pitch, -0.3, 0.62)
    camera.position.set(0, centerY + R * Math.sin(pitch) + 0.02, R * Math.cos(pitch))
    cameraAim.current.set(0, centerY, 0)
    camera.lookAt(cameraAim.current)

    if (typeof window !== 'undefined') {
      window.__ALFS_INSPECTOR__ = {
        product: product.id,
        yaw: +v.yaw.toFixed(3),
        pitch: +v.pitch.toFixed(3),
        zoom: +v.zoom.toFixed(3),
        dist: +R.toFixed(3),
        dragging: !!v.dragging,
        drags: v.drags,
        rise: +e.toFixed(3),
      }
    }
  })

  return (
    <group>
      <ambientLight intensity={0.95} color="#fff8ec" />
      <hemisphereLight args={['#fffaf0', '#e6d8c2', 0.85]} />
      <directionalLight position={[3.2, 4.6, 4.2]} intensity={2.1} color="#fff6e4" />
      <directionalLight position={[-4, 2.4, 2.2]} intensity={0.7} color="#f3e8d4" />
      <pointLight position={[0, 0.4, 2.4]} intensity={0.8} distance={6} decay={2} color="#ffeccd" />
      <pointLight position={[0, 2.2, -2.6]} intensity={1.1} distance={7} decay={2} color="#fff3d9" />

      <group ref={group}>
        <ProductModel product={product} />
      </group>

      {/* 받침 그림자 · 골드 링 — 상품이 바닥에서 떠오르는 느낌 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[Math.max(H.w * 0.62, 0.6), 48]} />
        <meshBasicMaterial color="#7a6446" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[Math.max(H.w * 0.6, 0.56), Math.max(H.w * 0.6, 0.56) + 0.012, 64]} />
        <meshBasicMaterial color="#b08d57" transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Stage({ product, onClose }) {
  const view = useRef({
    yaw: -0.42,
    pitch: 0.16,
    zoom: 1,
    targetYaw: -0.42,
    targetPitch: 0.16,
    targetZoom: 1,
    dragging: false,
    drags: 0,
    lastInput: 0,
    pointers: new Map(),
    pinchDist: 0,
    pinchZoom: 1,
  })
  const [hint, setHint] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 6000)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(
    () => () => {
      if (typeof window !== 'undefined') delete window.__ALFS_INSPECTOR__
    },
    [],
  )

  const onPointerDown = (e) => {
    const v = view.current
    v.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture?.(e.pointerId)
    v.dragging = true
    v.lastInput = performance.now()
    if (v.pointers.size === 2) {
      const [a, b] = [...v.pointers.values()]
      v.pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
      v.pinchZoom = v.targetZoom
    }
  }

  const onPointerMove = (e) => {
    const v = view.current
    const prev = v.pointers.get(e.pointerId)
    if (!prev) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    v.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    v.lastInput = performance.now()

    if (v.pointers.size === 2) {
      const [a, b] = [...v.pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (v.pinchDist > 4) v.targetZoom = clamp(v.pinchZoom * (dist / v.pinchDist), 0.62, 2.4)
      return
    }

    if (Math.abs(dx) + Math.abs(dy) < 1) return
    v.targetYaw -= dx * 0.0088
    v.targetPitch = clamp(v.targetPitch + dy * 0.0045, -0.3, 0.62)
    v.drags += 1
  }

  const endPointer = (e) => {
    const v = view.current
    v.pointers.delete(e.pointerId)
    if (v.pointers.size < 2) v.pinchDist = 0
    if (v.pointers.size === 0) v.dragging = false
  }

  const onWheel = (e) => {
    e.preventDefault()
    const v = view.current
    v.lastInput = performance.now()
    v.targetZoom = clamp(v.targetZoom - e.deltaY * 0.0016, 0.62, 2.4)
  }

  return (
    <div
      className="inspector__stage"
      data-testid="product-3d-stage"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onWheel={onWheel}
      role="img"
      aria-label={`${product.name} 3D 입체 보기 — 드래그해 360도 회전`}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.1, 4.4], fov: 34, near: 0.1, far: 40 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <StageScene product={product} view={view} />
      </Canvas>

      <span className="inspector__tag">3D 입체 보기</span>
      <button type="button" className="inspector__x" onClick={onClose} aria-label="닫기" data-testid="product-close-mobile">
        ✕
      </button>
      <span className={`inspector__hint ${hint ? 'is-on' : ''}`}>드래그해서 360° 둘러보기 · 두 손가락으로 확대</span>
      <span className="inspector__rotate" aria-hidden="true">
        ↻
      </span>
    </div>
  )
}

export function ProductInspector({ product, partner, onClose, onAsk, onGo }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!product) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, onClose])

  if (!product) return null

  const { fee } = calcShipping([{ product, qty: 1 }])
  const rate = discountRate(product)

  const copy = async () => {
    const ok = await copyText(buildOrderSummary({ product, partner }))
    setCopied(ok)
    window.setTimeout(() => setCopied(false), 2400)
  }

  return (
    <div className="inspector" role="dialog" aria-modal="true" aria-label={`${product.name} 상세 · 3D 입체 보기`} data-testid="product-inspector">
      <button type="button" className="inspector__scrim" aria-label="닫기" onClick={onClose} />

      <div className="inspector__panel">
        <Stage product={product} onClose={onClose} />

        <div className="inspector__info">
          <div className="inspector__head">
            <div>
              <span className="badge" style={{ background: partner.accent }}>
                {product.zone === 'mineral' ? '오륜미네랄 존' : '효소세상 존'}
              </span>
              <h2>{product.name}</h2>
              <p className="muted">{product.fullName && product.fullName !== product.name ? product.fullName : product.option}</p>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기" data-testid="product-close">
              ✕
            </button>
          </div>

          <div className="product__price">
            {rate > 0 && <span className="rate">{rate}%</span>}
            <strong>{won(product.price)}</strong>
            {product.listPrice && <s>{won(product.listPrice)}</s>}
            <span className="product__ship">{fee ? `배송비 ${won(fee)}` : '무료배송'}</span>
          </div>

          <p className="product__summary">{product.summary}</p>

          <dl className="facts">
            {product.facts.map(([k, v]) => (
              <div key={k} className="facts__row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="stack">
            <a
              className="btn btn--accent btn--full"
              href={orderLink(product)}
              target="_blank"
              rel="noreferrer"
              data-testid="order-link"
            >
              alfs.kr에서 주문하기 ↗
            </a>
            <div className="row">
              <button type="button" className="btn btn--ghost" onClick={copy} data-testid="copy-order">
                {copied ? '복사했습니다 ✓' : '주문 요약 복사'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => onAsk(`${product.name} 자세히 알려줘`)}>
                서연에게 묻기
              </button>
            </div>
            <button type="button" className="btn btn--link" onClick={() => onGo(product.zone)}>
              진열 위치로 이동 →
            </button>
          </div>

          <p className="fineprint">
            결제·배송·환불은 alfs.kr에서 이뤄집니다. 이 쇼룸은 {partner.name} 지점으로 접속되어 있어 주문 요약에 파트너 코드{' '}
            <b>{partner.attribution}</b> 가 함께 남습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
