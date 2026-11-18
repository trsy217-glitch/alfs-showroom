import * as THREE from 'three'
import { getTextScale } from '../lib/textSize.js'

// ─────────────────────────────────────────────────────────────
// 3D 쇼룸용 캔버스 텍스처 (간판·가격표·바닥 마커·대리석)
//  · 밝은 럭셔리 팔레트: 웜 아이보리 바탕 + 샴페인 골드 + 딥 에스프레소 글자
//  · 글자 크기(보통/크게)에 맞춰 폰트 배율이 바뀌고, 배율별로 따로 캐시합니다.
// ─────────────────────────────────────────────────────────────

const C = {
  paper: '#fffdf7',
  ivory: '#fbf5e8',
  sand: '#f3ead9',
  line: 'rgba(80,62,42,0.14)',
  ink: '#2f2822',
  inkSoft: '#4b4038',
  muted: '#8b7d6c',
  gold: '#a8854f',
  goldSoft: '#dcc7a1',
  goldDeep: '#86683c',
  espresso: '#3a3027',
}

const cache = new Map()
let cacheScale = getTextScale()

// 글자 크기가 바뀌면 이전 배율로 만든 텍스처는 더 이상 쓰이지 않습니다.
// (캐시에 두 배로 쌓여 GPU 메모리를 잡아먹지 않도록 정리합니다)
function syncScale() {
  const scale = getTextScale()
  if (scale !== cacheScale) {
    for (const tex of cache.values()) tex.dispose()
    cache.clear()
    cacheScale = scale
  }
}

export const KFONT =
  "'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic','맑은 고딕',system-ui,sans-serif"
export const KFONT_SERIF = "'Cormorant Garamond','Didot','Nanum Myeongjo',Georgia,serif"

const FS = (n) => Math.max(9, Math.round(n * getTextScale()))

export function makeTexture(key, w, h, draw) {
  syncScale()
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

// 3D 인스펙터용 제품 라벨 — 병 띠 · 박스 앞면 · 파우치에 공통으로 씁니다
export function productPackTexture({ key, name, volume, note, accent = C.gold, brand = 'AL.F.S', theme = 'light' }) {
  return makeTexture(key, 1024, 1024, (ctx, w, h) => {
    const bg = theme === 'light' ? '#fffdf7' : '#2f2822'
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)

    // 위쪽 브랜드 띠
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, accent)
    g.addColorStop(1, 'rgba(176,141,87,0.55)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, 118)
    ctx.fillStyle = '#fffdf7'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${FS(52)}px ${KFONT}`
    ctx.fillText(brand, 62, 60)
    ctx.textAlign = 'right'
    ctx.font = `500 ${FS(32)}px ${KFONT_SERIF}`
    ctx.fillText('VIRTUAL SHOWROOM', w - 62, 60)

    // 제품명
    ctx.textAlign = 'center'
    ctx.fillStyle = theme === 'light' ? C.ink : '#fff9ee'
    const size = fitText(ctx, name, w - 190, FS(96), 700)
    ctx.font = `700 ${size}px ${KFONT}`
    ctx.fillText(name, w / 2, 360)

    // 골드 헤어라인
    ctx.strokeStyle = accent
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(w * 0.28, 430)
    ctx.lineTo(w * 0.72, 430)
    ctx.stroke()

    // 용량
    if (volume) {
      ctx.fillStyle = accent
      fitText(ctx, volume, w - 220, FS(58), 700)
      ctx.fillText(volume, w / 2, 510)
    }

    // 설명 두 줄
    if (note) {
      ctx.fillStyle = theme === 'light' ? C.muted : '#e8dcc6'
      const lines = String(note).split('\n')
      lines.forEach((line, i) => {
        ctx.font = `500 ${FS(34)}px ${KFONT}`
        ctx.fillText(line, w / 2, 640 + i * 52)
      })
    }

    // 아래쪽 표시
    ctx.fillStyle = theme === 'light' ? C.goldDeep : C.goldSoft
    ctx.font = `600 ${FS(30)}px ${KFONT_SERIF}`
    ctx.fillText('오륜미네랄 · 효소세상', w / 2, h - 96)

    ctx.strokeStyle = 'rgba(176,141,87,0.45)'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, w - 8, h - 8)
    ctx.textAlign = 'left'
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

// ─────────────────────────────────────────────────────────────
// 우드 · 크림 라운지 톤을 위한 재질 텍스처 (2026-11-17 재구축)
// ─────────────────────────────────────────────────────────────

// 바닥 — 밝은 내추럴 오크 플랭크 (결 방향은 z축)
export function oakFloorTexture() {
  return makeTexture('oak-floor', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#cfae86'
    ctx.fillRect(0, 0, w, h)
    const cols = 4
    const pw = w / cols
    for (let c = 0; c < cols; c += 1) {
      const x0 = c * pw
      // 플랭크 한 장의 기본 색
      const base = 0.92 + Math.random() * 0.12
      ctx.fillStyle = `rgba(${Math.round(202 * base)},${Math.round(180 * base)},${Math.round(150 * base)},1)`
      ctx.fillRect(x0, 0, pw, h)
      // 결
      for (let i = 0; i < 26; i += 1) {
        const x = x0 + 6 + Math.random() * (pw - 12)
        ctx.beginPath()
        ctx.moveTo(x, -20)
        let xx = x
        for (let y = 0; y <= h + 20; y += 48) {
          xx += (Math.random() - 0.5) * 7
          ctx.lineTo(xx, y)
        }
        ctx.strokeStyle = `rgba(132,108,80,${0.035 + Math.random() * 0.06})`
        ctx.lineWidth = 0.7 + Math.random() * 1.6
        ctx.stroke()
      }
      // 옹이
      for (let i = 0; i < 2; i += 1) {
        const kx = x0 + 20 + Math.random() * (pw - 40)
        const ky = Math.random() * h
        const r = 5 + Math.random() * 9
        const g = ctx.createRadialGradient(kx, ky, 1, kx, ky, r)
        g.addColorStop(0, 'rgba(120,84,50,0.5)')
        g.addColorStop(1, 'rgba(120,84,50,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(kx, ky, r, 0, 7)
        ctx.fill()
      }
      // 이음선
      ctx.fillStyle = 'rgba(120,96,68,0.42)'
      ctx.fillRect(x0 - 1.2, 0, 2.4, h)
      ctx.fillStyle = 'rgba(255,248,236,0.14)'
      ctx.fillRect(x0 + 2, 0, 1.4, h)
    }
    // 플랭크 끝 이음 (번갈아)
    for (let c = 0; c < cols; c += 1) {
      const y = ((c * 0.37 + 0.15) % 1) * h
      ctx.fillStyle = 'rgba(112,82,52,0.4)'
      ctx.fillRect(c * pw, y, pw, 3)
    }
    // 전체 미세 결
    for (let i = 0; i < 1400; i += 1) {
      ctx.fillStyle = `rgba(120,90,60,${0.01 + Math.random() * 0.03})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 3 + Math.random() * 6)
    }
  })
}

// 벽 — 크림 미장(플라스터)
export function plasterTexture() {
  return makeTexture('plaster', 512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#f7efe2')
    g.addColorStop(0.55, '#f2e8d9')
    g.addColorStop(1, '#ece0ce')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 5200; i += 1) {
      const a = 0.012 + Math.random() * 0.03
      ctx.fillStyle = Math.random() < 0.5 ? `rgba(255,252,244,${a})` : `rgba(150,128,102,${a * 0.8})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.4, 1 + Math.random() * 2.4)
    }
  })
}

// 오크 목재 (세로 결) — 가구·선반·패널
export function oakGrainTexture() {
  return makeTexture('oak-grain', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#cba97e'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 70; i += 1) {
      const x = Math.random() * w
      ctx.beginPath()
      ctx.moveTo(x, -10)
      let xx = x
      for (let y = 0; y <= h + 10; y += 40) {
        xx += (Math.random() - 0.5) * 6
        ctx.lineTo(xx, y)
      }
      ctx.strokeStyle = `rgba(140,104,66,${0.05 + Math.random() * 0.1})`
      ctx.lineWidth = 0.6 + Math.random() * 1.8
      ctx.stroke()
    }
    for (let i = 0; i < 2000; i += 1) {
      ctx.fillStyle = `rgba(255,244,226,${0.02 + Math.random() * 0.05})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 2.6)
    }
  })
}

// 트라버틴 계열 베이지 스톤 (상판)
export function stoneTexture() {
  return makeTexture('stone', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#eee5d6'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 90; i += 1) {
      const x = Math.random() * w
      const y = Math.random() * h
      const r = 8 + Math.random() * 60
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(206,188,163,${0.1 + Math.random() * 0.16})`)
      g.addColorStop(1, 'rgba(206,188,163,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 7)
      ctx.fill()
    }
    for (let i = 0; i < 40; i += 1) {
      ctx.strokeStyle = `rgba(176,154,126,${0.06 + Math.random() * 0.1})`
      ctx.lineWidth = 0.8 + Math.random() * 1.4
      ctx.beginPath()
      ctx.moveTo(Math.random() * w, Math.random() * h)
      ctx.lineTo(Math.random() * w, Math.random() * h)
      ctx.stroke()
    }
  })
}

// 크림 린넨 패브릭 (소파·쿠션)
export function linenTexture() {
  return makeTexture('linen', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#e8dcc6'
    ctx.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = `rgba(255,250,238,${0.16 + Math.random() * 0.1})`
      ctx.fillRect(0, y, w, 1.4)
    }
    for (let x = 0; x < w; x += 3) {
      ctx.fillStyle = `rgba(190,170,140,${0.06 + Math.random() * 0.08})`
      ctx.fillRect(x, 0, 1.2, h)
    }
    for (let i = 0; i < 1500; i += 1) {
      ctx.fillStyle = `rgba(160,140,112,${Math.random() * 0.06})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
  })
}

// 울 러그 — 도톰한 직조 + 테두리
export function woolTexture() {
  return makeTexture('wool', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#e9dfcc'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 9000; i += 1) {
      const x = Math.random() * w
      const y = Math.random() * h
      ctx.fillStyle = Math.random() < 0.5 ? `rgba(255,250,238,${0.05 + Math.random() * 0.12})` : `rgba(178,158,130,${0.03 + Math.random() * 0.09})`
      ctx.fillRect(x, y, 2 + Math.random() * 5, 1 + Math.random() * 2)
    }
    for (let y = 0; y < h; y += 26) {
      ctx.fillStyle = 'rgba(190,172,146,0.05)'
      ctx.fillRect(0, y, w, 10)
    }
    // 테두리 띠
    ctx.strokeStyle = 'rgba(196,176,146,0.5)'
    ctx.lineWidth = 16
    ctx.strokeRect(26, 26, w - 52, h - 52)
    ctx.strokeStyle = 'rgba(255,250,240,0.4)'
    ctx.lineWidth = 4
    ctx.strokeRect(46, 46, w - 92, h - 92)
  })
}

// 책장 한 칸의 책등 — 크림 · 우드 · 차콜 · 세이지 톤
export function booksTexture({ key = 'books', seed = 1, count = 26 } = {}) {
  return makeTexture(`${key}-${seed}`, 1200, 300, (ctx, w, h) => {
    let rand = seed * 9301 + 49297
    const rnd = () => {
      rand = (rand * 9301 + 49297) % 233280
      return rand / 233280
    }
    ctx.clearRect(0, 0, w, h)
    const palette = ['#d9c9ae', '#b7a184', '#8d7a62', '#4b423a', '#6d7a63', '#a9744f', '#e5d9c4', '#3d3a37', '#c3ab86', '#8f9a86']
    let x = 0
    while (x < w) {
      const bw = 12 + rnd() * 26
      const gapH = 6 + rnd() * 40
      const bh = h - gapH - 4
      const col = palette[Math.floor(rnd() * palette.length)]
      ctx.fillStyle = col
      ctx.fillRect(x, h - bh - 2, bw - 2, bh)
      // 책등의 세로 띠 · 글자 느낌
      ctx.fillStyle = 'rgba(255,250,240,0.28)'
      ctx.fillRect(x + 2, h - bh + 12, bw - 6, 2)
      ctx.fillStyle = 'rgba(255,250,240,0.2)'
      ctx.fillRect(x + 2, h - bh + 30, bw - 8, 1.6)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(x + bw - 3.5, h - bh - 2, 1.6, bh)
      x += bw
    }
    // 아랫면 그늘
    const g = ctx.createLinearGradient(0, h - 24, 0, h)
    g.addColorStop(0, 'rgba(60,44,30,0)')
    g.addColorStop(1, 'rgba(60,44,30,0.35)')
    ctx.fillStyle = g
    ctx.fillRect(0, h - 24, w, 24)
  })
}

// 추상 수묵 아트 (라운지 액자)
export function artTexture({ key = 'art', variant = 0 } = {}) {
  return makeTexture(key, 900, 1080, (ctx, w, h) => {
    ctx.fillStyle = '#f6efe1'
    ctx.fillRect(0, 0, w, h)
    const seed = variant + 3
    let rand = seed * 7919
    const rnd = () => {
      rand = (rand * 9301 + 49297) % 233280
      return rand / 233280
    }
    for (let i = 0; i < 9; i += 1) {
      const x = w * (0.18 + rnd() * 0.62)
      const y = h * (0.2 + rnd() * 0.55)
      const r = 60 + rnd() * 190
      const g = ctx.createRadialGradient(x, y, 2, x, y, r)
      const dark = rnd() < 0.55
      g.addColorStop(0, dark ? `rgba(58,52,46,${0.1 + rnd() * 0.16})` : `rgba(150,120,92,${0.08 + rnd() * 0.12})`)
      g.addColorStop(1, 'rgba(58,52,46,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 7)
      ctx.fill()
    }
    // 붓 터치
    for (let i = 0; i < 26; i += 1) {
      ctx.beginPath()
      const x = w * (0.2 + rnd() * 0.6)
      const y = h * (0.2 + rnd() * 0.6)
      ctx.moveTo(x, y)
      ctx.bezierCurveTo(x + rnd() * 120, y + rnd() * 60, x + rnd() * 160, y + rnd() * 90, x + rnd() * 200, y + rnd() * 120)
      ctx.strokeStyle = rnd() < 0.6 ? `rgba(72,64,56,${0.05 + rnd() * 0.12})` : `rgba(158,104,66,${0.05 + rnd() * 0.1})`
      ctx.lineWidth = 2 + rnd() * 16
      ctx.lineCap = 'round'
      ctx.stroke()
    }
    // 종이 질감
    for (let i = 0; i < 2400; i += 1) {
      ctx.fillStyle = `rgba(120,104,86,${Math.random() * 0.04})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
  })
}

// 창밖 정원 — 하늘 · 숲 · 잔디 (큰 통창 너머 배경)
export function foliageTexture() {
  return makeTexture('foliage', 1600, 1000, (ctx, w, h) => {
    // 하늘
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55)
    sky.addColorStop(0, '#eef1e2')
    sky.addColorStop(0.6, '#e4ead2')
    sky.addColorStop(1, '#d9e2c2')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    // 잔디
    const grass = ctx.createLinearGradient(0, h * 0.62, 0, h)
    grass.addColorStop(0, '#9aa96f')
    grass.addColorStop(1, '#7d8f57')
    ctx.fillStyle = grass
    ctx.fillRect(0, h * 0.62, w, h * 0.38)

    // 먼 숲 (진한 초록 덩어리)
    const bands = [
      { y: 0.58, col: '#8ea172', r: [70, 190], n: 46 },
      { y: 0.52, col: '#6f8657', r: [50, 150], n: 60 },
      { y: 0.44, col: '#5b7247', r: [30, 110], n: 70 },
      { y: 0.34, col: '#4a6039', r: [16, 70], n: 90 },
    ]
    for (const b of bands) {
      for (let i = 0; i < b.n; i += 1) {
        const x = Math.random() * w
        const y = h * b.y + (Math.random() - 0.5) * h * 0.16
        const r = b.r[0] + Math.random() * (b.r[1] - b.r[0])
        const g = ctx.createRadialGradient(x, y, 1, x, y, r)
        g.addColorStop(0, b.col)
        g.addColorStop(0.65, b.col)
        g.addColorStop(1, 'rgba(74,96,57,0)')
        ctx.globalAlpha = 0.55 + Math.random() * 0.35
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 7)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1

    // 나무 줄기 몇 그루
    for (let i = 0; i < 7; i += 1) {
      const x = w * (0.07 + Math.random() * 0.86)
      const top = h * (0.18 + Math.random() * 0.2)
      ctx.fillStyle = 'rgba(96,78,58,0.55)'
      ctx.fillRect(x, top, 8 + Math.random() * 14, h * 0.62 - top)
      for (let k = 0; k < 5; k += 1) {
        const cx = x + (Math.random() - 0.5) * 160
        const cy = top + Math.random() * 120
        const r = 40 + Math.random() * 80
        const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, r)
        g.addColorStop(0, 'rgba(74,96,57,0.85)')
        g.addColorStop(1, 'rgba(74,96,57,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, 7)
        ctx.fill()
      }
    }

    // 잔디 위 빛 · 그림자
    for (let i = 0; i < 90; i += 1) {
      const x = Math.random() * w
      const y = h * (0.62 + Math.random() * 0.38)
      ctx.fillStyle = `rgba(255,250,214,${0.03 + Math.random() * 0.07})`
      ctx.fillRect(x, y, 30 + Math.random() * 90, 6 + Math.random() * 14)
    }
    const sun = ctx.createRadialGradient(w * 0.66, h * 0.12, 10, w * 0.66, h * 0.12, w * 0.45)
    sun.addColorStop(0, 'rgba(255,250,226,0.85)')
    sun.addColorStop(1, 'rgba(255,250,226,0)')
    ctx.fillStyle = sun
    ctx.fillRect(0, 0, w, h)
  })
}

// 오륜미네랄 진열대 뒤 가벽 — 세로 줄무늬 없는 차분한 스톤
//  · 위는 밝고 아래는 살짝 깊은 샴페인 스톤. 결은 아주 옅은 얼룩만 남깁니다.
export function backdropTexture({ key = 'backdrop-stone', top = '#cdb99c', mid = '#c2ac8d', bottom = '#b39d7e' } = {}) {
  return makeTexture(key, 1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, top)
    g.addColorStop(0.55, mid)
    g.addColorStop(1, bottom)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // 트라버틴 같은 부드러운 얼룩 — 줄무늬 없이 톤만 은은하게
    for (let i = 0; i < 120; i += 1) {
      const x = Math.random() * w
      const y = Math.random() * h
      const r = 30 + Math.random() * 130
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
      const dark = Math.random() < 0.5
      rg.addColorStop(0, dark ? `rgba(176,152,118,${0.02 + Math.random() * 0.04})` : `rgba(255,250,236,${0.03 + Math.random() * 0.05})`)
      rg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = rg
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 7)
      ctx.fill()
    }

    // 아래로 갈수록 살짝 가라앉는 그늘
    const v = ctx.createLinearGradient(0, h * 0.55, 0, h)
    v.addColorStop(0, 'rgba(120,98,72,0)')
    v.addColorStop(1, 'rgba(120,98,72,0.10)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, w, h)
  })
}

export function disposeTextures() {
  for (const tex of cache.values()) tex.dispose()
  cache.clear()
}
