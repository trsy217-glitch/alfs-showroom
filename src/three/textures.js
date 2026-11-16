import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
// 3D 쇼룸에 쓰는 캔버스 텍스처 (한글 간판·가격표·바닥 마커)
// 외부 폰트 파일을 내려받지 않아 첫 로딩이 가볍습니다.
// ─────────────────────────────────────────────────────────────

const cache = new Map()

export const KFONT =
  "'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic','맑은 고딕',system-ui,sans-serif"

export function makeTexture(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  cache.set(key, tex)
  return tex
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrap(ctx, text, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

// 큰 간판: 상호 · 지점 · 슬로건
export function signTexture({ key, brand, title, sub, accent, theme = 'light' }) {
  return makeTexture(key, 1400, 400, (ctx, w, h) => {
    const dark = theme === 'dark'
    ctx.fillStyle = dark ? '#0b1a1f' : '#fbfcfd'
    ctx.fillRect(0, 0, w, h)

    // 좌측 포인트 바
    ctx.fillStyle = accent
    roundRect(ctx, 44, 60, 10, h - 120, 5)
    ctx.fill()

    // 상단 작은 라벨
    ctx.fillStyle = accent
    ctx.font = `600 40px ${KFONT}`
    ctx.textBaseline = 'middle'
    ctx.fillText(brand, 92, 106)

    // 메인 타이틀
    ctx.fillStyle = dark ? '#f8fafc' : '#0f172a'
    ctx.font = `700 118px ${KFONT}`
    ctx.fillText(title, 88, 208)

    // 서브
    if (sub) {
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.font = `500 44px ${KFONT}`
      ctx.fillText(sub, 92, 306)
    }
  })
}

// 안내 패널: 제목 + 여러 줄 (인사말·고지)
export function panelTexture({ key, title, lines = [], accent = '#0f766e', footer, theme = 'light', titleSize = 62, lineSize = 40 }) {
  return makeTexture(key, 1400, 620, (ctx, w, h) => {
    const dark = theme === 'dark'
    ctx.fillStyle = dark ? '#0a1418' : '#ffffff'
    roundRect(ctx, 0, 0, w, h, 26)
    ctx.fill()
    ctx.strokeStyle = dark ? 'rgba(148,163,184,0.35)' : 'rgba(15,23,42,0.10)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = accent
    roundRect(ctx, 44, 46, 12, 54, 6)
    ctx.fill()

    ctx.fillStyle = dark ? '#f8fafc' : '#0f172a'
    ctx.font = `700 ${titleSize}px ${KFONT}`
    ctx.textBaseline = 'middle'
    ctx.fillText(title, 78, 76)

    ctx.font = `500 ${lineSize}px ${KFONT}`
    ctx.fillStyle = dark ? '#cbd5e1' : '#334155'
    let y = 176
    for (const raw of lines) {
      for (const l of wrap(ctx, raw, w - 140)) {
        ctx.fillText(l, 66, y)
        y += lineSize * 1.42
      }
      y += 6
    }

    if (footer) {
      ctx.font = `600 34px ${KFONT}`
      ctx.fillStyle = accent
      ctx.fillText(footer, 66, h - 60)
    }
  })
}

// 진열대 이름표: 상품명 + 가격
export function plaqueTexture({ key, name, price, note, accent = '#0f766e' }) {
  return makeTexture(key, 900, 320, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, 0, 0, w, h, 22)
    ctx.fill()
    ctx.strokeStyle = 'rgba(15,23,42,0.10)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = accent
    roundRect(ctx, 0, 0, 14, h, 8)
    ctx.fill()

    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#0f172a'
    ctx.font = `700 66px ${KFONT}`
    ctx.fillText(name, 52, 96)

    ctx.fillStyle = accent
    ctx.font = `700 60px ${KFONT}`
    ctx.fillText(price, 52, 190)

    if (note) {
      ctx.fillStyle = '#64748b'
      ctx.font = `500 38px ${KFONT}`
      ctx.fillText(note, 52, 262)
    }
  })
}

// 병 라벨 (제품 3D 병 앞면에 붙는 작은 라벨)
  export function bottleLabelTexture({ key, name, volume, accent = '#0e7490', drop = true }) {
    return makeTexture(key, 512, 640, (ctx, w, h) => {
      ctx.fillStyle = '#f8fbf8'
      roundRect(ctx, 0, 0, w, h, 26)
      ctx.fill()
      ctx.strokeStyle = 'rgba(15,23,42,0.08)'
      ctx.lineWidth = 4
      ctx.stroke()

      if (drop) {
        ctx.beginPath()
        ctx.moveTo(w / 2, 96)
        ctx.bezierCurveTo(w / 2 + 74, 176, w / 2 + 62, 268, w / 2, 278)
        ctx.bezierCurveTo(w / 2 - 62, 268, w / 2 - 74, 176, w / 2, 96)
        ctx.closePath()
        const g = ctx.createLinearGradient(0, 90, 0, 280)
        g.addColorStop(0, '#7dd3fc')
        g.addColorStop(1, '#0369a1')
        ctx.fillStyle = g
        ctx.fill()
      }

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#0f172a'
      ctx.font = `700 74px ${KFONT}`
      ctx.fillText(name, w / 2, 388)
      ctx.fillStyle = accent
      ctx.font = `600 48px ${KFONT}`
      ctx.fillText(volume, w / 2, 470)
      ctx.fillStyle = '#94a3b8'
      ctx.font = `500 34px ${KFONT}`
      ctx.fillText('AL.F.S', w / 2, 552)
      ctx.textAlign = 'left'
    })
  }

  // 바닥 이동 마커: 번호 + 이름 (투명 배경)
export function markerTexture({ key, number, label, accent = '#0f766e' }) {
  return makeTexture(key, 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2

    ctx.beginPath()
    ctx.arc(cx, cy, 236, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fill()
    ctx.lineWidth = 10
    ctx.strokeStyle = accent
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, 200, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(15,23,42,0.14)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = accent
    ctx.font = `700 150px ${KFONT}`
    ctx.fillText(String(number), cx, cy - 52)

    ctx.fillStyle = '#0f172a'
    ctx.font = `600 46px ${KFONT}`
    ctx.fillText(label, cx, cy + 84)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `500 34px ${KFONT}`
    ctx.fillText('눌러서 이동', cx, cy + 140)
  })
}

// 부드러운 접지 그림자
export function floorTexture() {
  return makeTexture('floor-tile', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#eaeff3'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(148,163,184,0.28)'
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3)
    for (let i = 0; i < 260; i += 1) {
      ctx.fillStyle = `rgba(100,116,139,${0.02 + Math.random() * 0.05})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3)
    }
  })
}

// 부드러운 접지 그림자
export function shadowTexture() {
  return makeTexture('shadow', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(15,23,42,0.30)')
    g.addColorStop(0.5, 'rgba(15,23,42,0.12)')
    g.addColorStop(1, 'rgba(15,23,42,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// 천장 조명 패널 느낌의 부드러운 글로우
export function glowTexture() {
  return makeTexture('glow', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(94,234,212,0.55)')
    g.addColorStop(0.45, 'rgba(34,211,238,0.20)')
    g.addColorStop(1, 'rgba(34,211,238,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// 키오스크 화면 (시뮬레이터 · 상담 데스크)
export function screenTexture({ key, title, lines = [], accent = '#0f766e', cta }) {
  return makeTexture(key, 900, 1200, (ctx, w, h) => {
    ctx.fillStyle = '#08131a'
    ctx.fillRect(0, 0, w, h)

    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, 'rgba(15,118,110,0.55)')
    g.addColorStop(1, 'rgba(8,19,26,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#5eead4'
    ctx.font = `700 44px ${KFONT}`
    ctx.fillText('AL.F.S SHOWROOM', 72, 110)

    ctx.fillStyle = '#f8fafc'
    ctx.font = `700 92px ${KFONT}`
    let y = 250
    for (const l of wrap(ctx, title, w - 150)) {
      ctx.fillText(l, 72, y)
      y += 104
    }

    ctx.font = `500 44px ${KFONT}`
    ctx.fillStyle = '#cbd5e1'
    y += 24
    for (const line of lines) {
      for (const l of wrap(ctx, line, w - 160)) {
        ctx.fillText(l, 72, y)
        y += 62
      }
      y += 14
    }

    if (cta) {
      ctx.fillStyle = accent
      roundRect(ctx, 72, h - 230, w - 144, 118, 26)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = `700 56px ${KFONT}`
      ctx.textAlign = 'center'
      ctx.fillText(cta, w / 2, h - 170)
      ctx.textAlign = 'left'
    }
  })
}

export function disposeTextures() {
  for (const tex of cache.values()) tex.dispose()
  cache.clear()
}
