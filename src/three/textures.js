import * as THREE from 'three'

/* ------------------------------------------------------------------
   절차적 텍스처 — 외부 이미지 없이 트래버틴·월넛·리넨·라벨을 그립니다.
   ------------------------------------------------------------------ */

const TAU = Math.PI * 2
let _seed = 20261125
function rnd() {
  _seed = (_seed * 1664525 + 1013904223) % 4294967296
  return _seed / 4294967296
}
function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
function toTexture(canvas, { srgb = true, repeat = [1, 1], aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = aniso
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}
function grain(ctx, w, h, amount = 12, alpha = 1) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
    if (alpha < 1) d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
}
function tracked(ctx, text, x, y, spacing, align = 'center') {
  const chars = Array.from(text)
  let total = 0
  for (const ch of chars) total += ctx.measureText(ch).width + spacing
  total -= spacing
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  for (const ch of chars) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
  return total
}

/* ---------------- stone ---------------- */

export function travertineTexture(size = 1024, tint = [231, 221, 202]) {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  g.fillStyle = `rgb(${tint[0]},${tint[1]},${tint[2]})`
  g.fillRect(0, 0, size, size)

  // 큰 얼룩 — 돌의 결
  for (let i = 0; i < 90; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = 60 + rnd() * 260
    const grd = g.createRadialGradient(x, y, 0, x, y, r)
    const warm = rnd() > 0.5
    grd.addColorStop(0, warm ? 'rgba(214,199,175,0.16)' : 'rgba(246,238,222,0.16)')
    grd.addColorStop(1, 'rgba(231,221,202,0)')
    g.fillStyle = grd
    g.beginPath()
    g.arc(x, y, r, 0, TAU)
    g.fill()
  }

  // 가로로 흐르는 얇은 결
  for (let i = 0; i < 26; i++) {
    const y = rnd() * size
    const h = 2 + rnd() * 9
    g.fillStyle = `rgba(${176 + rnd() * 30 | 0},${164 + rnd() * 26 | 0},${142 + rnd() * 22 | 0},${0.04 + rnd() * 0.08})`
    g.beginPath()
    g.moveTo(0, y)
    for (let x = 0; x <= size; x += 32) {
      g.lineTo(x, y + Math.sin((x / size) * TAU * 1.2 + i) * 7)
    }
    g.lineTo(size, y + h)
    for (let x = size; x >= 0; x -= 32) {
      g.lineTo(x, y + h + Math.sin((x / size) * TAU * 1.2 + i) * 7)
    }
    g.closePath()
    g.fill()
  }

  // 기공
  for (let i = 0; i < 3200; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const rx = 0.8 + rnd() * 4.2
    const ry = 0.8 + rnd() * 2.6
    g.fillStyle = `rgba(${150 + rnd() * 40 | 0},${138 + rnd() * 36 | 0},${118 + rnd() * 30 | 0},${0.07 + rnd() * 0.2})`
    g.beginPath()
    g.ellipse(x, y, rx, ry, rnd() * 0.8, 0, TAU)
    g.fill()
  }

  grain(g, size, size, 14)
  return c
}

export function plasterTexture(size = 512) {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  g.fillStyle = '#efe6d7'
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < 260; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = 12 + rnd() * 90
    const grd = g.createRadialGradient(x, y, 0, x, y, r)
    grd.addColorStop(0, `rgba(${224 + rnd() * 20 | 0},${212 + rnd() * 18 | 0},${192 + rnd() * 16 | 0},0.16)`)
    grd.addColorStop(1, 'rgba(239,230,215,0)')
    g.fillStyle = grd
    g.beginPath()
    g.arc(x, y, r, 0, TAU)
    g.fill()
  }
  grain(g, size, size, 9)
  return c
}

export function walnutTexture(size = 1024) {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, size, 0)
  grd.addColorStop(0, '#3a2a20')
  grd.addColorStop(0.45, '#4a352a')
  grd.addColorStop(0.7, '#402d22')
  grd.addColorStop(1, '#33241b')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)

  // 나뭇결
  for (let i = 0; i < 240; i++) {
    const x0 = rnd() * size
    const width = 0.6 + rnd() * 3.4
    const dark = rnd() > 0.42
    g.strokeStyle = dark
      ? `rgba(${26 + rnd() * 22 | 0},${18 + rnd() * 14 | 0},${12 + rnd() * 10 | 0},${0.16 + rnd() * 0.4})`
      : `rgba(${104 + rnd() * 34 | 0},${80 + rnd() * 26 | 0},${60 + rnd() * 20 | 0},${0.08 + rnd() * 0.18})`
    g.lineWidth = width
    g.beginPath()
    const amp = 4 + rnd() * 22
    const freq = 1 + rnd() * 2.4
    g.moveTo(x0, -10)
    for (let y = 0; y <= size; y += 16) {
      g.lineTo(x0 + Math.sin((y / size) * TAU * freq + i) * amp, y)
    }
    g.stroke()
  }
  // 옹이
  for (let k = 0; k < 4; k++) {
    const kx = rnd() * size
    const ky = rnd() * size
    for (let r = 4; r < 60; r += 5) {
      g.strokeStyle = `rgba(28,16,10,${0.1 + rnd() * 0.12})`
      g.lineWidth = 1.4
      g.beginPath()
      g.ellipse(kx, ky, r * 0.55, r * 1.6, 0.2, 0, TAU)
      g.stroke()
    }
  }
  grain(g, size, size, 10)
  return c
}

export function linenTexture(size = 512, tint = [232, 221, 201]) {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  g.fillStyle = `rgb(${tint[0]},${tint[1]},${tint[2]})`
  g.fillRect(0, 0, size, size)
  const step = 4
  for (let y = 0; y < size; y += step) {
    g.fillStyle = y % (step * 2) === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(120,104,80,0.1)'
    g.fillRect(0, y, size, 1.4)
  }
  for (let x = 0; x < size; x += step) {
    g.fillStyle = x % (step * 2) === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(120,104,80,0.07)'
    g.fillRect(x, 0, 1.4, size)
  }
  grain(g, size, size, 10)
  return c
}

export function brassRoughness(size = 512) {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  g.fillStyle = '#606060'
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < 1400; i++) {
    const y = rnd() * size
    g.strokeStyle = `rgba(${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},255,${0.02 + rnd() * 0.05})`
    g.lineWidth = 0.6 + rnd() * 1.6
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(size, y + (rnd() - 0.5) * 3)
    g.stroke()
  }
  return c
}

export function contactShadowTexture(size = 256) {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(0,0,0,0.55)')
  grd.addColorStop(0.45, 'rgba(0,0,0,0.28)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  return c
}

/* ---------------- product labels ---------------- */

function droplet(g, cx, cy, w, h) {
  g.beginPath()
  g.moveTo(cx, cy - h / 2)
  g.bezierCurveTo(cx + w * 0.52, cy - h * 0.1, cx + w * 0.48, cy + h * 0.34, cx, cy + h * 0.5)
  g.bezierCurveTo(cx - w * 0.48, cy + h * 0.34, cx - w * 0.52, cy - h * 0.1, cx, cy - h / 2)
  g.closePath()
}

export function mineralLabelTexture() {
  const W = 1024
  const H = 512
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')

  const bg = g.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#eef4f5')
  bg.addColorStop(0.4, '#e2ecee')
  bg.addColorStop(0.75, '#dae6e9')
  bg.addColorStop(1, '#eaf1f2')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)

  // 은은한 물빛
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W
    g.fillStyle = `rgba(255,255,255,${0.03 + rnd() * 0.07})`
    g.beginPath()
    g.ellipse(x, rnd() * H, 20 + rnd() * 70, 60 + rnd() * 160, 0, 0, TAU)
    g.fill()
  }

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = '#5c7f92'
  g.font = '500 22px ALFSans, sans-serif'
  tracked(g, 'A L . F . S   W E L L N E S S   A T E L I E R', W / 2, 46, 2)

  // 물방울
  const dg = g.createRadialGradient(W / 2 - 26, 150, 6, W / 2, 190, 88)
  dg.addColorStop(0, '#8fc4e2')
  dg.addColorStop(0.5, '#4b8cb5')
  dg.addColorStop(1, '#25586f')
  droplet(g, W / 2, 196, 118, 150)
  g.fillStyle = dg
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.5)'
  g.lineWidth = 2
  g.stroke()

  g.fillStyle = '#1d4c66'
  g.font = '700 74px ALFSans, sans-serif'
  tracked(g, '오륜미네랄', W / 2, 322, 2)

  g.fillStyle = '#40606f'
  g.font = '400 30px ALFSans, sans-serif'
  tracked(g, 'MINERAL WATER CONCENTRATE', W / 2, 372, 5)

  g.fillStyle = '#2b4f60'
  g.font = '400 42px ALFSerif, serif'
  tracked(g, '1,000ml', W / 2, 430, 4)

  g.strokeStyle = 'rgba(60,95,110,0.35)'
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(W / 2 - 120, 466)
  g.lineTo(W / 2 + 120, 466)
  g.stroke()
  g.fillStyle = '#5b7a87'
  g.font = '400 20px ALFSans, sans-serif'
  tracked(g, '기타가공품 · 대한민국', W / 2, 484, 3)

  return toTexture(c, { repeat: [1, 1] })
}

export function cleanbiomeLabelTexture(a = '#7fded0', b = '#b3a8ee') {
  const W = 512
  const H = 512
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  const grd = g.createLinearGradient(0, 0, 0, H)
  grd.addColorStop(0, a)
  grd.addColorStop(0.55, '#a9cfe2')
  grd.addColorStop(1, b)
  g.fillStyle = grd
  g.fillRect(0, 0, W, H)

  // 물결
  for (let i = 0; i < 5; i++) {
    g.fillStyle = `rgba(255,255,255,${0.06 + rnd() * 0.05})`
    g.beginPath()
    g.ellipse(W * (0.2 + rnd() * 0.6), H * (0.1 + i * 0.18), 150, 42, 0.2, 0, TAU)
    g.fill()
  }

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = 'rgba(255,255,255,0.92)'
  g.font = '400 22px ALFSerif, serif'
  tracked(g, '자연 발효 미생물', W / 2, 96, 4)

  g.strokeStyle = 'rgba(255,255,255,0.85)'
  g.lineWidth = 3
  g.beginPath()
  g.arc(W / 2, 200, 46, 0, TAU)
  g.stroke()
  g.fillStyle = 'rgba(255,255,255,0.95)'
  g.font = '400 44px ALFSerif, serif'
  g.fillText('S', W / 2, 203)

  g.fillStyle = '#273a86'
  g.font = '700 62px ALFSans, sans-serif'
  tracked(g, '클린바이옴', W / 2, 310, 3)

  g.fillStyle = 'rgba(39,58,134,0.75)'
  g.font = '400 24px ALFSans, sans-serif'
  tracked(g, 'CLEAN BIOME', W / 2, 356, 5)

  g.strokeStyle = 'rgba(255,255,255,0.6)'
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(W / 2 - 70, 402)
  g.lineTo(W / 2 + 70, 402)
  g.stroke()

  g.fillStyle = 'rgba(30,40,70,0.7)'
  g.font = '400 20px ALFSans, sans-serif'
  tracked(g, '기타가공품 · 100ml', W / 2, 432, 2)
  return toTexture(c)
}

export function fitBoxTexture(days = 30) {
  const W = 1024
  const H = 1024
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  const accent = days === 30 ? '#2f4636' : '#7a3f2c'

  g.fillStyle = '#f5efe2'
  g.fillRect(0, 0, W, H)

  // 위아래 골드 밴드
  g.fillStyle = '#e4d7bd'
  g.fillRect(0, 0, W, 84)
  g.fillRect(0, H - 84, W, 84)
  g.fillStyle = accent
  g.fillRect(0, 84, W, 4)

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = 'rgba(60,50,36,0.66)'
  g.font = '500 26px ALFSans, sans-serif'
  tracked(g, 'A L . F . S   ·   C L E A N S E   P R O G R A M', W / 2, 44, 2)

  g.fillStyle = accent
  g.font = '400 300px ALFSerif, serif'
  g.fillText('1.3', W / 2 - 20, 400)
  g.font = 'italic 400 150px ALFSerif, serif'
  g.fillText('fit', W / 2 + 220, 500)

  g.strokeStyle = accent
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(150, 596)
  g.lineTo(W - 150, 596)
  g.stroke()

  g.fillStyle = accent
  g.font = '300 140px ALFSerif, serif'
  tracked(g, String(days), W / 2 - 110, 700, 4)
  g.font = '400 46px ALFSerif, serif'
  tracked(g, 'DAYS', W / 2 + 165, 712, 10)

  g.fillStyle = 'rgba(50,42,30,0.82)'
  g.font = '500 34px ALFSans, sans-serif'
  tracked(g, days === 30 ? '하루 1.3핏 30일' : '하루 1.3핏 3일', W / 2, 826, 3)

  g.fillStyle = 'rgba(50,42,30,0.55)'
  g.font = '400 24px ALFSans, sans-serif'
  tracked(
    g,
    days === 30 ? '엔자임밀 200ml 9포 + 클린바이옴 100ml 3병' : '엔자임밀 + 클린바이옴 · 3일 분량',
    W / 2,
    872,
    1,
  )

  g.fillStyle = 'rgba(60,50,36,0.6)'
  g.font = '400 22px ALFSans, sans-serif'
  tracked(g, days === 30 ? '무설탕 · 실온보관 · 기타가공품' : '무설탕 · 기타가공품', W / 2, 966, 3)

  return toTexture(c)
}

export function creamSideTexture(tint = '#f2ebdc') {
  const c = makeCanvas(64, 64)
  const g = c.getContext('2d')
  g.fillStyle = tint
  g.fillRect(0, 0, 64, 64)
  grain(g, 64, 64, 6)
  return toTexture(c)
}

/* ---------------- signage ---------------- */

export function brandPlaqueTexture() {
  const W = 2048
  const H = 768
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  g.clearRect(0, 0, W, H)

  const gold = g.createLinearGradient(0, 180, 0, 560)
  gold.addColorStop(0, '#e2c088')
  gold.addColorStop(0.35, '#a9824c')
  gold.addColorStop(0.6, '#6f5230')
  gold.addColorStop(0.82, '#b08a52')
  gold.addColorStop(1, '#5b4126')

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = gold
  g.font = '300 250px ALFSerif, serif'
  tracked(g, 'A L . F . S', W / 2, 320, 22)

  const line = g.createLinearGradient(W * 0.2, 0, W * 0.8, 0)
  line.addColorStop(0, 'rgba(201,164,104,0)')
  line.addColorStop(0.5, 'rgba(201,164,104,0.85)')
  line.addColorStop(1, 'rgba(201,164,104,0)')
  g.fillStyle = line
  g.fillRect(W * 0.2, 452, W * 0.6, 2)

  g.fillStyle = 'rgba(120,92,54,0.95)'
  g.font = '400 44px ALFSerif, serif'
  tracked(g, 'P R I V A T E   S H O W R O O M', W / 2, 530, 8)
  g.fillStyle = 'rgba(120,92,54,0.7)'
  g.font = '400 30px ALFSans, sans-serif'
  tracked(g, 'SEOUL · WELLNESS ATELIER', W / 2, 610, 7)

  return toTexture(c)
}

export function b2bBoardTexture() {
  const W = 1400
  const H = 900
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  const bg = g.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#221b14')
  bg.addColorStop(0.5, '#2a2118')
  bg.addColorStop(1, '#1a1510')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)

  g.strokeStyle = 'rgba(201,164,104,0.55)'
  g.lineWidth = 2
  g.strokeRect(38, 38, W - 76, H - 76)

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = '#c9a468'
  g.font = '400 24px ALFSans, sans-serif'
  tracked(g, 'A L . F . S   P A R T N E R   P R O G R A M', W / 2, 118, 3)

  g.fillStyle = '#f2ead9'
  g.font = '400 132px ALFSerif, serif'
  tracked(g, 'B2B', W / 2, 265, 12)

  g.fillStyle = 'rgba(242,234,217,0.62)'
  g.font = '400 34px ALFSans, sans-serif'
  tracked(g, '대리점 · 총판 · 샵인샵', W / 2, 372, 6)

  g.strokeStyle = 'rgba(201,164,104,0.35)'
  g.lineWidth = 1
  g.beginPath()
  g.moveTo(180, 440)
  g.lineTo(W - 180, 440)
  g.stroke()

  g.fillStyle = '#e9d7b4'
  g.font = '400 58px ALFSerif, serif'
  tracked(g, '10병 사전판매', W / 2 - 220, 540, 2)
  tracked(g, '200병 본계약', W / 2 + 230, 540, 2)

  g.fillStyle = 'rgba(201,164,104,0.9)'
  g.font = '400 54px ALFSans, sans-serif'
  g.fillText('→', W / 2, 536)

  g.fillStyle = 'rgba(242,234,217,0.5)'
  g.font = '400 30px ALFSans, sans-serif'
  tracked(g, '견적 · 상담 바로 연결', W / 2, 640, 6)

  g.fillStyle = '#c9a468'
  g.fillRect(W / 2 - 210, 712, 420, 76)
  g.fillStyle = '#211a13'
  g.font = '500 30px ALFSans, sans-serif'
  tracked(g, '상담 신청하기', W / 2, 752, 8)

  g.fillStyle = 'rgba(242,234,217,0.32)'
  g.font = '400 22px ALFSans, sans-serif'
  tracked(g, 'AL.F.S · SEOUL', W / 2, 836, 5)

  return toTexture(c)
}


export function routineBoardTexture() {
  const W = 1200
  const H = 760
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')

  const bg = g.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1c1712')
  bg.addColorStop(0.55, '#231c15')
  bg.addColorStop(1, '#17120e')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)

  g.strokeStyle = 'rgba(201,164,104,0.5)'
  g.lineWidth = 2
  g.strokeRect(26, 26, W - 52, H - 52)

  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = '#c9a468'
  g.font = '400 21px ALFSans, sans-serif'
  tracked(g, 'A L . F . S   ·   R O U T I N E   S Y S T E M', W / 2, 92, 2)

  g.fillStyle = '#f2ead9'
  g.font = '400 58px ALFSerif, serif'
  tracked(g, '나의 건강최적 루틴관리', W / 2, 168, 2)

  g.fillStyle = 'rgba(242,234,217,0.5)'
  g.font = '400 22px ALFSans, sans-serif'
  tracked(g, '하루 세 번, 챙기기 쉬운 순서로', W / 2, 224, 4)

  const cols = [
    { x: 70, label: '아침', en: 'MORNING', name: '오륜미네랄', how: '원액을 물에 10~30배 희석', tag: '1,000ml' },
    { x: 424, label: '점심', en: 'LUNCH', name: '클린바이옴', how: '물 300~500ml에 한 병 희석', tag: '100ml · 1병' },
    { x: 778, label: '저녁', en: 'EVENING', name: '하루 1.3핏', how: '엔자임밀 파우치를 물에 풀어', tag: '30일 프로그램' },
  ]
  for (const col of cols) {
    g.fillStyle = 'rgba(242,234,217,0.045)'
    g.fillRect(col.x, 276, 352, 330)
    g.strokeStyle = 'rgba(201,164,104,0.28)'
    g.lineWidth = 1
    g.strokeRect(col.x + 0.5, 276.5, 351, 329)

    g.textAlign = 'left'
    g.fillStyle = '#c9a468'
    g.font = '400 20px ALFSans, sans-serif'
    tracked(g, col.en, col.x + 30, 318, 5)

    g.fillStyle = '#f2ead9'
    g.font = '400 54px ALFSerif, serif'
    g.fillText(col.label, col.x + 30, 384)

    g.strokeStyle = 'rgba(201,164,104,0.3)'
    g.beginPath()
    g.moveTo(col.x + 30, 420)
    g.lineTo(col.x + 120, 420)
    g.stroke()

    g.fillStyle = '#e9d7b4'
    g.font = '500 33px ALFSans, sans-serif'
    g.fillText(col.name, col.x + 30, 468)

    g.fillStyle = 'rgba(242,234,217,0.55)'
    g.font = '400 23px ALFSans, sans-serif'
    g.fillText(col.how, col.x + 30, 512)
    if (col.tag) {
      g.fillStyle = 'rgba(201,164,104,0.8)'
      g.font = '400 20px ALFSans, sans-serif'
      g.fillText(col.tag, col.x + 30, 558)
    }
    g.textAlign = 'center'
  }

  g.fillStyle = 'rgba(242,234,217,0.42)'
  g.font = '400 21px ALFSans, sans-serif'
  tracked(g, '내 시간에 맞춰 순서를 바꿔도 됩니다 · 일반식품', W / 2, 660, 3)

  g.fillStyle = 'rgba(201,164,104,0.9)'
  g.font = '400 22px ALFSans, sans-serif'
  tracked(g, 'alfs.kr/diagnosis', W / 2, 704, 3)

  return toTexture(c)
}

export function hotspotLabelTexture(no, name) {
  const W = 640
  const H = 220
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  g.clearRect(0, 0, W, H)
  g.textAlign = 'left'
  g.textBaseline = 'middle'

  g.clearRect(0, 0, W, H)
  // 얇은 유리판
  g.fillStyle = 'rgba(20,17,13,0.42)'
  g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(201,164,104,0.5)'
  g.lineWidth = 2
  g.strokeRect(1, 1, W - 2, H - 2)

  g.fillStyle = '#c9a468'
  g.font = '400 56px ALFSerif, serif'
  g.fillText(no, 34, 78)

  g.fillStyle = '#f2ead9'
  g.font = '400 38px ALFSans, sans-serif'
  g.fillText(name, 34, 150)

  g.strokeStyle = 'rgba(201,164,104,0.5)'
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(34, 186)
  g.lineTo(120, 186)
  g.stroke()

  return toTexture(c)
}

export function engraveTexture(name, sub, dark = false) {
  const W = 512
  const H = 160
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  if (dark) {
    g.fillStyle = '#2b241c'
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#c9a469'
  } else {
    g.fillStyle = '#c9a469'
    g.fillRect(0, 0, W, H)
    g.fillStyle = 'rgba(60,44,24,0.14)'
    g.fillRect(0, 0, W, 4)
    g.fillRect(0, H - 4, W, 4)
  }
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = dark ? 'rgba(242,234,217,0.95)' : 'rgba(48,34,18,0.82)'
  g.font = '500 50px ALFSans, sans-serif'
  tracked(g, name, W / 2, 60, 4)
  g.fillStyle = dark ? 'rgba(201,164,105,0.9)' : 'rgba(48,34,18,0.58)'
  g.font = '400 28px ALFSans, sans-serif'
  tracked(g, sub, W / 2, 116, 6)
  return toTexture(c)
}

export function artTexture() {
  const W = 768
  const H = 1024
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  g.fillStyle = '#e6d8c1'
  g.fillRect(0, 0, W, H)
  const bands = [
    ['#d9c3a2', 0.0, 0.42],
    ['#c8ab84', 0.24, 0.5],
    ['#a98a63', 0.5, 0.7],
    ['#e7dcc9', 0.7, 1.0],
  ]
  for (const [col, a, b] of bands) {
    g.fillStyle = col
    g.globalAlpha = 0.85
    g.beginPath()
    g.moveTo(0, H * a)
    for (let x = 0; x <= W; x += 24) {
      g.lineTo(x, H * a + Math.sin((x / W) * 5.2) * 26 + Math.sin((x / W) * 13) * 8)
    }
    g.lineTo(W, H * b)
    g.lineTo(0, H * b)
    g.closePath()
    g.fill()
  }
  g.globalAlpha = 1
  // 질감
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${rnd() > 0.5 ? 255 : 90},${rnd() > 0.5 ? 245 : 78},${rnd() > 0.5 ? 225 : 60},${0.02 + rnd() * 0.05})`
    g.beginPath()
    g.ellipse(rnd() * W, rnd() * H, 6 + rnd() * 40, 3 + rnd() * 14, rnd() * 3, 0, TAU)
    g.fill()
  }
  return toTexture(c)
}

export function brochureCardTexture() {
  const W = 512
  const H = 700
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  g.fillStyle = '#f7f1e4'
  g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(160,130,85,0.4)'
  g.lineWidth = 2
  g.strokeRect(24, 24, W - 48, H - 48)
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = '#2a231a'
  g.font = '400 54px ALFSerif, serif'
  tracked(g, 'A L . F . S', W / 2, 150, 6)
  g.fillStyle = 'rgba(90,74,52,0.8)'
  g.font = '400 22px ALFSans, sans-serif'
  tracked(g, 'PRIVATE SHOWROOM', W / 2, 205, 6)
  g.strokeStyle = 'rgba(160,130,85,0.6)'
  g.beginPath()
  g.moveTo(W / 2 - 60, 250)
  g.lineTo(W / 2 + 60, 250)
  g.stroke()
  g.fillStyle = 'rgba(60,50,36,0.7)'
  g.font = '400 26px ALFSans, sans-serif'
  tracked(g, '오륜미네랄', W / 2, 320, 3)
  tracked(g, '1.3fit', W / 2, 370, 3)
  tracked(g, '클린바이옴', W / 2, 420, 3)
  g.fillStyle = 'rgba(120,100,70,0.55)'
  g.font = '400 20px ALFSans, sans-serif'
  tracked(g, 'WELLNESS ATELIER', W / 2, 600, 4)
  return toTexture(c)
}
