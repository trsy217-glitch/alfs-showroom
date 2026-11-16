// 포인터 클릭이 드래그인지 구분하기 위한 공용 상태
export const interaction = {
  moved: false,
  lastDragAt: 0,
}

export const isClick = () => {
  return !interaction.moved
}
