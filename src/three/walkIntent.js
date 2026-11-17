// 키보드 · 조이스틱이 함께 쓰는 이동 의도 (매 프레임 카메라가 부드럽게 따라갑니다)
export const walkIntent = {
  x: 0,
  z: 0,
}

export const resetWalk = () => {
  walkIntent.x = 0
  walkIntent.z = 0
}
