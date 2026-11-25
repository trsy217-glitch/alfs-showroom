/* 인트로 — 씬이 준비되기 전에 먼저 그려집니다. */
export function createIntro() {
  const el = document.createElement('div')
  el.className = 'intro'
  el.innerHTML = `
    <div class="intro-inner">
      <div class="intro-eyebrow">AL.F.S · Wellness Atelier</div>
      <h1 class="intro-mark">A L . F . S</h1>
      <p class="intro-sub">Private Showroom</p>
      <div class="intro-rule"></div>
      <p class="intro-ko">
        서울 상암의 웰니스 아틀리에에서 준비한 <b>프라이빗 3D 쇼룸</b>입니다.<br />
        오륜미네랄과 하루 1.3핏 · 클린바이옴을 공간에서 살펴보세요.
      </p>
      <button class="intro-enter" type="button" id="enterBtn" disabled>쇼룸 준비 중</button>
      <p class="intro-note" id="introNote">조명과 진열을 준비하고 있습니다. 잠시만 기다려 주세요.</p>
    </div>
    <div class="intro-foot"><span>AL.F.S</span><span>Seoul · 2026</span></div>
  `
  document.getElementById('app').appendChild(el)

  const btn = el.querySelector('#enterBtn')
  const note = el.querySelector('#introNote')
  let entered = false
  let ready = false
  const listeners = []

  const enter = () => {
    if (!ready || entered) return
    entered = true
    el.classList.add('gone')
    setTimeout(() => {
      el.style.display = 'none'
    }, 1300)
    listeners.forEach((fn) => fn())
  }
  btn.addEventListener('click', enter)

  return {
    el,
    onEnter(fn) {
      if (entered) fn()
      else listeners.push(fn)
    },
    setReady() {
      ready = true
      el.classList.add('ready')
      btn.disabled = false
      btn.textContent = '입장하기'
      note.textContent = window.matchMedia('(hover: none)').matches
        ? '손가락으로 돌려 보고, 진열된 제품을 눌러 보세요.'
        : '마우스 드래그로 둘러보고, 진열된 제품을 눌러 보세요.'
    },
  }
}
