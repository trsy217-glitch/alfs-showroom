// ─────────────────────────────────────────────────────────────
// 쇼룸 가구 충돌 — 바운딩 박스(회전 포함) + 원
//  · 걸을 때 카메라(손님의 눈)가 테이블·데스크·소파·책장·벽을 뚫고 들어가지 않습니다.
//  · 막히면 그 자리에서 멈추지 않고 벽을 따라 미끄러지듯(sliding) 움직입니다.
//  · 바깥 벽은 Controls 의 LIMIT 이, 가구는 이 목록이 담당합니다.
// ─────────────────────────────────────────────────────────────
import { LOUNGE } from './layout.js'

// 손님 몸 반지름 — 어깨 폭을 고려한 값
export const BODY_RADIUS = 0.42

// 로비 안내 데스크 (LobbyZone 과 같은 좌표)
const DESK = { x: 3.95, z: 6.95, rot: -0.45, hw: 1.5, hd: 0.5 }
const DESK_FRONT = [Math.sin(DESK.rot), Math.cos(DESK.rot)] // [-0.435, 0.900]

export const CONCIERGE_STAND = {
  // 데스크 왼쪽 옆 — 상판(반폭 1.5m) 바깥, 발이 바닥에 닿는 자리
  pos: [
    DESK.x + -2.15 * Math.cos(DESK.rot) + -0.15 * DESK_FRONT[0],
    0,
    DESK.z + 2.15 * Math.sin(DESK.rot) + -0.15 * DESK_FRONT[1],
  ],
}

const box = (name, x, z, hw, hd, rot = 0, top = 1.2) => ({ kind: 'box', name, x, z, hw, hd, rot, top })
const circle = (name, x, z, r, top = 1.2) => ({ kind: 'circle', name, x, z, r, top })

export const COLLIDERS = [
  // ── 01 로비 ──────────────────────────────────────────────
  box('lobby-desk', DESK.x, DESK.z, DESK.hw, DESK.hd, DESK.rot, 0.84),
  circle('concierge', CONCIERGE_STAND.pos[0], CONCIERGE_STAND.pos[2], 0.2, 0.9),
  circle('lobby-chair-a', -8.3, 8.6, 0.56, 0.9),
  circle('lobby-chair-b', -9.6, 7.2, 0.56, 0.9),
  circle('lobby-side-table', -9.3, 8.35, 0.34, 0.55),
  box('lobby-console', -7.6, 10.4, 1.2, 0.28, 0, 0.85),
  circle('lobby-plant-a', 6.2, 9.2, 0.46, 1.5),
  circle('lobby-plant-b', -11.6, 9.8, 0.42, 1.3),

  // ── 02 오륜미네랄 전시대 (원형 아일랜드) ───────────────────
  circle('mineral-island', -2.8, 1.4, 1.0, 0.75),
  circle('mineral-plant', -0.3, 3.7, 0.36, 1.0),
  box('mineral-partition', -2.8, -1.2, 2.6, 0.16, 0, 2.9),

  // ── 03 효소세상 진열 벤치 ────────────────────────────────
  box('enzyme-bench', -11.05, -0.4, 0.62, 3.9, 0, 0.85),

  // ── 04 성분·체험 존 ─────────────────────────────────────
  box('experience-bar', -0.9, -8.55, 3.5, 0.5, 0, 0.96),
  circle('experience-stool-a', -3.0, -7.55, 0.28, 0.64),
  circle('experience-stool-b', -0.6, -7.55, 0.28, 0.64),
  circle('experience-stool-c', 1.8, -7.55, 0.28, 0.64),
  box('experience-kiosk', 4.3, -8.4, 0.5, 0.34, -0.55, 2.1),
  circle('experience-plant', -5.9, -9.4, 0.44, 1.4),

  // ── 05 파트너 라운지 (축소 배치) ──────────────────────────
  circle('lounge-sofa', LOUNGE.sofa.x, LOUNGE.sofa.z, 3.08 * LOUNGE.sofa.scale, 1.0),
  circle('lounge-table', LOUNGE.table.x, LOUNGE.table.z, 0.95 * LOUNGE.table.scale, 0.5),
  box('lounge-desk', LOUNGE.desk.x, LOUNGE.desk.z, 1.16, 0.48, LOUNGE.desk.rot, 0.85),
  box('lounge-shelf', LOUNGE.shelfX, 0.55, 0.3, 3.0, 0, 3.2),
  circle('lounge-lamp', LOUNGE.lamp[0], LOUNGE.lamp[1], 0.3, 1.9),
  circle('lounge-plant-tall', LOUNGE.plantTall[0], LOUNGE.plantTall[1], 0.42, 2.2),
  circle('lounge-plant-small', LOUNGE.plantSmall[0], LOUNGE.plantSmall[1], 0.36, 1.1),
  circle('lounge-side-table', LOUNGE.sideTable[0], LOUNGE.sideTable[1], 0.33, 0.5),
]

// 점이 충돌체 안쪽인지 (회전 박스는 점을 박스 좌표로 돌려서 판정)
export function collideAt(x, z, radius = BODY_RADIUS) {
  for (const c of COLLIDERS) {
    if (c.kind === 'circle') {
      if (Math.hypot(x - c.x, z - c.z) < c.r + radius) return c
      continue
    }
    const cos = Math.cos(c.rot)
    const sin = Math.sin(c.rot)
    const dx = x - c.x
    const dz = z - c.z
    const lx = dx * cos - dz * sin
    const lz = dx * sin + dz * cos
    if (Math.abs(lx) < c.hw + radius && Math.abs(lz) < c.hd + radius) return c
  }
  return null
}

// 가장 얕게 파고든 쪽으로 밀어내고, 밀어낸 방향(법선)을 돌려줍니다.
// → 호출한 쪽이 그 법선 방향 속도만 지우면 벽을 따라 미끄러집니다.
export function resolveCollisions(x, z, radius = BODY_RADIUS) {
  let px = x
  let pz = z
  let hit = null
  let nx = 0
  let nz = 0

  for (let iter = 0; iter < 4; iter += 1) {
    let moved = false

    for (const c of COLLIDERS) {
      if (c.kind === 'circle') {
        const dx = px - c.x
        const dz = pz - c.z
        const d = Math.hypot(dx, dz)
        const min = c.r + radius
        if (d >= min) continue
        const ux = d > 1e-5 ? dx / d : 1
        const uz = d > 1e-5 ? dz / d : 0
        px += ux * (min - d)
        pz += uz * (min - d)
        nx += ux
        nz += uz
        hit = hit ?? c
        moved = true
        continue
      }

      const cos = Math.cos(c.rot)
      const sin = Math.sin(c.rot)
      const dx = px - c.x
      const dz = pz - c.z
      let lx = dx * cos - dz * sin
      let lz = dx * sin + dz * cos
      const hx = c.hw + radius
      const hz = c.hd + radius
      if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) continue

      const penX = hx - Math.abs(lx)
      const penZ = hz - Math.abs(lz)
      let nlx = 0
      let nlz = 0
      if (penX <= penZ) {
        nlx = lx >= 0 ? 1 : -1
        lx = nlx * hx
      } else {
        nlz = lz >= 0 ? 1 : -1
        lz = nlz * hz
      }
      // 박스 좌표 → 월드 좌표
      px = c.x + lx * cos + lz * sin
      pz = c.z - lx * sin + lz * cos
      nx += nlx * cos + nlz * sin
      nz += -nlx * sin + nlz * cos
      hit = hit ?? c
      moved = true
    }

    if (!moved) break
  }

  return { x: px, z: pz, hit, nx, nz }
}

// 카메라(붐)가 벽·가구를 뚫지 않도록: 무거운 가구만 대상으로 밀어냅니다.
export function resolveCameraCollision(x, y, z, radius = 0.26) {
  let px = x
  let pz = z
  for (const c of COLLIDERS) {
    if ((c.top ?? 0) < y - 0.15) continue // 눈높이보다 낮은 가구는 통과
    if (c.kind === 'circle') {
      const dx = px - c.x
      const dz = pz - c.z
      const d = Math.hypot(dx, dz)
      const min = c.r + radius
      if (d < min) {
        const ux = d > 1e-5 ? dx / d : 1
        const uz = d > 1e-5 ? dz / d : 0
        px += ux * (min - d)
        pz += uz * (min - d)
      }
      continue
    }
    const cos = Math.cos(c.rot)
    const sin = Math.sin(c.rot)
    const dx = px - c.x
    const dz = pz - c.z
    let lx = dx * cos - dz * sin
    let lz = dx * sin + dz * cos
    const hx = c.hw + radius
    const hz = c.hd + radius
    if (Math.abs(lx) >= hx || Math.abs(lz) >= hz) continue
    if (hx - Math.abs(lx) <= hz - Math.abs(lz)) lx = (lx >= 0 ? 1 : -1) * hx
    else lz = (lz >= 0 ? 1 : -1) * hz
    px = c.x + lx * cos + lz * sin
    pz = c.z - lx * sin + lz * cos
  }
  return { x: px, z: pz }
}
