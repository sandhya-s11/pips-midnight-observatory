import { useCallback, useEffect, useRef, useState } from 'react'
import './MidnightStorybook.css'

const pages = [
  {
    title: 'A Lantern in the Clouds',
    text: 'At the quiet edge of midnight, Pip found a little lantern tucked beneath a cloud. It glimmered as if it had been waiting for a friend.',
    image: '/images/Sleepy_pip.png',
    alt: 'Sleepy Pip resting on a cloud beneath the night sky',
    ornament: '☾',
  },
  {
    title: 'A Star Takes Shelter',
    text: 'A tiny star had fallen from its place. Pip opened the lantern door, and the little traveler nestled inside, warm and safe.',
    image: '/images/Curious_pip.png',
    alt: 'Curious Pip looking toward a little star',
    ornament: '✦',
  },
  {
    title: 'The Midnight Nursery',
    text: 'Together they crossed the Midnight Nursery, where clouds made soft beds and every sleepy creature had a dream waiting nearby.',
    image: '/images/pip_avatar_cloud.png',
    alt: 'Pip nestled in a cloud beneath the stars',
    ornament: '☁',
  },
  {
    title: 'A Song for the Sky',
    text: 'Pip hummed a small, wobbly tune. One by one, the quiet stars woke and joined in, until the whole sky was glowing.',
    image: '/images/pip_portrait.png',
    alt: 'Pip carrying a glowing lantern and a tiny music box',
    ornament: '♪',
  },
  {
    title: 'The Dream Engineer',
    text: 'The star showed Pip how to gather a little light, a little courage, and a kind thought into a dream for someone who needed one.',
    spriteFrame: 3,
    alt: 'Pip walking bravely along the star path',
    ornament: '✧',
  },
  {
    title: 'Home Before Sunrise',
    text: 'When every dream was delivered, Pip guided the little star home. They promised to meet again whenever the nursery grew quiet.',
    spriteFrame: 6,
    alt: 'Pip waving goodnight on the way home',
    ornament: '✦',
  },
]

function PageContent({ page, pageNumber }) {
  return <>
    <div className="storybook-copy-page"><span className="storybook-page-kicker">PIP'S MIDNIGHT NURSERY</span><span className="storybook-ornament" aria-hidden="true">{page.ornament}</span><h3>{page.title}</h3><p>{page.text}</p></div>
    <div className="storybook-art-page"><div className={`storybook-illustration illustration-${pageNumber}`}><span className="storybook-illustration-glow" aria-hidden="true" /><span className="storybook-illustration-star" aria-hidden="true">{page.ornament}</span>{page.spriteFrame ? <span className={`storybook-walker walker-frame-${page.spriteFrame}`} role="img" aria-label={page.alt} /> : <img src={page.image} alt={page.alt} />}<span className="storybook-illustration-caption" aria-hidden="true">A little light goes a long way</span></div></div>
    <span className="storybook-page-number">{String(pageNumber).padStart(2, '0')}</span>
  </>
}

export default function MidnightStorybook({ reducedMotion = false, muted = false, playClickSound = () => {} }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [turnDirection, setTurnDirection] = useState('forward')
  const [turnSequence, setTurnSequence] = useState(0)
  const [isTurning, setIsTurning] = useState(false)
  const [isActive, setIsActive] = useState(() => !('IntersectionObserver' in window))
  const [hasFinished, setHasFinished] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicError, setMusicError] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [turnPages, setTurnPages] = useState(null)
  const sectionRef = useRef(null)
  const swipeStartRef = useRef(null)
  const pageIndexRef = useRef(0)
  const turnLockedRef = useRef(false)
  const turnLockTimerRef = useRef(null)
  const wheelDeltaRef = useRef(0)
  const wheelVerticalDeltaRef = useRef(0)
  const wheelResetTimerRef = useRef(null)
  const musicRef = useRef(null)
  const musicAutoTriedRef = useRef(false)

  const startMusic = useCallback(() => {
    const audio = musicRef.current
    if (!audio || muted) return
    setMusicError(false)
    audio.play().catch(() => setMusicError(true))
  }, [muted])

  const finishTurn = useCallback(() => {
    if (turnLockTimerRef.current) clearTimeout(turnLockTimerRef.current)
    turnLockTimerRef.current = null
    turnLockedRef.current = false
    setIsTurning(false)
    setTurnPages(null)
  }, [])

  const turnPage = useCallback((direction) => {
    if (turnLockedRef.current) return
    const step = isMobile ? 1 : 2
    const current = isMobile ? pageIndexRef.current : Math.floor(pageIndexRef.current / 2) * 2
    const next = Math.max(0, Math.min(pages.length - step, current + direction * step))
    if (next === current) return
    if (!reducedMotion) setTurnPages({ front: pages[direction > 0 ? current + step - 1 : current], back: pages[direction > 0 ? next : next + step - 1], frontNumber: direction > 0 ? current + step : current + 1, backNumber: direction > 0 ? next + 1 : next + step })
    playClickSound()
    pageIndexRef.current = next
    setTurnDirection(direction > 0 ? 'forward' : 'backward')
    setTurnSequence((sequence) => sequence + 1)
    setPageIndex(next)
    if (next >= pages.length - step) setHasFinished(true)
    if (!reducedMotion) {
      turnLockedRef.current = true
      setIsTurning(true)
      // The timeout is a fallback if the browser does not dispatch animationend.
      turnLockTimerRef.current = window.setTimeout(finishTurn, 780)
    }
    if (!muted && !musicAutoTriedRef.current) {
      musicAutoTriedRef.current = true
      startMusic()
    }
  }, [finishTurn, isMobile, muted, playClickSound, reducedMotion, startMusic])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(([entry]) => setIsActive(entry.isIntersecting), { threshold: 0.25 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current)
    if (turnLockTimerRef.current) clearTimeout(turnLockTimerRef.current)
    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.currentTime = 0
    }
  }, [])

  useEffect(() => {
    if (muted || !isActive) musicRef.current?.pause()
  }, [isActive, muted])

  useEffect(() => {
    const onKeyDown = (event) => {
      const section = sectionRef.current
      if (!section || (!isActive && !section.contains(document.activeElement))) return
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        turnPage(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        turnPage(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isActive, turnPage])

  const onPointerDown = (event) => {
    swipeStartRef.current = null
    if (event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return
    if (!event.target.closest('.storybook-page')) return
    swipeStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    if (event.pointerType === 'mouse') event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerUp = (event) => {
    const start = swipeStartRef.current
    if (!start || start.pointerId !== event.pointerId) return
    swipeStartRef.current = null
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) turnPage(dx < 0 ? 1 : -1)
  }

  const onWheel = (event) => {
    // Trackpads split one swipe into many small, sometimes diagonal wheel events.
    // Gather horizontal movement first, then decide once the gesture settles.
    if (Math.abs(event.deltaX) < 0.5) return

    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1
    wheelDeltaRef.current += event.deltaX * scale
    wheelVerticalDeltaRef.current += event.deltaY * scale
    if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current)
    wheelResetTimerRef.current = window.setTimeout(() => {
      const delta = wheelDeltaRef.current
      wheelDeltaRef.current = 0
      wheelResetTimerRef.current = null
      const verticalDelta = wheelVerticalDeltaRef.current
      wheelVerticalDeltaRef.current = 0
      if (Math.abs(delta) >= 28 && Math.abs(delta) > Math.abs(verticalDelta) * 1.15) {
        turnPage(delta < 0 ? 1 : -1)
      }
    }, 260)
  }

  const toggleMusic = () => {
    const audio = musicRef.current
    if (!audio || muted) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    startMusic()
  }

  const spreadStart = isMobile ? pageIndex : Math.floor(pageIndex / 2) * 2
  const page = pages[spreadStart]
  const nextDisabled = isMobile ? pageIndex >= pages.length - 1 : spreadStart >= pages.length - 2
  const onFlipAnimationEnd = (event) => {
    if (event.target === event.currentTarget) finishTurn()
  }

  return (
    <section className="midnight-storybook section" id="midnight-storybook" ref={sectionRef} aria-labelledby="storybook-title" onWheel={onWheel}>
      <div className="storybook-sky" aria-hidden="true"><span className="storybook-moon" /><i className="storybook-star star-a">✦</i><i className="storybook-star star-b">✧</i><i className="storybook-star star-c">✦</i><i className="storybook-star star-d">✧</i><span className="storybook-cloud cloud-a" /><span className="storybook-cloud cloud-b" /></div>
      <header className="storybook-heading">
        <p className="eyebrow">A TALE FOR THE QUIET HOURS</p>
        <h2 id="storybook-title">The Midnight <em>Storybook</em></h2>
        <p>Open a little book and follow Pip beneath the stars.</p>
      </header>

      <div className="storybook-reader" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipeStartRef.current = null }}>
        <div className="storybook-book" role="group" aria-label="Interactive storybook. Use the page buttons, left and right arrow keys, or swipe to turn pages.">
          <div className={`storybook-spread${isMobile ? ' is-mobile' : ''}`}>
            {!isMobile && <article className="storybook-page storybook-left-page" aria-live="polite"><PageContent page={pages[spreadStart]} pageNumber={spreadStart + 1} /></article>}
            <article className="storybook-page storybook-right-page" aria-live="polite"><PageContent page={isMobile ? page : pages[spreadStart + 1]} pageNumber={isMobile ? spreadStart + 1 : spreadStart + 2} /></article>
            <div className="storybook-binding" aria-hidden="true" />
            {isTurning && turnPages && <div key={turnSequence} className={`storybook-turn-leaf turn-${turnDirection}${isMobile ? ' mobile-turn' : ''}`} onAnimationEnd={onFlipAnimationEnd} aria-hidden="true"><div className="storybook-leaf-face leaf-front"><PageContent page={turnPages.front} pageNumber={turnPages.frontNumber} /></div><div className="storybook-leaf-face leaf-back"><PageContent page={turnPages.back} pageNumber={turnPages.backNumber} /></div></div>}
          </div>
        </div>

        <div className="storybook-audio-controls">
          <button type="button" onClick={toggleMusic} disabled={muted} aria-pressed={musicPlaying && !muted} aria-label={muted ? 'Turn on site sound to play the story music' : musicPlaying ? 'Pause story music' : 'Play soft story music'}>
            <span aria-hidden="true">{musicPlaying && !muted ? '♫' : '♪'}</span> {muted ? 'Sound is off' : musicPlaying ? 'Pause story music' : 'Play soft story music'}
          </button>
          {musicError && <span className="storybook-audio-status" role="status">Story music could not be played.</span>}
          <audio ref={musicRef} src="/audio/cabinet_lullaby.mp3" loop preload="none" onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} onError={() => setMusicError(true)} />
        </div>
        <div className="storybook-controls">
          <button type="button" data-silent-click className="storybook-button previous" onClick={() => turnPage(-1)} disabled={pageIndex === 0 || isTurning} aria-label="Previous page">← <span>Previous Page</span></button>
          <div className="storybook-progress" role="status" aria-live="polite" aria-label={`Page ${spreadStart + 1} of ${pages.length}`}>
            <span>{isMobile ? `Page ${spreadStart + 1}` : `Pages ${spreadStart + 1}–${spreadStart + 2}`} of {pages.length}</span>
            <div className="storybook-progress-dots" role="group" aria-label="Story page progress">{pages.map((item, index) => <span key={item.title} className={index <= spreadStart + (isMobile ? 0 : 1) ? 'is-read' : ''} aria-hidden="true" />)}</div>
          </div>
          <button type="button" data-silent-click className="storybook-button next" onClick={() => turnPage(1)} disabled={nextDisabled || isTurning} aria-label="Turn the page">Turn the Page <span aria-hidden="true">→</span></button>
        </div>
        <p className="storybook-swipe-hint">Swipe left or right on the book with a touchpad or finger, or use ← →</p>
        {hasFinished && <div className="storybook-surprise" role="status" aria-live="polite"><span aria-hidden="true">✦</span><p>The little star saved one last sparkle for you. <strong>You are part of Pip's story, too.</strong></p></div>}
      </div>
    </section>
  )
}
