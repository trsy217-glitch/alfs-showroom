import * as THREE from 'three'
import { getTextScale } from '../lib/textSize.js'

// ─────────────────────────────────────────────────────────────
// 3D 쇼룸용 캔버스 텍스처 (간판·가격표·바닥 마커·대리석)
//  · 밝은 럭셔리 팔레트: 웜 아이보리 바탕 + 샴페인 골드 + 딥 에스프레소 글자
//  · 글자 크기(보통/크게)에 맞춰 폰트 배율이 바뀌고, 배율별로 따로 캐시합니다.
// ─────────────────────────────────────────────────────────────

const C = {
  paper: '#fffdf8',
  ivory: '#fbf6ea',
  sand: '#f4ecdd',
  line: 'rgba(74,58,40,0.14)',
  ink: '#2c251e',
  inkSoft: '#4a4038',
  muted: '#8a7c6b',
  gold: '#b08d57',
  goldSoft: '#dcc79f',
  goldDeep: '#8c6e3e',
  espresso: '#3b2f26',
}

const cache = new Map()

export const KFONT =
  "'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic','맑은 고딕',system-ui,sans-serif"
export const KFONT_SERIF = "'Cormorant Garamond','Didot','Nanum Myeongjo',Georgia,serif"

const FS = (n) => Math.max(9, Math.round(n * getTextScale()))

export function makeTexture(key, w, h, draw) {
  const k = `${getTextScale()}::${key}`
  if (cache.has(k)) return cache.get(k)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  cache.set(k, tex)
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

// 폭에 맞게 글자를 줄여 그리는 도우미 (넘침 방지)
function fitText(ctx, text, maxWidth, size, weight = 700, family = KFONT) {
  let s = size
  ctx.font = `${weight} ${s}px ${family}`
  while (ctx.measureText(text).width > maxWidth && s > 14) {
    s -= 2
    ctx.font = `${weight} ${s}px ${family}`
  }
  return s
}

// 종이 카드 바탕 (아이보리 + 골드 헤어라인)
function paperCard(ctx, w, h, radius = 22) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#fffefb')
  g.addColorStop(1, '#f8f1e3')
  ctx.fillStyle = g
  roundRect(ctx, 0, 0, w, h, radius)
  ctx.fill()
  ctx.strokeStyle = 'rgba(176,141,87,0.42)'
  ctx.lineWidth = 3
  ctx.stroke()
}

// 큰 간판: 상호 · 지점 · 슬로건
export function signTexture({ key, brand, title, sub, accent, theme = 'light' }) {
  return makeTexture(key, 1400, 400, (ctx, w, h) => {
    const dark = theme === 'dark'
    const bg = ctx.createLinearGradient(0, 0, w, h)
    if (dark) {
      bg.addColorStop(0, '#3b2f26')
      bg.addColorStop(0.55, '#4c3c2d')
      bg.addColorStop(1, '#2f261e')
    } else {
      bg.addColorStop(0, '#fffdf8')
      bg.addColorStop(1, '#f6ecdb')
    }
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)

    // 좌측 포인트 바
    ctx.fillStyle = accent || C.gold
    roundRect(ctx, 44, 72, 8, h - 144, 4)
    ctx.fill()

    // 상단 작은 라벨
    ctx.fillStyle = dark ? C.goldSoft : C.goldDeep
    ctx.font = `600 ${FS(32)}px ${KFONT}`
    ctx.textBaseline = 'middle'
    ctx.fillText(brand, 84, 104)

    // 메인 타이틀
    ctx.fillStyle = dark ? '#fdf7ea' : C.ink
    fitText(ctx, title, w - 170, FS(104), 700)
    ctx.fillText(title, 80, 208)

    // 서브
    if (sub) {
      ctx.fillStyle = dark ? 'rgba(247,238,222,0.78)' : C.muted
      ctx.font = `500 ${FS(40)}px ${KFONT}`
      ctx.fillText(sub, 84, 306)
    }

    // 하단 골드 헤어라인
    ctx.fillStyle = dark ? 'rgba(220,199,159,0.65)' : 'rgba(176,141,87,0.55)'
    ctx.fillRect(84, h - 52, w - 168, 3)
  })
}

// 안내 패널: 제목 + 여러 줄 (인사말·고지)
export function panelTexture({ key, title, lines = [], accent = C.gold, footer, theme = 'light', titleSize = 62, lineSize = 40 }) {
  return makeTexture(key, 1400, 620, (ctx, w, h) => {
    const dark = theme === 'dark'
    if (dark) {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#3b2f26')
      g.addColorStop(1, '#2c241c')
      ctx.fillStyle = g
      roundRect(ctx, 0, 0, w, h, 26)
      ctx.fill()
    } else {
      paperCard(ctx, w, h, 26)
    }

    ctx.fillStyle = accent
    roundRect(ctx, 44, 46, 10, 54, 5)
    ctx.fill()

    ctx.fillStyle = dark ? '#fdf7ea' : C.ink
    fitText(ctx, title, w - 140, FS(titleSize), 700)
    ctx.textBaseline = 'middle'
    ctx.fillText(title, 76, 76)

    let size = FS(lineSize)
    ctx.fillStyle = dark ? '#e8dcc6' : C.inkSoft
    ctx.font = `500 ${size}px ${KFONT}`
    let rows = []
    for (const raw of lines) for (const l of wrap(ctx, raw, w - 150)) rows.push(l)
    // 넘치면 한 단계 줄여서 다시 배치합니다
    const limit = h - (footer ? 190 : 90)
    while (176 + rows.length * size * 1.42 > limit && size > 18) {
      size -= 2
      ctx.font = `500 ${size}px ${KFONT}`
      rows = []
      for (const raw of lines) for (const l of wrap(ctx, raw, w - 150)) rows.push(l)
    }
    let y = 176
    for (const l of rows) {
      ctx.fillText(l, 66, y)
      y += size * 1.42
    }

    if (footer) {
      ctx.font = `600 ${FS(32)}px ${KFONT}`
      ctx.fillStyle = dark ? C.goldSoft : C.goldDeep
      ctx.fillText(footer, 66, h - 60)
    }
  })
}

// 진열대 이름표: 상품명 + 가격
export function plaqueTexture({ key, name, price, note, accent = C.gold }) {
  return makeTexture(key, 900, 320, (ctx, w, h) => {
    paperCard(ctx, w, h, 22)

    ctx.fillStyle = accent
    roundRect(ctx, 0, 0, 12, h, 6)
    ctx.fill()

    ctx.textBaseline = 'middle'
    ctx.fillStyle = C.ink
    fitText(ctx, name, w - 110, FS(64), 700)
    ctx.fillText(name, 50, 92)

    ctx.fillStyle = C.goldDeep
    fitText(ctx, price, w - 110, FS(58), 700)
    ctx.fillText(price, 50, 186)

    if (note) {
      ctx.fillStyle = C.muted
      fitText(ctx, note, w - 110, FS(36), 500)
      ctx.fillText(note, 50, 258)
    }
  })
}

// 병 라벨 (제품 3D 병 앞면에 붙는 작은 라벨)
export function bottleLabelTexture({ key, name, volume, accent = C.gold, drop = true }) {
  return makeTexture(key, 512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#fffdf8'
    roundRect(ctx, 0, 0, w, h, 26)
    ctx.fill()
    ctx.strokeStyle = 'rgba(176,141,87,0.4)'
    ctx.lineWidth = 4
    ctx.stroke()

    if (drop) {
      ctx.beginPath()
      ctx.moveTo(w / 2, 96)
      ctx.bezierCurveTo(w / 2 + 74, 176, w / 2 + 62, 268, w / 2, 278)
      ctx.bezierCurveTo(w / 2 - 62, 268, w / 2 - 74, 176, w / 2, 96)
      ctx.closePath()
      const g = ctx.createLinearGradient(0, 90, 0, 280)
      g.addColorStop(0, '#e6d3a8')
      g.addColorStop(1, '#b08d57')
      ctx.fillStyle = g
      ctx.fill()
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = C.ink
    fitText(ctx, name, w - 60, FS(66), 700)
    ctx.fillText(name, w / 2, 388)
    ctx.fillStyle = accent
    ctx.font = `600 ${FS(46)}px ${KFONT}`
    ctx.fillText(volume, w / 2, 470)
    ctx.fillStyle = C.muted
    ctx.font = `500 ${FS(30)}px ${KFONT_SERIF}`
    ctx.fillText('AL.F.S', w / 2, 552)
    ctx.textAlign = 'left'
  })
}

// 바닥 이동 마커: 번호 + 이름 (투명 배경)
export function markerTexture({ key, number, label, accent = C.gold }) {
  return makeTexture(key, 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2

    ctx.beginPath()
    ctx.arc(cx, cy, 236, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,253,248,0.94)'
    ctx.fill()
    ctx.lineWidth = 8
    ctx.strokeStyle = accent
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, 202, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(74,58,40,0.16)'
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = accent
    ctx.font = `700 ${FS(130)}px ${KFONT_SERIF}`
    ctx.fillText(String(number), cx, cy - 56)

    ctx.fillStyle = C.ink
    fitText(ctx, label, 360, FS(44), 600)
    ctx.fillText(label, cx, cy + 82)

    ctx.fillStyle = C.muted
    ctx.font = `500 ${FS(30)}px ${KFONT}`
    ctx.fillText('눌러서 이동', cx, cy + 138)
  })
}

// 크림 대리석 바닥 타일 (얇은 베인 + 미세한 결)
export function floorTexture() {
  return makeTexture('marble-floor', 1024, 1024, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#f7f1e4')
    g.addColorStop(0.5, '#f3ebdb')
    g.addColorStop(1, '#f6efe0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // 대리석 베인
    for (let i = 0; i < 26; i += 1) {
      ctx.beginPath()
      const y0 = Math.random() * h
      ctx.moveTo(-40, y0)
      let y = y0
      for (let x = 0; x <= w + 40; x += 64) {
        y += (Math.random() - 0.5) * 62
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(160,124,74,${0.05 + Math.random() * 0.09})`
      ctx.lineWidth = 1 + Math.random() * 3
      ctx.stroke()
    }

    // 미세한 돌결
    for (let i = 0; i < 900; i += 1) {
      ctx.fillStyle = `rgba(140,120,92,${0.012 + Math.random() * 0.035})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 2.2, 2.2)
    }

    // 타일 줄눈
    ctx.strokeStyle = 'rgba(150,118,72,0.22)'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, w - 4, h - 4)
  })
}

// 벽·전시대 하부의 부드러운 접지 그늘 (위는 투명, 아래는 살짝 어둡게)
export function edgeShadowTexture() {
  return makeTexture('edge-shadow', 64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(74,58,40,0)')
    g.addColorStop(0.55, 'rgba(74,58,40,0.06)')
    g.addColorStop(1, 'rgba(74,58,40,0.20)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// 벽면 대리석 패널
export function wallTexture() {
  return makeTexture('marble-wall', 1024, 1024, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#fdf8ee')
    g.addColorStop(1, '#f5ecdc')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 10; i += 1) {
      ctx.beginPath()
      const x0 = Math.random() * w
      ctx.moveTo(x0, -40)
      let x = x0
      for (let y = 0; y <= h + 40; y += 70) {
        x += (Math.random() - 0.5) * 40
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(176,141,87,${0.02 + Math.random() * 0.04})`
      ctx.lineWidth = 1 + Math.random() * 2
      ctx.stroke()
    }
  })
}

// 부드러운 접지 그림자
export function shadowTexture() {
  return makeTexture('shadow', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(90,74,55,0.30)')
    g.addColorStop(0.5, 'rgba(90,74,55,0.12)')
    g.addColorStop(1, 'rgba(90,74,55,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// 천장 조명 패널 느낌의 부드러운 글로우 (샴페인 빛)
export function glowTexture() {
  return makeTexture('glow', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(247,232,199,0.6)')
    g.addColorStop(0.45, 'rgba(226,206,168,0.24)')
    g.addColorStop(1, 'rgba(226,206,168,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// 키오스크 화면 (시뮬레이터 · 상담 데스크) — 밝은 유리판 위 잉크 글자
export function screenTexture({ key, title, lines = [], accent = C.gold, cta, theme = 'light' }) {
  return makeTexture(key, 900, 1200, (ctx, w, h) => {
    const dark = theme === 'dark'
    if (dark) {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#3b2f26')
      g.addColorStop(1, '#2b231b')
      ctx.fillStyle = g
    } else {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#fffdf8')
      g.addColorStop(1, '#f5ead7')
      ctx.fillStyle = g
    }
    ctx.fillRect(0, 0, w, h)

    if (dark) {
      const g2 = ctx.createLinearGradient(0, 0, w, h)
      g2.addColorStop(0, 'rgba(176,141,87,0.35)')
      g2.addColorStop(1, 'rgba(59,47,38,0)')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, w, h)
    }

    ctx.textBaseline = 'middle'
    ctx.fillStyle = dark ? C.goldSoft : C.goldDeep
    ctx.font = `700 ${FS(34)}px ${KFONT_SERIF}`
    ctx.fillText('AL.F.S  SHOWROOM', 72, 108)

    ctx.fillStyle = dark ? '#fdf7ea' : C.ink
    fitText(ctx, title, w - 150, FS(84), 700)
    let y = 250
    for (const l of wrap(ctx, title, w - 150)) {
      ctx.fillText(l, 72, y)
      y += 96
    }

    ctx.font = `500 ${FS(38)}px ${KFONT}`
    ctx.fillStyle = dark ? 'rgba(247,238,222,0.85)' : C.inkSoft
    y += 20
    for (const line of lines) {
      for (const l of wrap(ctx, line, w - 160)) {
        ctx.fillText(l, 72, y)
        y += 56
      }
      y += 12
    }

    if (cta) {
      const grad = ctx.createLinearGradient(72, 0, w - 72, 0)
      grad.addColorStop(0, C.goldDeep)
      grad.addColorStop(1, C.gold)
      ctx.fillStyle = grad
      roundRect(ctx, 72, h - 230, w - 144, 116, 24)
      ctx.fill()
      ctx.fillStyle = '#fffdf8'
      ctx.font = `700 ${FS(50)}px ${KFONT}`
      ctx.textAlign = 'center'
      ctx.fillText(cta, w / 2, h - 172)
      ctx.textAlign = 'left'
    }
  })
}

// 상담 직원 말풍선 (아이보리 카드 + 골드 테두리)
export function bubbleTexture({ key, title, lines = [], accent = C.gold }) {
  return makeTexture(key, 900, 460, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#fffefb')
    g.addColorStop(1, '#f8efdd')
    ctx.fillStyle = g
    roundRect(ctx, 12, 12, w - 24, h - 90, 42)
    ctx.fill()
    ctx.strokeStyle = 'rgba(176,141,87,0.55)'
    ctx.lineWidth = 5
    ctx.stroke()

    // 꼬리
    ctx.beginPath()
    ctx.moveTo(w / 2 - 44, h - 80)
    ctx.lineTo(w / 2, h - 16)
    ctx.lineTo(w / 2 + 44, h - 80)
    ctx.closePath()
    ctx.fillStyle = '#f9f1e1'
    ctx.fill()
    ctx.strokeStyle = 'rgba(176,141,87,0.55)'
    ctx.lineWidth = 5
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = accent
    ctx.font = `700 ${FS(40)}px ${KFONT}`
    ctx.fillText(title, w / 2, 104)

    ctx.fillStyle = C.ink
    ctx.font = `600 ${FS(46)}px ${KFONT}`
    let y = 196
    for (const line of lines) {
      for (const l of wrap(ctx, line, w - 130)) {
        ctx.fillText(l, w / 2, y)
        y += 62
      }
    }
    ctx.textAlign = 'left'
  })
}

// 상담 직원 이름표
export function staffBadgeTexture({ key, name, role, accent = C.gold }) {
  return makeTexture(key, 900, 300, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#3b2f26')
    g.addColorStop(1, '#5a462f')
    ctx.fillStyle = g
    roundRect(ctx, 8, 8, w - 16, h - 16, 30)
    ctx.fill()
    ctx.strokeStyle = 'rgba(220,199,159,0.75)'
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.textBaseline = 'middle'
    const nameSize = fitText(ctx, name, 420, FS(86), 700)
    ctx.fillStyle = '#fdf7ea'
    ctx.fillText(name, 44, 120)

    ctx.fillStyle = C.goldSoft
    ctx.font = `600 ${FS(40)}px ${KFONT}`
    ctx.fillText(role, 50, 210)

    ctx.fillStyle = 'rgba(220,199,159,0.9)'
    ctx.font = `700 ${FS(38)}px ${KFONT}`
    ctx.textAlign = 'right'
    ctx.fillText('눌러서 상담', w - 46, 168)
    ctx.textAlign = 'left'
    void nameSize
  })
}

export function disposeTextures() {
  for (const tex of cache.values()) tex.dispose()
  cache.clear()
}
