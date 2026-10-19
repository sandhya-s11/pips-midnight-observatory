import { useCallback, useEffect, useRef, useState } from 'react'
import './DreamlandGate.css'

/* ── Wish messages ── */
const dreamWishes = [
  "The stars will keep you company. I'll meet you in your dreams.",
  'May your pillow be soft and your dreams full of tiny adventures.',
  'Somewhere tonight, a little star is saving a wish just for you.',
  'May the moon leave a little sparkle beside your bed.',
  'Tonight, your imagination has no bedtime.',
  'May your dreams be softer than clouds and brighter than fireflies.',
  'A tiny adventure is waiting just beyond the edge of sleep.',
  'Even the smallest star can light up a whole dream.',
  'May tomorrow bring you a pocketful of happy surprises.',
  'Close your eyes; the universe has a story for you.',
  'Somewhere in dreamland, a cloud is saving you a seat.',
  'You are made of a little magic, too. 💗',
]

/* ── Pip speech bubbles ── */
const pipSayings = [
  'Psst… one last dream?',
  "Don't forget to make a wish!",
  "I'll meet you among the stars. ✨",
  'Sweet dreams, little friend!',
  'The moon says goodnight, too. 🌙',
]

/* ── Marquee text ── */
const marqueeText =
  'MAKE A WISH ✦ FOLLOW A STAR ✦ VISIT DREAMLAND ✦ GOODNIGHT, LITTLE DREAMER ✦ '

/* ── Twinkling star positions ── */
const twinklingStars = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top: `${3 + Math.random() * 85}%`,
  size: 2 + Math.random() * 2.5,
  dur: `${2 + Math.random() * 3}s`,
  delay: `${Math.random() * 4}s`,
}))

/* ── Shooting star configs ── */
const shootingStars = [
  { id: 0, left: '75%', top: '12%', dur: '6s', delay: '3s' },
  { id: 1, left: '55%', top: '8%', dur: '7s', delay: '9s' },
  { id: 2, left: '85%', top: '22%', dur: '8s', delay: '16s' },
]

const dreamlandDeploymentUrl = '' // Add the real deployed site URL here when one exists.

export default function DreamlandGate({ muted, reducedMotion, delivered = 0, onDreamSent = () => {} }) {
  /* ── State ── */
  const [wishIndex, setWishIndex] = useState(-1)
  const [wishAnimating, setWishAnimating] = useState(false)
  const [pipSpeech, setPipSpeech] = useState(null)
  const [pipTilt, setPipTilt] = useState(false)
  const [pipSayingIndex, setPipSayingIndex] = useState(0)

  const [goodnightPhase, setGoodnightPhase] = useState('idle')
  // idle → curtain-closing → message → curtain-revealing → done

  const [pipSleepy, setPipSleepy] = useState(false)
  const [hasEntered, setHasEntered] = useState(() => reducedMotion || !('IntersectionObserver' in window))

  /* ── Refs ── */
  const wishTimerRef = useRef(null)
  const wishInProgressRef = useRef(false)
  const previousDeliveredRef = useRef(delivered)
  const [odometerRoll, setOdometerRoll] = useState(null)
  const speechTimerRef = useRef(null)
  const tiltTimerRef = useRef(null)
  const goodnightTimersRef = useRef([])
  const sectionRef = useRef(null)
  const chimeRef = useRef(null)

  const playChime = useCallback(() => {
    if (muted) return
    try {
      if (chimeRef.current) {
        chimeRef.current.pause()
        chimeRef.current.currentTime = 0
      }
      const audio = new Audio('/audio/magic_chime.mp3')
      audio.volume = 0.3
      chimeRef.current = audio
      audio.play().catch(() => {})
    } catch {
      chimeRef.current = null
    }
  }, [muted])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    if (reducedMotion || !('IntersectionObserver' in window) || hasEntered) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasEntered(true)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [hasEntered, reducedMotion])

  useEffect(() => {
    if (muted && chimeRef.current) {
      chimeRef.current.pause()
      chimeRef.current.currentTime = 0
      chimeRef.current = null
    }
  }, [muted])

  useEffect(() => {
    if (delivered > previousDeliveredRef.current) {
      setOdometerRoll({ from: previousDeliveredRef.current, to: delivered })
    }
    previousDeliveredRef.current = delivered
  }, [delivered])

  /* ── Cleanup ── */
  useEffect(
    () => () => {
      if (wishTimerRef.current) clearTimeout(wishTimerRef.current)
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
      if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current)
      goodnightTimersRef.current.forEach(clearTimeout)
      if (chimeRef.current) {
        chimeRef.current.pause()
        chimeRef.current.currentTime = 0
      }
    },
    [],
  )

  /* ── Dream wish generator ── */
  const sendDream = useCallback(() => {
    if (wishInProgressRef.current) return
    wishInProgressRef.current = true
    setWishAnimating(true)

    setWishIndex((prev) => {
      let next = Math.floor(Math.random() * dreamWishes.length)
      if (dreamWishes.length > 1) {
        while (next === prev) next = Math.floor(Math.random() * dreamWishes.length)
      }
      return next
    })
    onDreamSent()

    if (wishTimerRef.current) clearTimeout(wishTimerRef.current)
    wishTimerRef.current = setTimeout(() => {
      wishInProgressRef.current = false
      setWishAnimating(false)
      wishTimerRef.current = null
    }, 650)
  }, [onDreamSent])

  /* ── Pip click ── */
  const handlePipClick = useCallback(() => {
    if (pipSpeech !== null) return

    setPipTilt(true)
    if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current)
    tiltTimerRef.current = setTimeout(() => {
      setPipTilt(false)
      tiltTimerRef.current = null
    }, 600)

    const saying = pipSayings[pipSayingIndex % pipSayings.length]
    setPipSpeech(saying)
    setPipSayingIndex((i) => i + 1)

    playChime()

    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
    speechTimerRef.current = setTimeout(() => {
      setPipSpeech(null)
      speechTimerRef.current = null
    }, 2800)
  }, [pipSpeech, pipSayingIndex, playChime])

  /* ── Goodnight transition ── */
  const startGoodnight = useCallback(() => {
    if (goodnightPhase !== 'idle' && goodnightPhase !== 'done') return

    const isReduced = reducedMotion

    // Clear any previous timers
    goodnightTimersRef.current.forEach(clearTimeout)
    goodnightTimersRef.current = []

    setPipSleepy(false)
    setGoodnightPhase('curtain-closing')

    playChime()

    // After clouds close → show message
    const t1 = setTimeout(
      () => {
        setGoodnightPhase('message')
        setPipSleepy(true)
      },
      isReduced ? 50 : 1300,
    )
    goodnightTimersRef.current.push(t1)

    // After showing message → reveal (pull clouds away)
    const t2 = setTimeout(
      () => {
        setGoodnightPhase('curtain-revealing')
      },
      isReduced ? 100 : 3500,
    )
    goodnightTimersRef.current.push(t2)

    // After clouds pulled away → done
    const t3 = setTimeout(
      () => {
        setGoodnightPhase('done')
      },
      isReduced ? 150 : 5200,
    )
    goodnightTimersRef.current.push(t3)
  }, [goodnightPhase, playChime, reducedMotion])

  /* ── Replay ── */
  const replayGoodnight = useCallback(() => {
    goodnightTimersRef.current.forEach(clearTimeout)
    goodnightTimersRef.current = []
    setPipSleepy(false)
    setGoodnightPhase('idle')
  }, [])

  /* ── Back to beginning ── */
  const scrollToTop = useCallback(() => {
    const home = document.getElementById('home')
    if (home) {
      home.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
    }
  }, [reducedMotion])

  /* ── Determine CSS classes ── */
  const gateClasses = [
    'dreamland-gate',
    goodnightPhase === 'curtain-closing' ? 'curtain-closing goodnight-active' : '',
    goodnightPhase === 'curtain-revealing' ? 'curtain-revealing' : '',
    goodnightPhase === 'message' ? 'curtain-closing goodnight-active' : '',
    reducedMotion ? 'reduced-motion' : '',
    hasEntered ? 'is-entered' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const showFinalMessage = goodnightPhase === 'message' || goodnightPhase === 'curtain-revealing' || goodnightPhase === 'done'
  const showGoodnightButton = goodnightPhase === 'idle' || goodnightPhase === 'done'
  const displayedCount = String(delivered).padStart(3, '0')
  const previousCount = odometerRoll?.to === delivered ? String(odometerRoll.from).padStart(3, '0') : ''

  return (
    <section
      className={gateClasses}
      id="dreamland"
      ref={sectionRef}
      aria-label="The Dreamland Gate — final chapter"
    >
      {/* Background */}
      <div className="dreamland-gate-bg" aria-hidden="true">
        <img
          src="/images/dreamland_gate_bg.png"
          alt=""
          loading="lazy"
        />
      </div>

      {/* Twinkling stars */}
      <div className="dreamland-stars" aria-hidden="true">
        {twinklingStars.map((star) => (
          <span
            key={star.id}
            className="dreamland-star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--twinkle-dur': star.dur,
              '--twinkle-delay': star.delay,
            }}
          />
        ))}
        {shootingStars.map((s) => (
          <span
            key={s.id}
            className="dreamland-shooting-star"
            style={{
              left: s.left,
              top: s.top,
              '--shoot-dur': s.dur,
              '--shoot-delay': s.delay,
            }}
          />
        ))}
      </div>

      {/* Moving clouds */}
      <div className="dreamland-clouds" aria-hidden="true">
        <div className="dl-cloud dl-cloud-1" />
        <div className="dl-cloud dl-cloud-2" />
        <div className="dl-cloud dl-cloud-3" />
        <div className="dl-cloud dl-cloud-4" />
        <div className="dl-cloud-img dl-cloud-pip">
          <img src="/images/pip_cloud.png" alt="" />
        </div>
      </div>

      {/* Cloud curtain panels */}
      <div className="dl-curtain-left" aria-hidden="true" />
      <div className="dl-curtain-right" aria-hidden="true" />

      {/* Opening header */}
      <header className="dreamland-header">
        <p className="dl-eyebrow">PIP'S MIDNIGHT OBSERVATORY</p>
        <h2>
          What will you dream tonight?
          <span className="dl-sparkle" aria-hidden="true">
            ✦
          </span>
        </h2>
        <p className="dl-subtitle">
          Every little dream deserves a little stardust.
        </p>
      </header>

      {/* Pip's goodnight moment */}
      <div className="dreamland-pip-wrap">
        <button
          type="button"
          className={`dreamland-pip-button${pipTilt ? ' pip-tilt' : ''}${pipSleepy ? ' pip-sleepy' : ''}`}
          data-silent-click
          onClick={handlePipClick}
          aria-label="Say goodnight to Pip"
        >
          <img
            src={pipSleepy ? '/images/Sleepy_pip.png' : '/images/Curious_pip.png'}
            alt={pipSleepy ? 'Sleepy Pip resting' : 'Curious Pip looking at you'}
          />
          {pipSpeech && (
            <span className="dl-speech-bubble" role="status" aria-live="polite">
              {pipSpeech}
            </span>
          )}
        </button>
      </div>

      {/* Dream wish generator */}
      <div className="dreamland-wish-section">
        <button
          type="button"
          className="dl-wish-button"
          onClick={sendDream}
          disabled={wishAnimating}
          aria-label="Generate a bedtime dream wish"
        >
          Send me a dream ✨
        </button>

        {wishIndex >= 0 && (
          <div className="dl-wish-card" key={wishIndex} role="status" aria-live="polite">
            <span className="dl-wish-label">A DREAM FROM PIP</span>
            <p>&ldquo;{dreamWishes[wishIndex]}&rdquo;</p>
          </div>
        )}

        {wishIndex >= 0 && !wishAnimating && (
          <button
            type="button"
            className="dl-another-wish"
            onClick={sendDream}
          >
            Another dream ✧
          </button>
        )}
      </div>

      {/* Dream marquee */}
      <div className="dreamland-marquee" aria-hidden="true">
        <div className="dl-marquee-track">
          <span className="dl-marquee-text">{marqueeText}{marqueeText}</span>
          <span className="dl-marquee-text">{marqueeText}{marqueeText}</span>
        </div>
      </div>

      {/* Goodnight button */}
      <div className="dreamland-goodnight-section">
        {showGoodnightButton && !showFinalMessage && (
          <button
            type="button"
            className="dl-goodnight-button"
            data-silent-click
            onClick={startGoodnight}
            disabled={goodnightPhase !== 'idle' && goodnightPhase !== 'done'}
          >
            Goodnight, Pip 🌙
          </button>
        )}

        {showFinalMessage && (
          <div className="dl-final-message" role="status" aria-live="polite">
            <span className="dl-final-label">GOODNIGHT FROM PIP</span>
            <p>
              &ldquo;The stars will keep you company. I&rsquo;ll meet you in
              your dreams.&rdquo;
            </p>
            <span className="dl-final-star" aria-hidden="true">
              ✦
            </span>
            <button
              type="button"
              className="dl-replay-button"
              onClick={replayGoodnight}
            >
              Replay the goodnight ✧
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="dreamland-footer">
        <div className="dl-footer-mark" aria-hidden="true">
          ✦
        </div>
        <p className="dl-footer-tagline">
          Made with a little magic, a lot of imagination, and Pip.
        </p>
        <p className="dl-footer-detail">Last updated at bedtime ✦</p>
        <div className="dl-footer-counter" role="status" aria-live="polite" aria-label={`Dreams delivered: ${displayedCount}. Local demo counter.`}>
          <span className="odometer-label">DREAMS DELIVERED</span>
          <span className="odometer-digits" aria-hidden="true">{displayedCount.split('').map((digit, index) => {
            const rolling = previousCount !== '' && previousCount[index] !== digit
            return <span className={`odometer-digit${rolling ? ' is-rolling' : ''}`} key={`${index}-${digit}`}>{digit}</span>
          })}</span>
          <small>LOCAL DEMO COUNTER · NOT LIVE VISITOR DATA</small>
        </div>

        <div className="dreamland-footer-links">
          <a
            href="https://github.com/sandhya-s11/pips-midnight-observatory"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ✧
          </a>
          {dreamlandDeploymentUrl && (
            <a href={dreamlandDeploymentUrl} target="_blank" rel="noopener noreferrer">
              Visit Dreamland ✧
            </a>
          )}
        </div>

        <button
          type="button"
          className="dl-back-beginning"
          onClick={scrollToTop}
        >
          Back to the Beginning ↑
        </button>

        <p className="dl-footer-credits">
          Character artwork: official haX.baby Pip asset pack
        </p>
      </footer>
    </section>
  )
}
