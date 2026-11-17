import { useEffect, useState } from 'react'

// 글자 크기 — 쇼룸 UI · 3D 라벨 · 상담 창 · 모달이 한 번에 커집니다.
// 선택값은 localStorage 에 남아 다음 방문에도 유지됩니다.

const KEY = 'alfs:text-size'
const VALID = ['normal', 'large']

let current = 'normal'
const listeners = new Set()

if (typeof window !== 'undefined') {
  try {
    const saved = window.localStorage.getItem(KEY)
    if (VALID.includes(saved)) current = saved
  } catch {
    /* 저장소를 못 쓰는 환경은 기본값으로 시작합니다 */
  }
  document.documentElement.dataset.text = current
}

export const getTextSize = () => current

// 3D 캔버스 텍스처(전시 라벨·간판)용 배율 — 크게 선택 시 18% 확대
export const getTextScale = () => (current === 'large' ? 1.18 : 1)

export function setTextSize(next) {
  if (!VALID.includes(next) || next === current) return
  current = next
  if (typeof document !== 'undefined') document.documentElement.dataset.text = current
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, current)
  } catch {
    /* 저장 실패는 무시합니다 */
  }
  listeners.forEach((fn) => fn(current))
}

export function useTextSize() {
  const [size, setSize] = useState(current)
  useEffect(() => {
    listeners.add(setSize)
    return () => listeners.delete(setSize)
  }, [])
  return size
}
