import { useCallback, useEffect, useRef, useState } from 'react'

import './App.css'
import MagicCabinet from './MagicCabinet.jsx'
import DreamlandGate from './DreamlandGate.jsx'
import MidnightStorybook from './MidnightStorybook.jsx'
import StardustCursor from './StardustCursor.jsx'



const dreams = [
  { id: 'moon-garden', label: 'Moon Garden', message: 'A moonflower opens just for you, and leaves a silver wish on its petals.' },
  { id: 'cloud-castle', label: 'Cloud Castle', message: 'A pillow-soft cloud carries you to a castle where every window glows.' },
  { id: 'sleepy-forest', label: 'Sleepy Forest', message: 'The forest hums a lullaby while fireflies tuck the sleepy trees in.' },
  { id: 'starlight-lake', label: 'Starlight Lake', message: 'A little boat drifts beneath the stars, carrying your gentlest thought.' },
]

const DREAMS_DELIVERED_STORAGE_KEY = 'pip-midnight-observatory-dreams-delivered'

function readDeliveredDreams() {
  try {
    const stored = Number(window.localStorage.getItem(DREAMS_DELIVERED_STORAGE_KEY))
    return Number.isSafeInteger(stored) && stored >= 0 ? stored : 0
  } catch {
    return 0
  }
}



const pipStoryScenes = [

  { title: 'A Dream Begins', text: 'Once upon a midnight… I had the tiniest dream.', image: '/images/Sleepy_pip.png', alt: 'Sleepy Pip resting on a cloud beneath the midnight sky', className: 'dream' },

  { title: 'A Tiny Twinkle', text: 'Huh? Who left that little sparkle there?', image: '/images/Curious_pip.png', alt: 'Curious Pip looking toward a golden star', className: 'twinkle' },

  { title: 'Follow the Stars', text: 'Wait for me, little star!', image: '/images/Curious_pip.png', alt: 'Curious Pip following the constellation trail', className: 'follow' },

  { title: 'The Secret Observatory', text: 'A secret place, where every little light had a home.', image: '/images/pip_avatar_cloud.png', alt: 'Pip discovering the observatory above the clouds', className: 'observatory' },

  { title: 'A Little Promise', text: "I'll make sure nobody dreams alone.", image: '/images/pip_avatar_cloud.png', alt: 'Pip helping the stars find their places', className: 'promise' },

  { title: 'The Dream Engineer', text: "And that's how I became your little Dream Engineer. ✨", image: '/images/pip_avatar_cloud.png', alt: 'Pip beneath a sky filled with stars', className: 'engineer' },

]



const hiddenStoryStars = [

  { id: 'first-light', label: 'the first light', scene: 0, left: '18%', top: '42%', memory: 'Pip learned that even the tiniest light can make the dark feel kind.' },

  { id: 'star-trail', label: 'the star trail', scene: 2, left: '78%', top: '35%', memory: 'Every star had a place to be, and every path began with one brave step.' },

  { id: 'promise-star', label: 'the promise star', scene: 4, left: '22%', top: '31%', memory: 'A promise can shine like a lantern when someone feels alone.' },

]



const nightlightHiddenStars = [
  { id: 'garden-star-a', left: '18%', top: '23%', label: 'the first hidden star' },
  { id: 'garden-star-b', left: '78%', top: '24%', label: 'the second hidden star' },
  { id: 'garden-star-c', left: '80%', top: '66%', label: 'the third hidden star' },
]

const nightlightFloatingLanterns = [
  { id: 'lantern-a', left: '8%', top: '38%', size: 52, delay: 0, duration: 14, drift: -18, rotate: -4, clickable: true, message: 'A dream of courage.' },
  { id: 'lantern-b', left: '88%', top: '34%', size: 46, delay: 1.2, duration: 17, drift: 22, rotate: 5, clickable: false },
  { id: 'lantern-c', left: '22%', top: '18%', size: 40, delay: 0.6, duration: 12, drift: -12, rotate: -6, clickable: true, message: 'A pocket of sunshine.' },
  { id: 'lantern-d', left: '72%', top: '16%', size: 44, delay: 2.1, duration: 15, drift: 16, rotate: 4, clickable: false },
  { id: 'lantern-e', left: '6%', top: '58%', size: 38, delay: 1.8, duration: 13, drift: -10, rotate: 3, clickable: true, message: 'A wish for tomorrow.' },
  { id: 'lantern-f', left: '90%', top: '52%', size: 42, delay: 0.9, duration: 16, drift: 14, rotate: -5, clickable: false },
]

function NightlightGarden({ muted, onBack, reducedMotion }) {
  const [welcomeVisible, setWelcomeVisible] = useState(true)
  const [lanternOn, setLanternOn] = useState(false)
  const [collectedStars, setCollectedStars] = useState([])
  const [dreamMessage, setDreamMessage] = useState(null)
  const [lanternFlash, setLanternFlash] = useState(null)
  const [pulseTick, setPulseTick] = useState(0)
  const welcomeAudioRef = useRef(null)
  const welcomeTimerRef = useRef(null)
  const welcomeStartPendingRef = useRef(false)
  const welcomeStartedRef = useRef(false)
  const welcomeCompleteRef = useRef(false)
  const welcomeMutedRef = useRef(muted)
  const chimeContextRef = useRef(null)
  const dreamTimerRef = useRef(null)
  const collectedRef = useRef(new Set())
  const lanternChimeLockRef = useRef(false)
  const pulseTimerRef = useRef(null)
  const completionRef = useRef(false)

  const finishWelcome = useCallback(() => {
    welcomeCompleteRef.current = true
    setWelcomeVisible(false)
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    welcomeTimerRef.current = null
  }, [])

  const playGardenChime = useCallback(() => {
    if (muted) return
    if (lanternChimeLockRef.current) return
    lanternChimeLockRef.current = true
    window.setTimeout(() => { lanternChimeLockRef.current = false }, 380)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    try {
      if (chimeContextRef.current) chimeContextRef.current.close()
      const context = new AudioContextClass()
      chimeContextRef.current = context
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.22)
      envelope.gain.setValueAtTime(0.0001, context.currentTime)
      envelope.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.025)
      envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42)
      oscillator.connect(envelope)
      envelope.connect(context.destination)
      oscillator.onended = () => {
        context.close()
        if (chimeContextRef.current === context) chimeContextRef.current = null
      }
      oscillator.start()
      oscillator.stop(context.currentTime + 0.44)
    } catch {
      chimeContextRef.current = null
    }
  }, [muted])

  const failWelcome = useCallback(() => {
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    welcomeTimerRef.current = window.setTimeout(finishWelcome, 5500)
  }, [finishWelcome])

  const triggerLanternPulse = useCallback(() => {
    setLanternOn(true)
    setPulseTick((tick) => tick + 1)
    if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current)
    pulseTimerRef.current = window.setTimeout(() => {
      pulseTimerRef.current = null
    }, 2000)
    playGardenChime()
  }, [playGardenChime])

  const toggleCentralLantern = () => {
    if (lanternOn) {
      setLanternOn(false)
      return
    }
    triggerLanternPulse()
  }

  const collectStar = (id) => {
    if (collectedRef.current.has(id)) return
    collectedRef.current.add(id)
    setCollectedStars([...collectedRef.current])
    playGardenChime()
  }

  const revealDreamMessage = (lantern) => {
    if (!lantern.clickable || !lantern.message) return
    if (dreamTimerRef.current) window.clearTimeout(dreamTimerRef.current)
    setLanternFlash(lantern.id)
    setDreamMessage({ id: lantern.id, text: lantern.message, left: lantern.left, top: lantern.top })
    window.setTimeout(() => setLanternFlash(null), 520)
    dreamTimerRef.current = window.setTimeout(() => {
      setDreamMessage(null)
      dreamTimerRef.current = null
    }, 3400)
  }

  useEffect(() => {
    if (collectedStars.length === 3 && !completionRef.current) {
      completionRef.current = true
      setLanternOn(true)
      triggerLanternPulse()
    }
  }, [collectedStars, triggerLanternPulse])

  useEffect(() => {
    welcomeMutedRef.current = muted
    if (muted) {
      if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
      welcomeTimerRef.current = null
      welcomeStartPendingRef.current = false
      welcomeAudioRef.current?.pause()
      if (!welcomeStartedRef.current && !welcomeCompleteRef.current) {
        welcomeTimerRef.current = window.setTimeout(finishWelcome, 6500)
      }
      return () => { if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current) }
    }
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    welcomeTimerRef.current = null
    if (welcomeCompleteRef.current) return undefined
    const handleFinish = () => finishWelcome()
    const audio = welcomeAudioRef.current
    if (audio) {
      audio.onended = handleFinish
      audio.onerror = failWelcome
      if (audio.paused && !audio.ended && welcomeStartedRef.current) {
        audio.play().catch(() => { if (!welcomeMutedRef.current) failWelcome() })
      }
      return () => { if (audio.onended === handleFinish) audio.onended = null }
    }
    if (welcomeStartedRef.current || welcomeStartPendingRef.current) return undefined
    welcomeStartPendingRef.current = true
    welcomeTimerRef.current = window.setTimeout(() => {
      welcomeTimerRef.current = null
      welcomeStartPendingRef.current = false
      if (welcomeMutedRef.current || welcomeCompleteRef.current || welcomeStartedRef.current) return
      welcomeStartedRef.current = true
      try {
        const greeting = new Audio('/audio/nightlight_welcome_messsage.mp3')
        greeting.preload = 'auto'
        greeting.volume = 0.86
        greeting.onended = handleFinish
        greeting.onerror = failWelcome
        welcomeAudioRef.current = greeting
        greeting.play().catch(() => { if (!welcomeMutedRef.current) failWelcome() })
      } catch {
        failWelcome()
      }
    }, 450)
    return () => {
      if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
      welcomeTimerRef.current = null
      welcomeStartPendingRef.current = false
    }
  }, [muted, finishWelcome, failWelcome])

  useEffect(() => () => {
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    if (dreamTimerRef.current) window.clearTimeout(dreamTimerRef.current)
    if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current)
    if (welcomeAudioRef.current) {
      welcomeAudioRef.current.pause()
      welcomeAudioRef.current.currentTime = 0
      welcomeAudioRef.current.src = ''
    }
    if (chimeContextRef.current) chimeContextRef.current.close()
  }, [])

  const constellationPoints = nightlightHiddenStars.map((star) => {
    const left = parseFloat(star.left)
    const top = parseFloat(star.top)
    return { x: left, y: top }
  })

  return (
    <section
      className={`nightlight-garden ${lanternOn ? 'lantern-lit' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}
      aria-label="The Nightlight Garden lantern fairytale"
    >
      <div className="nightlight-garden-bg" aria-hidden="true">
        <img src="/images/lantern_bg.png" alt="" />
      </div>
      <div key={pulseTick} className="nightlight-garden-glow" aria-hidden="true" />
      <div className="nightlight-toolbar">
        <button type="button" className="nightlight-back" onClick={onBack}>&#x2190; Back to Workshop</button>
      </div>
      <header className={`nightlight-welcome ${welcomeVisible ? 'is-visible' : ''}`} aria-live="polite">
        <p className="eyebrow">A NOTE FROM PIP</p>
        <h2>Welcome to the Nightlight Garden! <span aria-hidden="true">&#x2728;</span></h2>
        <p>&ldquo;Psst&hellip; the night is hiding a thousand little secrets. Shall we light them up?&rdquo;</p>
      </header>
      <div className="nightlight-scene">
        <span className="nightlight-firefly firefly-a" aria-hidden="true" />
        <span className="nightlight-firefly firefly-b" aria-hidden="true" />
        <span className="nightlight-firefly firefly-c" aria-hidden="true" />
        <span className="nightlight-firefly firefly-d" aria-hidden="true" />
        <span className="nightlight-firefly firefly-e" aria-hidden="true" />
        {lanternOn && (
          <div className="nightlight-particles" aria-hidden="true">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>
        )}
        {nightlightFloatingLanterns.map((lantern) => {
          const LanternTag = lantern.clickable ? 'button' : 'div'
          const props = lantern.clickable
            ? {
                type: 'button',
                onClick: () => revealDreamMessage(lantern),
                'aria-label': `Discover a dream message from the ${lantern.id.replace('-', ' ')}`,
              }
            : { 'aria-hidden': true }
          return (
            <LanternTag
              key={lantern.id}
              className={`nightlight-mini-lantern ${lanternFlash === lantern.id ? 'flash' : ''}`}
              style={{
                '--lantern-left': lantern.left,
                '--lantern-top': lantern.top,
                '--lantern-size': `${lantern.size}px`,
                '--float-delay': `${lantern.delay}s`,
                '--float-duration': `${lantern.duration}s`,
                '--float-drift': `${lantern.drift}px`,
                '--float-rotate': `${lantern.rotate}deg`,
              }}
              {...props}
            >
              <svg viewBox="0 0 48 72" aria-hidden="true">
                <path d="M18 10V6a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M14 18h20l-2 42H16z" fill="currentColor" opacity="0.85" />
                <path d="M16 28h16M17 48h14" stroke="#1a1428" strokeWidth="1.5" opacity="0.35" />
                <path className="mini-lantern-flame" d="M24 32l-4 8h8z" />
              </svg>
              {lantern.clickable && lanternFlash === lantern.id && <span className="mini-lantern-sparkle" aria-hidden="true">&#x2727;</span>}
            </LanternTag>
          )
        })}
        {dreamMessage && (
          <p
            className="nightlight-dream-message"
            style={{ '--msg-left': dreamMessage.left, '--msg-top': dreamMessage.top }}
            role="status"
            aria-live="polite"
          >
            {dreamMessage.text}
          </p>
        )}
        {nightlightHiddenStars.map((star) => {
          const discovered = collectedStars.includes(star.id)
          return (
            <button
              key={star.id}
              type="button"
              data-silent-click className={`nightlight-hidden-star ${discovered ? 'discovered' : 'revealed'}`}
              style={{ '--star-left': star.left, '--star-top': star.top }}
              onClick={() => collectStar(star.id)}
              disabled={discovered}
              aria-label={`Discover ${star.label}`}
              aria-pressed={discovered}
            >
              <span aria-hidden="true">&#x2726;</span>
              {discovered && <span className="star-burst" aria-hidden="true">&#x2727; &#x2726; &#x2727;</span>}
            </button>
          )
        })}
        {collectedStars.length === 3 && (
          <>
            <div className="nightlight-constellation-burst" aria-hidden="true" />
            <svg className="nightlight-constellation" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path
                d={`M ${constellationPoints[0].x} ${constellationPoints[0].y} L ${constellationPoints[1].x} ${constellationPoints[1].y} L ${constellationPoints[2].x} ${constellationPoints[2].y}`}
              />
              {constellationPoints.map((point, index) => (
                <circle key={nightlightHiddenStars[index].id} cx={point.x} cy={point.y} r="1.2" />
              ))}
            </svg>
          </>
        )}
        <div className="nightlight-central-stage">
          <button
            type="button"
            data-silent-click className="nightlight-central-lantern"
            onClick={toggleCentralLantern}
            aria-pressed={lanternOn}
            aria-label={lanternOn ? "Turn off Pip's dream lantern" : "Light Pip's dream lantern"}
          >
            <span className="nightlight-lantern-halo" aria-hidden="true" />
            <span className="nightlight-lantern-shadow" aria-hidden="true" />
            <img src="/images/pip_dream_lantern.png" alt="" />
            {lanternOn && <span className="nightlight-lantern-sparkles" aria-hidden="true">&#x2726; &#x2727; &#x2726;</span>}
          </button>
        </div>
      </div>
      <div className="nightlight-star-counter" aria-live="polite">
        <span aria-hidden="true">&#x2726;</span> Stars discovered: {collectedStars.length}/3
      </div>
      {collectedStars.length === 3 && (
        <div className="nightlight-secret-note" role="status" aria-live="polite">
          <p>Even the tiniest light can make the whole night magical.</p>
        </div>
      )}
    </section>
  )
}

function LullabyFairytale({ muted, onBack }) {
  const [boxOpen, setBoxOpen] = useState(false)
  const [welcomeVisible, setWelcomeVisible] = useState(true)
  const [collectedStars, setCollectedStars] = useState([])
  const musicAudioRef = useRef(null)
  const musicStartingRef = useRef(false)
  const musicIntentRef = useRef(false)
  const chimeContextRef = useRef(null)
  const fadeTimerRef = useRef(null)
  const welcomeTimerRef = useRef(null)
  const welcomeAudioRef = useRef(null)
  const welcomeStartPendingRef = useRef(false)
  const welcomeStartedRef = useRef(false)
  const welcomeCompleteRef = useRef(false)
  const welcomeMutedRef = useRef(muted)
  const collectedRef = useRef(new Set())

  const finishWelcome = useCallback(() => {
    welcomeCompleteRef.current = true
    setWelcomeVisible(false)
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    welcomeTimerRef.current = null
  }, [])
  const startMusic = useCallback(() => {
    if (muted) return
    let music = musicAudioRef.current
    if (!music) {
      music = new Audio('/audio/lullaby_sound_effect.mp3')
      music.preload = 'auto'; music.loop = true; music.volume = 0.34
      musicAudioRef.current = music
    }
    if (!music.paused || musicStartingRef.current) return
    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current)
    fadeTimerRef.current = null; music.volume = 0.34
    musicStartingRef.current = true
    music.play().then(() => { musicStartingRef.current = false }).catch(() => { musicStartingRef.current = false })
  }, [muted])
  const failWelcome = useCallback(() => {
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    welcomeTimerRef.current = window.setTimeout(() => {
      finishWelcome()
      if (musicIntentRef.current && !welcomeMutedRef.current) startMusic()
    }, 5000)
  }, [finishWelcome, startMusic])
  const fadeMusic = useCallback(() => {
    const music = musicAudioRef.current
    if (!music || (music.paused && !musicStartingRef.current)) return
    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current)
    let step = 0
    fadeTimerRef.current = window.setInterval(() => {
      step += 1; music.volume = Math.max(0, 0.34 * (1 - step / 6))
      if (step >= 6) { window.clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; music.pause(); music.currentTime = 0; music.volume = 0.34; musicStartingRef.current = false }
    }, 45)
  }, [])
  const toggleMusicBox = () => {
    if (boxOpen) { musicIntentRef.current = false; setBoxOpen(false); fadeMusic(); return }
    musicIntentRef.current = true
    setBoxOpen(true)
    if (welcomeCompleteRef.current && !muted) startMusic()
  }
  const playCollectibleChime = () => {
    if (muted) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    try {
      if (chimeContextRef.current) chimeContextRef.current.close()
      const context = new AudioContextClass(); chimeContextRef.current = context
      const oscillator = context.createOscillator(); const envelope = context.createGain()
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(880, context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.22)
      envelope.gain.setValueAtTime(0.0001, context.currentTime); envelope.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.025); envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42)
      oscillator.connect(envelope); envelope.connect(context.destination)
      oscillator.onended = () => { context.close(); if (chimeContextRef.current === context) chimeContextRef.current = null }
      oscillator.start(); oscillator.stop(context.currentTime + 0.44)
    } catch { chimeContextRef.current = null }
  }
  const collectStar = (id) => {
    if (collectedRef.current.has(id)) return
    collectedRef.current.add(id); setCollectedStars([...collectedRef.current]); playCollectibleChime()
  }

  useEffect(() => {
    welcomeMutedRef.current = muted
    if (muted) {
      if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
      welcomeTimerRef.current = null
      welcomeStartPendingRef.current = false
      welcomeAudioRef.current?.pause()
      fadeMusic()
      if (!welcomeStartedRef.current && !welcomeCompleteRef.current) {
        welcomeTimerRef.current = window.setTimeout(finishWelcome, 6500)
      }
      return () => { if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current) }
    }
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    welcomeTimerRef.current = null
    if (welcomeCompleteRef.current) {
      if (musicIntentRef.current) startMusic()
      return undefined
    }
    const handleFinish = () => {
      finishWelcome()
      if (musicIntentRef.current && !welcomeMutedRef.current) startMusic()
    }
    const audio = welcomeAudioRef.current
    if (audio) {
      audio.onended = handleFinish
      audio.onerror = failWelcome
      if (audio.paused && !audio.ended && welcomeStartedRef.current) {
        audio.play().catch(() => { if (!welcomeMutedRef.current) failWelcome() })
      }
      return () => { if (audio.onended === handleFinish) audio.onended = null }
    }
    if (welcomeStartedRef.current || welcomeStartPendingRef.current) return undefined
    welcomeStartPendingRef.current = true
    welcomeTimerRef.current = window.setTimeout(() => {
      welcomeTimerRef.current = null
      welcomeStartPendingRef.current = false
      if (welcomeMutedRef.current || welcomeCompleteRef.current || welcomeStartedRef.current) return
      welcomeStartedRef.current = true
      let greeting
      try {
        greeting = new Audio('/audio/welcome_lullaby.mp3')
        greeting.preload = 'auto'
        greeting.volume = 0.86
        greeting.onended = handleFinish
        greeting.onerror = failWelcome
        welcomeAudioRef.current = greeting
        greeting.play().catch(() => { if (!welcomeMutedRef.current) failWelcome() })
      } catch {
        failWelcome()
      }
    }, 450)
    return () => {
      if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
      welcomeTimerRef.current = null
      welcomeStartPendingRef.current = false
    }
  }, [muted, finishWelcome, failWelcome, startMusic, fadeMusic])
  useEffect(() => () => {
    if (welcomeTimerRef.current) window.clearTimeout(welcomeTimerRef.current)
    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current)
    if (welcomeAudioRef.current) { welcomeAudioRef.current.pause(); welcomeAudioRef.current.currentTime = 0; welcomeAudioRef.current.src = '' }
    if (musicAudioRef.current) { musicAudioRef.current.pause(); musicAudioRef.current.currentTime = 0; musicAudioRef.current.src = '' }
    if (chimeContextRef.current) chimeContextRef.current.close()
  }, [])

  return <section className={`lullaby-fairytale ${boxOpen ? 'box-playing' : ''}`} aria-label="The Lullaby Lab music fairytale">
    <div className="lullaby-room-arch" aria-hidden="true"/><div className="lullaby-starfield" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
    <div className="lullaby-window" aria-hidden="true"><span className="lullaby-moon"/><span className="lullaby-cloud cloud-drift-one"/><span className="lullaby-cloud cloud-drift-two"/></div>
    <div className="lullaby-cloud cloud-foreground-one" aria-hidden="true"/><div className="lullaby-cloud cloud-foreground-two" aria-hidden="true"/>
    <div className="lullaby-upper-stars" aria-hidden="true">&#x2727; <i>&#x2726;</i> &#x2727; <i>&#x2726;</i> &#x2727;</div>
    <div className="lullaby-toolbar"><button className="lullaby-back" onClick={onBack}>&#x2190; Back to Workshop</button></div>
    <header className={`lullaby-welcome ${welcomeVisible ? 'is-visible' : ''}`} aria-live="polite"><p className="eyebrow">A NOTE FROM PIP</p><h2>Welcome to the Lullaby Lab! <span aria-hidden="true">&#x1F319;</span></h2><p>&ldquo;Psst&hellip; Pip has a little melody waiting just for you. Shall we wake the magic inside?&rdquo;</p></header>
    <div className="lullaby-shelves" aria-hidden="true"><span/><span/><span/></div>
    <div className="lullaby-diorama">
      <div className="mini-toy toy-teddy" aria-hidden="true"><svg viewBox="0 0 100 120"><circle cx="28" cy="25" r="13"/><circle cx="72" cy="25" r="13"/><circle cx="50" cy="48" r="31"/><ellipse cx="50" cy="91" rx="29" ry="24"/><ellipse cx="25" cy="88" rx="11" ry="17"/><ellipse cx="75" cy="88" rx="11" ry="17"/><circle cx="40" cy="45" r="3"/><circle cx="60" cy="45" r="3"/><ellipse cx="50" cy="57" rx="8" ry="5"/><path d="M45 63q5 6 10 0"/></svg></div>
      <div className="mini-toy toy-bunny" aria-hidden="true"><svg viewBox="0 0 100 130"><path d="M37 38Q17 4 28 2q19 3 22 36M61 38Q86 3 91 14q4 16-20 34"/><circle cx="50" cy="55" r="29"/><ellipse cx="50" cy="100" rx="29" ry="24"/><circle cx="40" cy="53" r="3"/><circle cx="60" cy="53" r="3"/><path d="M47 63q3-4 6 0m-6 0q3 7 6 0"/></svg></div>
      <div className="mini-toy toy-robot" aria-hidden="true"><svg viewBox="0 0 100 120"><path d="M50 14v13m-5-13h10"/><rect x="24" y="26" width="52" height="45" rx="12"/><circle cx="40" cy="45" r="4"/><circle cx="60" cy="45" r="4"/><path d="M41 58h18m-40-18h5m52 0h5"/><rect x="33" y="74" width="34" height="25" rx="7"/><path d="M41 99v12m18-12v12m-18-39v-7m18 7v-7"/></svg></div>
      <div className="lullaby-flower flower-left" aria-hidden="true">&#x273F;</div><div className="lullaby-flower flower-right" aria-hidden="true">&#x273F;</div>
      <span className="lullaby-firefly firefly-one" aria-hidden="true"/><span className="lullaby-firefly firefly-two" aria-hidden="true"/><span className="lullaby-firefly firefly-three" aria-hidden="true"/>
      <div className="lullaby-box-stage"><span className="box-warm-halo" aria-hidden="true"/><span className="box-dust dust-a" aria-hidden="true">&#x2727;</span><span className="box-dust dust-b" aria-hidden="true">&#x2726;</span><span className="box-dust dust-c" aria-hidden="true">&#x2727;</span>
        <span className="rising-note note-one" aria-hidden="true">&#x266A;<i>&#x2726;</i></span><span className="rising-note note-two" aria-hidden="true">&#x266B;<i>&#x2727;</i></span><span className="rising-note note-three" aria-hidden="true">&#x266A;<i>&#x2726;</i></span><span className="rising-note note-four" aria-hidden="true">&#x266B;<i>&#x2726;</i></span><span className="rising-note note-five" aria-hidden="true">&#x266A;<i>&#x2727;</i></span>
        <button data-silent-click className="lullaby-box-button" onClick={toggleMusicBox} aria-pressed={boxOpen} aria-label={boxOpen ? 'Close the music box and stop the lullaby' : 'Open the music box and start the lullaby'}><img src="/images/pip_lullaby_box.png" alt="Pip's pastel carousel music box"/><span className="lullaby-winding-key" aria-hidden="true">&#x2699;</span></button>
        <button data-silent-click className={`lullaby-collectible collectible-one ${collectedStars.includes('one') ? 'collected' : ''}`} onClick={()=>collectStar('one')} disabled={collectedStars.includes('one')} aria-label="Collect the first floating star"><span>&#x2726;</span></button>
        <button data-silent-click className={`lullaby-collectible collectible-two ${collectedStars.includes('two') ? 'collected' : ''}`} onClick={()=>collectStar('two')} disabled={collectedStars.includes('two')} aria-label="Collect the second floating star"><span>&#x2727;</span></button>
        <button data-silent-click className={`lullaby-collectible collectible-three ${collectedStars.includes('three') ? 'collected' : ''}`} onClick={()=>collectStar('three')} disabled={collectedStars.includes('three')} aria-label="Collect the third floating star"><span>&#x2726;</span></button>
      </div>
      <div className="lullaby-platform" aria-hidden="true"><span/></div>
    </div>
    <div className="lullaby-star-counter" aria-live="polite"><span aria-hidden="true">&#x2726;</span> {collectedStars.length} / 3 <small>little stars</small></div>
    {collectedStars.length === 3 && <div className="lullaby-secret-note" role="status" aria-live="polite"><svg viewBox="0 0 220 55" aria-hidden="true"><path d="M12 36 57 14 101 38 151 12 207 32"/><circle cx="12" cy="36" r="3"/><circle cx="57" cy="14" r="3"/><circle cx="101" cy="38" r="3"/><circle cx="151" cy="12" r="3"/><circle cx="207" cy="32" r="3"/></svg><p>Every little melody holds a dream. Sweet dreams, little star! <span aria-hidden="true">&#x2728;</span></p></div>}
  </section>
}

const deliveryPoints = {
  start: { x: 300, y: 450 },
  'moon-garden': { x: 256, y: 309 },
  'cloud-castle': { x: 640, y: 247 },
  'sleepy-forest': { x: 410, y: 460 },
  'starlight-lake': { x: 873, y: 304 },
}

const deliveryRouteNodes = ['moon-garden', 'start', 'sleepy-forest', 'cloud-castle', 'starlight-lake']
const deliveryRouteControls = [
  { x: 240, y: 415 },
  { x: 350, y: 478 },
  { x: 530, y: 260 },
  { x: 810, y: 90 },
]

function getDeliveryPath(fromId, toId) {
  const fromIndex = deliveryRouteNodes.indexOf(fromId)
  const toIndex = deliveryRouteNodes.indexOf(toId)
  const step = fromIndex < toIndex ? 1 : -1
  let path = `M ${deliveryPoints[fromId].x} ${deliveryPoints[fromId].y}`
  for (let index = fromIndex; index !== toIndex; index += step) {
    const edge = step > 0 ? index : index - 1
    const control = deliveryRouteControls[edge]
    const next = deliveryPoints[deliveryRouteNodes[index + step]]
    path += ` Q ${control.x} ${control.y} ${next.x} ${next.y}`
  }
  return { path, edges: Math.abs(toIndex - fromIndex) }
}

function DreamDeliveryRoutes({ muted, onBack, reducedMotion, playChime }) {
  const [deliveredRoutes, setDeliveredRoutes] = useState([])
  const [bonusStars, setBonusStars] = useState([])
  const [currentLocation, setCurrentLocation] = useState('start')
  const [currentPoint, setCurrentPoint] = useState(deliveryPoints.start)
  const [flight, setFlight] = useState(null)
  const [dream, setDream] = useState(null)
  const [welcomeVisible, setWelcomeVisible] = useState(true)
  const [welcomeDone, setWelcomeDone] = useState(false)
  const [sparkleStar, setSparkleStar] = useState(null)
  const welcomeAudioRef = useRef(null)
  const musicAudioRef = useRef(null)
  const audioStartRef = useRef(null)
  const welcomeStartedRef = useRef(false)
  const mutedRef = useRef(muted)
  const lastMutedRef = useRef(muted)
  const timerRef = useRef(null)
  const welcomeTimerRef = useRef(null)
  const currentPointRef = useRef(currentPoint)

  useEffect(() => {
    const welcome = new Audio('/audio/dream_delivery_voice.mp3')
    const music = new Audio('/audio/dream_delivery_effect.mp3')
    welcomeAudioRef.current = welcome
    musicAudioRef.current = music
    welcome.preload = 'auto'
    welcome.volume = 0.82
    music.preload = 'auto'
    music.volume = 0.34
    music.loop = true
    let completed = false
    const finishWelcome = () => {
      if (completed) return
      completed = true
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current)
      setWelcomeVisible(false)
      setWelcomeDone(true)
      if (!mutedRef.current) {
        music.currentTime = 0
        music.play().catch(() => {})
      }
    }
    welcome.onended = finishWelcome
    welcome.onerror = finishWelcome
    if (!mutedRef.current) audioStartRef.current = window.setTimeout(() => {
      if (mutedRef.current || completed) return
      welcomeStartedRef.current = true
      welcome.play().catch(finishWelcome)
    }, 350)
    welcomeTimerRef.current = window.setTimeout(finishWelcome, mutedRef.current ? 6000 : 20000)
    return () => {
      welcome.pause(); welcome.currentTime = 0; welcome.src = ''
      music.pause(); music.currentTime = 0; music.src = ''
      if (audioStartRef.current) clearTimeout(audioStartRef.current)
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    mutedRef.current = muted
    if (lastMutedRef.current !== muted && muted) {
      welcomeAudioRef.current?.pause()
      musicAudioRef.current?.pause()
    }
    if (lastMutedRef.current !== muted && !muted) {
      if (welcomeDone) musicAudioRef.current?.play().catch(() => {})
      else if (welcomeAudioRef.current && !welcomeStartedRef.current) {
        if (audioStartRef.current) clearTimeout(audioStartRef.current)
        welcomeStartedRef.current = true
        welcomeAudioRef.current.play().catch(() => { setWelcomeVisible(false); setWelcomeDone(true); musicAudioRef.current?.play().catch(() => {}) })
      } else welcomeAudioRef.current?.play().catch(() => {})
    }
    lastMutedRef.current = muted
  }, [muted, welcomeDone])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const deliver = (item) => {
    if (flight || !welcomeDone) return
    const from = currentPointRef.current
    const to = deliveryPoints[item.id]
    const route = getDeliveryPath(currentLocation, item.id)
    const duration = reducedMotion ? 40 : Math.min(4000, Math.max(2200, route.edges * 1150))
    setDream(null)
    setFlight({ id: item.id, from, path: route.path, to, duration })
    timerRef.current = window.setTimeout(() => {
      currentPointRef.current = to
      setCurrentPoint(to)
      setCurrentLocation(item.id)
      setFlight(null)
      setDream(item)
      setDeliveredRoutes((previous) => previous.includes(item.id) ? previous : [...previous, item.id])
      playChime()
    }, duration)
  }

  const collectBonus = (id) => {
    if (bonusStars.includes(id) || flight || !welcomeDone) return
    setBonusStars((previous) => [...previous, id])
    setSparkleStar(id)
    window.setTimeout(() => setSparkleStar(null), 700)
    playChime()
  }

  return <>
    <div className="delivery-map storybook-map">
      <div className="delivery-controls"><button type="button" className="delivery-back" onClick={onBack}>&#x2190; Back to Workshop</button></div>
      <div className="delivery-scene-title"><p className="eyebrow">PIP'S MIDNIGHT OBSERVATORY</p><h2>Dream Delivery Routes <span aria-hidden="true">&#x2728;</span></h2></div>
      <div className="delivery-decorations" aria-hidden="true"><i className="drift-cloud cloud-one">&#x2601;</i><i className="drift-cloud cloud-two">&#x2601;</i><i className="drift-cloud cloud-three">&#x2601;</i><i className="shooting-star">&#x2726;</i><i className="sleepy-moon">&#x263E;</i><i className="dream-parcel">&#x2709;</i><i className="sky-dust dust-one">&#x2727;</i><i className="sky-dust dust-two">&#x2726;</i><i className="sky-dust dust-three">&#x2727;</i></div>
      <svg className="delivery-route-svg" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        <path className="delivery-route route-draw" d="M256 309 Q240 415 300 450 Q350 478 410 460 Q530 260 640 247 Q810 90 873 304" />
        {flight && <path className="delivery-route route-flight" pathLength="1" style={{ '--flight-duration': `${flight.duration}ms` }} d={flight.path} />}
        <g className="route-star-markers" aria-hidden="true"><circle cx="350" cy="455" r="5"/><circle cx="520" cy="335" r="5"/><circle cx="760" cy="190" r="5"/></g>
        {deliveredRoutes.length === 4 && <path className="delivery-constellation" d="M256 309 L410 460 L640 247 L873 304 Z" />}
        {flight && <g className="flight-trail" aria-hidden="true"><text x="-24" y="-17">✦<animateMotion dur={`${flight.duration}ms`} fill="freeze" path={flight.path}/></text><text x="-39" y="12">✧<animateMotion dur={`${flight.duration}ms`} begin="120ms" fill="freeze" path={flight.path}/></text></g>}
        {flight && <image className="travelling-pip in-flight" href="/images/pip_avatar_cloud.png" width="88" height="88" x="-44" y="-44"><animateMotion key={flight.id} dur={`${flight.duration}ms`} fill="freeze" path={flight.path} /></image>}
        {!flight && <image className={`travelling-pip parked-pip ${deliveredRoutes.length === 4 ? 'pip-happy' : ''}`} href="/images/pip_avatar_cloud.png" width="82" height="82" x={currentPoint.x - 41} y={currentPoint.y - 41} />}
      </svg>
      {dreams.map((item) => <button key={item.id} data-silent-click className={`delivery-destination destination-${item.id} ${deliveredRoutes.includes(item.id) ? 'visited' : ''} ${flight?.id === item.id ? 'selected' : ''} ${dream?.id === item.id ? 'arrived' : ''} ${flight ? 'flight-locked' : ''}`} style={{ left: `${deliveryPoints[item.id].x / 10}%`, top: `${deliveryPoints[item.id].y / 6.2}%` }} onClick={() => deliver(item)} disabled={Boolean(flight) || !welcomeDone} aria-label={`${deliveredRoutes.includes(item.id) ? 'Explore' : 'Deliver a dream to'} ${item.label}`} aria-pressed={deliveredRoutes.includes(item.id)}><span aria-hidden="true">{deliveredRoutes.includes(item.id) ? '✦' : '✧'}</span><small>{item.label}</small></button>)}
      {[{ id: 'one', left: '36%', top: '36%' }, { id: 'two', left: '67%', top: '48%' }, { id: 'three', left: '28%', top: '73%' }].map((star) => <button key={star.id} data-silent-click className={`route-bonus-star ${bonusStars.includes(star.id) ? 'collected' : ''} ${sparkleStar === star.id ? 'burst' : ''}`} style={{ left: star.left, top: star.top }} onClick={() => collectBonus(star.id)} disabled={bonusStars.includes(star.id) || Boolean(flight) || !welcomeDone} aria-label={`Collect bonus star ${star.id}`}><span aria-hidden="true">✦</span></button>)}
      {dream && <div className={`delivery-arrival arrival-${dream.id}`} role="status" aria-live="polite"><span>DREAM DELIVERED! / {dream.label.toUpperCase()}</span><p>{({ 'moon-garden': 'A little garden where lost wishes grow. Your moonflower opens and keeps one soft wish safe.', 'cloud-castle': 'A fluffy castle keeps brave dreams safe. Pip tucks your courage beneath a silver roof.', 'sleepy-forest': 'A quiet forest where tired stars come to rest. The fireflies hum you a gentle goodnight.', 'starlight-lake': "A sparkling lake reflects tomorrow's dreams. One bright ripple carries yours home." })[dream.id]}</p><i className="arrival-decoration" aria-hidden="true">{dream.id === 'moon-garden' ? '❀ ✧' : dream.id === 'cloud-castle' ? '⌂ ☁' : dream.id === 'sleepy-forest' ? '☾ · ✧' : '✦ )))'}</i><button type="button" onClick={() => setDream(null)}>Continue to another dream <span aria-hidden="true">&#x2192;</span></button></div>}{welcomeVisible && <div className="delivery-welcome" role="status" aria-live="polite"><p className="eyebrow">WELCOME TO DREAM DELIVERY ROUTES! <span aria-hidden="true">⭐</span></p><p>“Pip has four little dreams to deliver tonight. Pick a destination, hop aboard the cloud, and off we go!”</p></div>}
      {deliveredRoutes.length === 4 && <div className="delivery-complete" role="status" aria-live="polite"><strong>Delivery complete! ✨</strong><p>“Every dream found its way home. Sweet dreams, little star!”</p></div>}
    </div>
    <div className="delivery-progress" aria-live="polite">Dreams delivered: {deliveredRoutes.length}/4 <span aria-hidden="true">&#x2726;</span><span className="delivery-progress-stars" aria-label={`${deliveredRoutes.length} destination stars collected`}>{dreams.map((item) => <i key={item.id} className={deliveredRoutes.includes(item.id) ? 'earned' : ''} aria-hidden="true">&#x2726;</i>)}</span><span>Bonus stars: {bonusStars.length}/3</span></div>
  </>
}

function App() {

  const [nightMode, setNightMode] = useState(() => window.localStorage.getItem('pip-theme') !== 'day')

  const [menuOpen, setMenuOpen] = useState(false)

  const [playing, setPlaying] = useState(false)

  const [muted, setMuted] = useState(false)

  const [glow, setGlow] = useState(false)

  const [workshopView, setWorkshopView] = useState('workshop')
  const [activeProject, setActiveProject] = useState(null)
  const [bulbBurst, setBulbBurst] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)


  const [lanternPoint, setLanternPoint] = useState({ x: 50, y: 50 })

  const [secret, setSecret] = useState(false)

  const [sparkles, setSparkles] = useState(false)

  const [mood, setMood] = useState('Sleepy')

  const [pipMessage, setPipMessage] = useState('A little sleepy, a little curious, and very glad you’re here.')

  const [delivered, setDelivered] = useState(readDeliveredDreams)

  useEffect(() => {
    try {
      window.localStorage.setItem(DREAMS_DELIVERED_STORAGE_KEY, String(delivered))
    } catch {
      // Keep the in-memory counter working when storage is unavailable.
    }
  }, [delivered])

  const [pipGreeting, setPipGreeting] = useState(false)

  const [chaos, setChaos] = useState(false)

  const recordDreamDelivery = useCallback(() => setDelivered((count) => count + 1), [])

  const audioRef = useRef(null)

  const greetingAudioRef = useRef(null)

  const voiceAudioRef = useRef(null)

  const timersRef = useRef([])

  const greetingTimerRef = useRef(null)

  const greetingActiveRef = useRef(false)

  const greetingFallbackRef = useRef(false)

  const mutedRef = useRef(false)

  const heroRef = useRef(null)
  const pipPointerFrameRef = useRef(null)
  const pipPointerPositionRef = useRef({ x: 0, y: 0 })
  const pipReactionTimerRef = useRef(null)
  const [pipReacting, setPipReacting] = useState(false)

  const curtainTimerRef = useRef(null)

  const curtainStartedRef = useRef(false)

  const [curtainState, setCurtainState] = useState('idle')

  const [storyProgress, setStoryProgress] = useState(0)

  const [mysteryBoxOpen, setMysteryBoxOpen] = useState(false)

  const [mysteryBoxOpening, setMysteryBoxOpening] = useState(false)

  const [portalBurst, setPortalBurst] = useState(false)

  const [portalBurstParticles, setPortalBurstParticles] = useState([])

  const [portalBurstOrigin, setPortalBurstOrigin] = useState({ x: 0, y: 0 })

  const portalBurstStartedRef = useRef(false)

  const [collectedStars, setCollectedStars] = useState([])

  const [starStoryMemory, setStarStoryMemory] = useState('')

  const [portalOpen, setPortalOpen] = useState(false)

  const [portalHint, setPortalHint] = useState('')

  const collectedStarsRef = useRef(new Set())

  const starCounterRef = useRef(null)

  const chimeAudioRef = useRef(null)
  const workshopSoundRef = useRef(null)
  const doorAudioRef = useRef(null)
  const workshopTransitionTimersRef = useRef([])
  const workshopOpeningRef = useRef(false)

  const mysteryBoxStartedRef = useRef(false)

  const portalBurstTimersRef = useRef([])

  const portalSoundRef = useRef(null)

  const portalVoiceRef = useRef(null)
  const globalClickAudioRef = useRef(null)

  const statusMessage = mood === 'Curious' ? 'Pip is exploring...' : 'Pip is dreaming...'

  const playGlobalClick = useCallback(() => {
    const audio = globalClickAudioRef.current
    if (!audio || mutedRef.current) return
    audio.pause()
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])



  useEffect(() => { window.localStorage.setItem('pip-theme', nightMode ? 'night' : 'day') }, [nightMode])

  useEffect(() => {
    const audio = new Audio('/audio/drawer_click.mp3')
    audio.preload = 'auto'
    audio.volume = 0.2
    globalClickAudioRef.current = audio
    const onClick = (event) => {
      if (mutedRef.current || !event.target.closest('button, a, [role="button"]')) return
      if (event.target.closest('[data-silent-click]')) return
      audio.pause()
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      audio.pause()
      audio.src = ''
      globalClickAudioRef.current = null
    }
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])



  useEffect(() => () => {

    timersRef.current.forEach(clearTimeout)
    workshopTransitionTimersRef.current.forEach(clearTimeout)

    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current)

    if (audioRef.current) audioRef.current.close()

    if (greetingAudioRef.current) { greetingAudioRef.current.pause(); greetingAudioRef.current.src = '' }

    if (voiceAudioRef.current) { voiceAudioRef.current.pause(); voiceAudioRef.current.src = '' }

    if (portalVoiceRef.current) { portalVoiceRef.current.pause(); portalVoiceRef.current.src = '' }

    if (chimeAudioRef.current) chimeAudioRef.current.close()
    if (workshopSoundRef.current) { workshopSoundRef.current.close(); workshopSoundRef.current = null }
    if (doorAudioRef.current) { doorAudioRef.current.pause(); doorAudioRef.current.src = ''; doorAudioRef.current = null }

    portalBurstTimersRef.current.forEach(clearTimeout)

    if (portalSoundRef.current) portalSoundRef.current.close()

    if (curtainTimerRef.current) clearTimeout(curtainTimerRef.current)

    if (pipPointerFrameRef.current !== null) window.cancelAnimationFrame(pipPointerFrameRef.current)
    if (pipReactionTimerRef.current) clearTimeout(pipReactionTimerRef.current)

    window.speechSynthesis?.cancel()

  }, [])



  const beginCurtainEntrance = () => {

    if (curtainStartedRef.current) return

    curtainStartedRef.current = true

    setCurtainState('closed')

  }



  const openCurtains = () => {

    if (curtainState !== 'closed') return

    const about = document.getElementById('about')

    if (about) {

      const root = document.documentElement

      const previousScrollBehavior = root.style.scrollBehavior

      root.style.scrollBehavior = 'auto'

      about.scrollIntoView({ behavior: 'auto', block: 'start' })

      root.style.scrollBehavior = previousScrollBehavior

    }

    setCurtainState('opening')

    curtainTimerRef.current = window.setTimeout(() => {

      setCurtainState('done')

      curtainTimerRef.current = null

    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 1350)

  }



  useEffect(() => {

    const onKeyDown = (event) => {

      if (event.key === 'Tab' && curtainState === 'closed') {

        event.preventDefault()

        document.querySelector('.curtain-open')?.focus()

        return

      }

      if (event.key === 'Escape' && curtainState !== 'idle' && curtainState !== 'done') {

        if (curtainTimerRef.current) clearTimeout(curtainTimerRef.current)

        curtainTimerRef.current = null

        curtainStartedRef.current = true

        setCurtainState('done')

      }

    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)

  }, [curtainState])



  useEffect(() => {

    const about = document.querySelector('.about')

    if (!about || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {

      if (entries.some((entry) => entry.isIntersecting)) {

        if (!curtainStartedRef.current) {

          curtainStartedRef.current = true

          setCurtainState('closed')

        }

        observer.disconnect()

      }

    }, { threshold: 0.2 })

    observer.observe(about)

    return () => observer.disconnect()

  }, [])



  useEffect(() => {

    const section = document.querySelector('.pip-story')

    const scenes = [...(section?.querySelectorAll('.pip-story-scene') || [])]

    if (!section || scenes.length === 0) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches



    if ('IntersectionObserver' in window) {

      section.classList.add('story-reveal-ready')

      const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return

          entry.target.classList.add('is-visible')

          const index = Number(entry.target.dataset.storyScene)

          setStoryProgress((progress) => Math.max(progress, (index + 1) / scenes.length))

        })

      }, { threshold: 0.3 })

      scenes.forEach((scene) => observer.observe(scene))

      if (prefersReducedMotion) scenes.forEach((scene) => scene.classList.add('is-visible'))

      return () => observer.disconnect()

    }



    section.style.setProperty('--story-line-offset', '0')

    return undefined

  }, [])



  useEffect(() => {

    const section = document.querySelector('.pip-story')

    const scenes = [...(section?.querySelectorAll('.pip-story-scene') || [])]

    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let frame = null

    const updateParallax = () => {

      frame = null

      const center = window.innerHeight * 0.5

      scenes.forEach((scene) => {

        const bounds = scene.getBoundingClientRect()

        const offset = (bounds.top + bounds.height * 0.5 - center) * -0.035

        scene.style.setProperty('--pip-parallax', `${offset.toFixed(1)}px`)

      })

    }

    const onScroll = () => {

      if (frame === null) frame = window.requestAnimationFrame(updateParallax)

    }

    updateParallax()

    window.addEventListener('scroll', onScroll, { passive: true })

    window.addEventListener('resize', onScroll)

    return () => {

      window.removeEventListener('scroll', onScroll)

      window.removeEventListener('resize', onScroll)

      if (frame !== null) window.cancelAnimationFrame(frame)

    }

  }, [])



  useEffect(() => {

    const scenes = [...document.querySelectorAll('.story-scene')]

    if (!('IntersectionObserver' in window)) return

    const about = document.querySelector('.about')

    about?.classList.add('reveal-ready')

    scenes.forEach((scene) => scene.classList.add('reveal-ready'))

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {

      if (entry.isIntersecting) {

        entry.target.classList.add('is-visible')

        if (entry.target.classList.contains('about')) entry.target.classList.add('transition-played')

        observer.unobserve(entry.target)

      }

    }), { threshold: 0.18 })

    if (about) observer.observe(about)

    scenes.forEach((scene) => observer.observe(scene))

    return () => observer.disconnect()

  }, [])



  const playLullaby = async () => {

    if (!playing && mutedRef.current) return

    if (playing) {

      timersRef.current.forEach(clearTimeout)

      timersRef.current = []

      if (audioRef.current) { await audioRef.current.close(); audioRef.current = null }

      setPlaying(false)

      return

    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) return

    stopVoiceAudio()

    const context = new AudioContextClass()

    audioRef.current = context

    await context.resume()

    const master = context.createGain()

    master.gain.value = muted ? 0 : 0.16

    context._pipMaster = master

    master.connect(context.destination)

    const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25]

    setPlaying(true)

    notes.forEach((frequency, index) => {

      const timer = setTimeout(() => {

        if (context.state === 'closed') return

        const oscillator = context.createOscillator()

        const envelope = context.createGain()

        oscillator.type = 'sine'

        oscillator.frequency.value = frequency

        envelope.gain.setValueAtTime(0.0001, context.currentTime)

        envelope.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.04)

        envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.65)

        oscillator.connect(envelope); envelope.connect(master)

        oscillator.start(); oscillator.stop(context.currentTime + 0.7)

      }, index * 460)

      timersRef.current.push(timer)

    })

    timersRef.current.push(setTimeout(async () => {

      if (audioRef.current === context) { await context.close(); audioRef.current = null; setPlaying(false) }

    }, notes.length * 460 + 800))

  }



  const toggleMute = () => {

    const next = !muted

    mutedRef.current = next

    setMuted(next)

    if (next) {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      if (audioRef.current) {
        audioRef.current.close()
        audioRef.current = null
        setPlaying(false)
      }
      if (globalClickAudioRef.current) {
        globalClickAudioRef.current.pause()
        globalClickAudioRef.current.currentTime = 0
      }
      if (doorAudioRef.current) { doorAudioRef.current.pause(); doorAudioRef.current.currentTime = 0; doorAudioRef.current = null }

      if (chimeAudioRef.current) { chimeAudioRef.current.close(); chimeAudioRef.current = null }

      if (workshopSoundRef.current) { workshopSoundRef.current.close(); workshopSoundRef.current = null }

      if (portalSoundRef.current) { portalSoundRef.current.close(); portalSoundRef.current = null }

      stopVoiceAudio()

      window.speechSynthesis?.cancel()

      if (greetingAudioRef.current) {

        greetingAudioRef.current.pause()

        greetingAudioRef.current.currentTime = 0

        greetingAudioRef.current = null

      }

      if (greetingActiveRef.current) finishGreeting()
    } else if (audioRef.current?.state === 'running') {
      audioRef.current._pipMaster?.gain.setTargetAtTime(0.16, audioRef.current.currentTime, 0.03)
    }

  }



  const discoverSecret = () => {

    setSecret(true); setSparkles(true)

    const timer = setTimeout(() => setSparkles(false), 1500)

    timersRef.current.push(timer)

  }



  const finishGreeting = () => {

    if (!greetingActiveRef.current) return

    greetingActiveRef.current = false

    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current)

    greetingTimerRef.current = null

    greetingAudioRef.current = null

    voiceAudioRef.current = null

    setPipGreeting(false)

    setPipMessage('A little sleepy, a little curious, and very glad you’re here.')

  }



  const speakGreetingFallback = (greeting) => {

    if (!greetingActiveRef.current || greetingFallbackRef.current) return

    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current)

    greetingFallbackRef.current = true

    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {

      window.speechSynthesis.cancel()

      const speech = new SpeechSynthesisUtterance(greeting)

      speech.lang = 'en-US'

      speech.rate = 0.88

      speech.onend = finishGreeting

      speech.onerror = finishGreeting

      window.speechSynthesis.speak(speech)

      greetingTimerRef.current = window.setTimeout(finishGreeting, 30000)

    } else {

      greetingTimerRef.current = window.setTimeout(finishGreeting, 4500)

    }

  }



  const reactToPip = () => {

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPipReacting(true)
      if (pipReactionTimerRef.current) clearTimeout(pipReactionTimerRef.current)
      pipReactionTimerRef.current = window.setTimeout(() => {
        setPipReacting(false)
        pipReactionTimerRef.current = null
      }, 520)
    }

    if (greetingActiveRef.current && greetingAudioRef.current && !greetingAudioRef.current.paused) return

    stopVoiceAudio()

    if (audioRef.current) { audioRef.current.close(); audioRef.current = null; setPlaying(false) }

    greetingActiveRef.current = true

    greetingFallbackRef.current = false

    const greeting = 'Oh! You found me! Hi, sleepy friend! Welcome to my little corner of Dreamland.'

    setPipMessage(`${greeting} ✨`)

    setPipGreeting(true)

    if (mutedRef.current) {

      greetingTimerRef.current = window.setTimeout(finishGreeting, 4500)

      return

    }

    const audio = new Audio('/audio/pip_voice.mp3')

    greetingAudioRef.current = audio

    voiceAudioRef.current = audio

    audio.preload = 'auto'

    audio.onended = finishGreeting

    audio.onerror = () => {

      greetingAudioRef.current = null

      voiceAudioRef.current = null

      speakGreetingFallback(greeting)

    }

    audio.play().catch(() => {

      if (greetingAudioRef.current === audio) {

        greetingAudioRef.current = null

        voiceAudioRef.current = null

        speakGreetingFallback(greeting)

      }

    })

  }



  const stopVoiceAudio = () => {

    if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current)

    greetingTimerRef.current = null

    if (voiceAudioRef.current) {

      voiceAudioRef.current.pause()

      voiceAudioRef.current.currentTime = 0

      if (portalVoiceRef.current === voiceAudioRef.current) portalVoiceRef.current = null

      voiceAudioRef.current = null

    }

    greetingAudioRef.current = null

    if (greetingActiveRef.current) finishGreeting()

    window.speechSynthesis?.cancel()

  }



  const selectMood = (nextMood) => {

    setMood(nextMood)

    if (mutedRef.current) return

    stopVoiceAudio()

    if (audioRef.current) { audioRef.current.close(); audioRef.current = null; setPlaying(false) }

    const audio = new Audio(nextMood === 'Sleepy' ? '/audio/pip_sleepy_voice.mp3' : '/audio/pip_curious_voice.mp3')

    audio.preload = 'auto'

    voiceAudioRef.current = audio

    audio.onended = () => { if (voiceAudioRef.current === audio) voiceAudioRef.current = null }

    audio.onerror = () => { if (voiceAudioRef.current === audio) voiceAudioRef.current = null }

    audio.play().catch(() => { if (voiceAudioRef.current === audio) voiceAudioRef.current = null })

  }



  const playCollectedStarSound = () => {

    if (mutedRef.current) return

    const AudioContextClass = window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) return

    try {

      if (chimeAudioRef.current) chimeAudioRef.current.close()

      const context = new AudioContextClass()

      chimeAudioRef.current = context

      const oscillator = context.createOscillator()

      const envelope = context.createGain()

      oscillator.type = 'sine'

      oscillator.frequency.setValueAtTime(987.77, context.currentTime)

      oscillator.frequency.exponentialRampToValueAtTime(1318.51, context.currentTime + 0.16)

      envelope.gain.setValueAtTime(0.0001, context.currentTime)

      envelope.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.025)

      envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5)

      oscillator.connect(envelope)

      envelope.connect(context.destination)

      oscillator.onended = () => {

        context.close()

        if (chimeAudioRef.current === context) chimeAudioRef.current = null

      }

      oscillator.start()

      oscillator.stop(context.currentTime + 0.52)

    } catch {

      chimeAudioRef.current = null

    }

  }



  const collectStoryStar = (star, event) => {

    if (collectedStarsRef.current.has(star.id)) return

    collectedStarsRef.current.add(star.id)

    const starBounds = event.currentTarget.getBoundingClientRect()

    const counterBounds = starCounterRef.current?.getBoundingClientRect()

    if (counterBounds) {

      event.currentTarget.style.setProperty('--fly-x', `${counterBounds.left + counterBounds.width / 2 - (starBounds.left + starBounds.width / 2)}px`)

      event.currentTarget.style.setProperty('--fly-y', `${counterBounds.top + counterBounds.height / 2 - (starBounds.top + starBounds.height / 2)}px`)

    }

    setCollectedStars([...collectedStarsRef.current])

    setStarStoryMemory(star.memory)

    playCollectedStarSound()

  }



  const openMysteryBox = () => {

    if (mysteryBoxStartedRef.current) return

    mysteryBoxStartedRef.current = true

    setMysteryBoxOpening(true)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const timer = window.setTimeout(() => {

      setMysteryBoxOpening(false)

      setMysteryBoxOpen(true)

    }, reducedMotion ? 40 : 1020)

    portalBurstTimersRef.current.push(timer)

  }



  const launchPortalEasterEgg = (event) => {

    if (portalBurstStartedRef.current) return

    portalBurstStartedRef.current = true

    setPortalBurst(true)



    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const viewportWidth = window.innerWidth

    const viewportHeight = window.innerHeight

    const origin = event.currentTarget.getBoundingClientRect()

    const originX = origin.left + origin.width / 2

    const originY = origin.top + origin.height / 2

    setPortalBurstOrigin({ x: originX, y: originY })

    const particleAssets = [

      'magic-burst-star.svg', 'magic-burst-moon.svg', 'magic-burst-rainbow.svg',

      'magic-burst-cloud.svg', 'magic-burst-heart.svg', 'magic-burst-butterfly.svg',

      'magic-burst-wand.svg', 'magic-burst-flower.svg',

    ]

    const particleCount = reducedMotion ? 0 : Math.max(460, Math.min(780, Math.round(viewportWidth * viewportHeight / 1500)))

    const particles = Array.from({ length: particleCount }, (_, index) => {

      const size = 19 + Math.random() * 25

      const targetX = Math.random() * Math.max(1, viewportWidth - size)

      const targetY = Math.random() * Math.max(1, viewportHeight - size)

      return {

        id: index,

        src: `/images/${particleAssets[Math.floor(Math.random() * particleAssets.length)]}`,

        style: {

          '--burst-x': `${originX}px`, '--burst-y': `${originY}px`,

          '--spread-x': `${targetX - originX}px`, '--spread-y': `${targetY - originY}px`,

          '--fall-x': `${Math.random() * 180 - 90}px`, '--fall-rotate': `${Math.random() * 700 - 350}deg`,

          '--particle-size': `${size}px`, '--particle-delay': `${Math.random() * 0.12}s`,

          '--particle-duration': `${2.75 + Math.random() * 0.4}s`,

        },

      }

    })

    setPortalBurstParticles(particles)



    if (!mutedRef.current) {

      stopVoiceAudio()

      if (chimeAudioRef.current) { chimeAudioRef.current.close(); chimeAudioRef.current = null }

      if (audioRef.current) { audioRef.current.close(); audioRef.current = null; setPlaying(false) }

      if (portalSoundRef.current) { portalSoundRef.current.close(); portalSoundRef.current = null }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext

      if (AudioContextClass) {

        try {

          const context = new AudioContextClass()

          portalSoundRef.current = context

          context.resume().then(() => {

            if (context.state === 'closed' || mutedRef.current) return

            const now = context.currentTime

            const crackBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.2), context.sampleRate)

            const crackData = crackBuffer.getChannelData(0)

            for (let i = 0; i < crackData.length; i += 1) crackData[i] = (Math.random() * 2 - 1) * (1 - i / crackData.length)

            const crack = context.createBufferSource()

            const crackFilter = context.createBiquadFilter()

            const crackGain = context.createGain()

            crack.buffer = crackBuffer

            crackFilter.type = 'highpass'

            crackFilter.frequency.value = 850

            crackGain.gain.setValueAtTime(0.38, now)

            crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)

            crack.connect(crackFilter); crackFilter.connect(crackGain); crackGain.connect(context.destination)

            crack.start(now); crack.stop(now + 0.24)

            ;[0, 0.055, 0.12].forEach((offset, index) => {

              const snap = context.createOscillator()

              const snapGain = context.createGain()

              const at = now + offset

              snap.type = index === 1 ? 'square' : 'triangle'

              snap.frequency.setValueAtTime(index === 1 ? 720 : 980, at)

              snap.frequency.exponentialRampToValueAtTime(180, at + 0.075)

              snapGain.gain.setValueAtTime(0.11, at)

              snapGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.085)

              snap.connect(snapGain); snapGain.connect(context.destination)

              snap.start(at); snap.stop(at + 0.09)

            })

            const thump = context.createOscillator()

            const thumpGain = context.createGain()

            thump.type = 'triangle'

            thump.frequency.setValueAtTime(155, now)

            thump.frequency.exponentialRampToValueAtTime(48, now + 0.22)

            thumpGain.gain.setValueAtTime(0.16, now)

            thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

            thump.connect(thumpGain); thumpGain.connect(context.destination)

            thump.start(now); thump.stop(now + 0.26)



            const sparkleAt = now + (reducedMotion ? 0.24 : 1.18)

            ;[1046.5, 1318.5, 1568].forEach((frequency, index) => {

              const oscillator = context.createOscillator()

              const gain = context.createGain()

              const at = sparkleAt + index * 0.09

              oscillator.type = 'sine'

              oscillator.frequency.value = frequency

              gain.gain.setValueAtTime(0.0001, at)

              gain.gain.exponentialRampToValueAtTime(0.055, at + 0.02)

              gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.32)

              oscillator.connect(gain); gain.connect(context.destination)

              oscillator.start(at); oscillator.stop(at + 0.34)

            })



            if (!reducedMotion) {

              const rainBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 1.5), context.sampleRate)

              const rainData = rainBuffer.getChannelData(0)

              for (let i = 0; i < rainData.length; i += 1) rainData[i] = (Math.random() * 2 - 1) * 0.45

              const rain = context.createBufferSource()

              const rainFilter = context.createBiquadFilter()

              const rainGain = context.createGain()

              rain.buffer = rainBuffer

              rainFilter.type = 'lowpass'

              rainFilter.frequency.value = 1500

              rainGain.gain.setValueAtTime(0.0001, now + 1.35)

              rainGain.gain.linearRampToValueAtTime(0.025, now + 1.65)

              rainGain.gain.linearRampToValueAtTime(0.0001, now + 2.75)

              rain.connect(rainFilter); rainFilter.connect(rainGain); rainGain.connect(context.destination)

              rain.start(now + 1.35); rain.stop(now + 2.8)

            }

          }).catch(() => {})

        } catch { portalSoundRef.current = null }

      }

      portalBurstTimersRef.current.push(window.setTimeout(() => {

        if (mutedRef.current) return

        stopVoiceAudio()

        const voice = new Audio('/audio/found_voice.mp3')

        voice.preload = 'auto'

        portalVoiceRef.current = voice

        voiceAudioRef.current = voice

        voice.onended = () => {

          if (portalVoiceRef.current === voice) portalVoiceRef.current = null

          if (voiceAudioRef.current === voice) voiceAudioRef.current = null

        }

        voice.onerror = voice.onended

        voice.play().catch(voice.onended)

      }, reducedMotion ? 100 : 280))

    }



    const burstDuration = reducedMotion ? 420 : 3200

    portalBurstTimersRef.current.push(window.setTimeout(() => {

      setPortalBurst(false)

      setPortalBurstParticles([])

    }, burstDuration))

    portalBurstTimersRef.current.push(window.setTimeout(() => {

      if (portalSoundRef.current) { portalSoundRef.current.close(); portalSoundRef.current = null }

    }, reducedMotion ? 850 : 3100))

  }



  const openStoryPortal = (event) => {

    if (!mysteryBoxOpen || collectedStars.length < hiddenStoryStars.length) {

      const remaining = hiddenStoryStars.length - collectedStars.length

      setPortalHint(`${mysteryBoxOpen ? `Find ${remaining} more ${remaining === 1 ? 'star' : 'stars'}` : 'Open Pip’s mystery box'} to wake the portal.`)

      return

    }

    setPortalHint('')

    launchPortalEasterEgg(event)

    setPortalOpen(true)

  }



  const movePip = (event) => {

    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const bounds = event.currentTarget.getBoundingClientRect()

    const x = (event.clientX - bounds.left) / bounds.width - 0.5

    const y = (event.clientY - bounds.top) / bounds.height - 0.5

    if (!heroRef.current) return
    heroRef.current.style.setProperty('--pointer-x', `${x * 12}px`)
    heroRef.current.style.setProperty('--pointer-y', `${y * 9}px`)
    pipPointerPositionRef.current = { x: event.clientX, y: event.clientY }
    if (pipPointerFrameRef.current !== null) return
    pipPointerFrameRef.current = window.requestAnimationFrame(() => {
      pipPointerFrameRef.current = null
      const pip = heroRef.current?.querySelector('.hero-pip-reaction')
      if (!pip) return
      const face = pip.getBoundingClientRect()
      const dx = Math.max(-1, Math.min(1, (pipPointerPositionRef.current.x - (face.left + face.width * 0.5)) / (face.width * 0.5)))
      const dy = Math.max(-1, Math.min(1, (pipPointerPositionRef.current.y - (face.top + face.height * 0.38)) / (face.height * 0.42)))
      pip.style.setProperty('--pip-tilt', `${(dx * 2.2).toFixed(2)}deg`)
      pip.style.setProperty('--pip-nod', `${(dy * 1.4).toFixed(2)}px`)
    })

  }



  const resetPip = () => {

    if (pipPointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pipPointerFrameRef.current)
      pipPointerFrameRef.current = null
    }

    heroRef.current?.style.removeProperty('--pointer-x')

    heroRef.current?.style.removeProperty('--pointer-y')

    const pip = heroRef.current?.querySelector('.hero-pip-reaction')
    pip?.style.removeProperty('--pip-tilt')
    pip?.style.removeProperty('--pip-nod')

  }



  const renderPipStoryScene = (scene, index) => {

    const collectible = hiddenStoryStars.find((star) => star.scene === index)

    return <article className={`pip-story-scene scene-${scene.className}`} data-story-scene={index} key={scene.className}>

      <div className="pip-story-frame">

        <div className="pip-story-art">

          <div className="story-art-cloud cloud-low" aria-hidden="true" />

          <div className="story-art-cloud cloud-high" aria-hidden="true" />

          <span className="story-scene-star" aria-hidden="true">✦</span>

          {scene.className === 'observatory' && <svg className="story-observatory-art" viewBox="0 0 440 300" aria-hidden="true"><path d="M75 225h290M110 225V147h220v78M132 147q88-133 176 0M190 225v-72q30-52 60 0v72M90 147h260M220 14v20M95 55l18 18M345 55l-18 18"/><path d="M102 147h236l-20-22H122zM150 225v-39h38v39M252 225v-39h38v39"/><circle cx="220" cy="92" r="10"/><path className="lantern-glow" d="M80 112h23l-3 32H83zM337 104h24l-4 35h-16z"/></svg>}

          {collectible && <button data-silent-click className={`story-collectible ${collectedStars.includes(collectible.id) ? 'collected' : ''}`} style={{ '--star-left': collectible.left, '--star-top': collectible.top }} onClick={(event) => collectStoryStar(collectible, event)} aria-label={`Collect Pip’s hidden star: ${collectible.label}`} aria-pressed={collectedStars.includes(collectible.id)} title="A hidden story star"><span aria-hidden="true">✦</span></button>}

          <img className="pip-story-character" src={scene.image} alt={scene.alt} loading="lazy" />

        </div>

        <div className="pip-story-copy"><span className="story-scene-number">0{index + 1} <i> / 06</i></span><h3>{scene.title}</h3><p className="pip-story-bubble">“{scene.text}”</p></div>

      </div>

    </article>

  }



  const playWorkshopDoorSound = async () => {
    if (mutedRef.current) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    try {
      if (workshopSoundRef.current) await workshopSoundRef.current.close()
      const context = new AudioContextClass()
      workshopSoundRef.current = context
      await context.resume()
      const master = context.createGain()
      master.gain.value = 0.12
      master.connect(context.destination)
      const notes = [
        { frequency: 190, end: 72, at: 0, duration: 0.13, type: 'square', volume: 0.18 },
        { frequency: 480, end: 170, at: 0.12, duration: 0.2, type: 'triangle', volume: 0.16 },
        { frequency: 920, end: 680, at: 0.28, duration: 0.34, type: 'sine', volume: 0.2 },
      ]
      notes.forEach(({ frequency, end, at, duration, type, volume }) => {
        const oscillator = context.createOscillator()
        const envelope = context.createGain()
        const begins = context.currentTime + at
        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, begins)
        oscillator.frequency.exponentialRampToValueAtTime(end, begins + duration)
        envelope.gain.setValueAtTime(0.0001, begins)
        envelope.gain.exponentialRampToValueAtTime(volume, begins + 0.015)
        envelope.gain.exponentialRampToValueAtTime(0.0001, begins + duration)
        oscillator.connect(envelope)
        envelope.connect(master)
        oscillator.start(begins)
        oscillator.stop(begins + duration + 0.02)
      })
      window.setTimeout(() => {
        if (workshopSoundRef.current === context) {
          context.close()
          workshopSoundRef.current = null
        }
      }, 780)
    } catch {
      workshopSoundRef.current = null
    }
  }

  const playLullabyCrack = (onComplete) => {
    if (mutedRef.current) return null
    const audio = new Audio('/audio/bulb_crack.mp3')
    audio.preload = 'auto'
    audio.volume = 0.64
    doorAudioRef.current = audio
    let completed = false
    const finish = () => {
      if (completed) return
      completed = true
      if (doorAudioRef.current === audio) doorAudioRef.current = null
      onComplete?.()
    }
    audio.onended = finish
    audio.onerror = finish
    audio.play().catch(finish)
    return audio
  }

  const returnToWorkshop = () => {
    if (doorAudioRef.current) { doorAudioRef.current.pause(); doorAudioRef.current.currentTime = 0; doorAudioRef.current = null }
    if (workshopSoundRef.current) { workshopSoundRef.current.close(); workshopSoundRef.current = null }
    workshopTransitionTimersRef.current.forEach(clearTimeout)
    workshopTransitionTimersRef.current = []
    workshopOpeningRef.current = false
    setWorkshopView('workshop'); setBulbBurst(false); setActiveProject(null)
    window.setTimeout(() => document.getElementById('workshop')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), 40)
  }

  const openWorkshopProject = (project) => {
    if (workshopView !== 'workshop' || workshopOpeningRef.current) return
    workshopOpeningRef.current = true
    stopVoiceAudio()
    if (audioRef.current) { audioRef.current.close(); audioRef.current = null; setPlaying(false) }
    if (chimeAudioRef.current) { chimeAudioRef.current.close(); chimeAudioRef.current = null }
    setActiveProject(project)
    if (project === 'nightlight') setGlow(false)
    setWorkshopView('opening')
    setBulbBurst(false)
    if (project === 'routes') playLullabyCrack()
    else if (project === 'lullaby' || project === 'nightlight') playLullabyCrack()
    else playWorkshopDoorSound()
    const burstTimer = window.setTimeout(() => setBulbBurst(true), reducedMotion ? 0 : 125)
    workshopTransitionTimersRef.current.push(burstTimer)
    const reveal = () => {
      setBulbBurst(false)
      workshopOpeningRef.current = false
      setWorkshopView('projects')
      const scrollTarget = project === 'routes' ? 'workshop' : 'workshop-showcase'
      const scrollTimer = window.setTimeout(() => document.getElementById(scrollTarget)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), 40)
      workshopTransitionTimersRef.current.push(scrollTimer)
    }
    workshopTransitionTimersRef.current.push(window.setTimeout(reveal, reducedMotion ? 150 : 820))
  }

  return (

    <main className={`observatory ${nightMode ? 'night' : 'day'} ${mood.toLowerCase()} ${chaos ? 'chaos' : ''}`}>
      <StardustCursor reducedMotion={reducedMotion} />
      {chaos && <div className="chaos-decorations" aria-hidden="true"><span className="chaos-sticker sticker-one">✦</span><span className="chaos-sticker sticker-two">✧</span><span className="chaos-sticker sticker-three">★</span><span className="chaos-sticker sticker-four">WOW!</span></div>}

      <header className="navbar">

        <a className="brand" href="#home" aria-label="Pip's Observatory home"><img src="/images/pip_avatar_cloud.png" alt="" /> <span>Pip's <i>Midnight Observatory</i></span></a>

        <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">☰</span></button>

        <nav id="primary-navigation" className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">

          <a onClick={() => { setMenuOpen(false); beginCurtainEntrance() }} href="#about">About Pip</a><a onClick={() => setMenuOpen(false)} href="#workshop">Dream Workshop</a><a className="pip-story-nav" onClick={() => setMenuOpen(false)} href="#how-pip-found-the-stars">Pip’s Story</a><a onClick={() => setMenuOpen(false)} href="#midnight-storybook">Storybook</a>

        </nav>

        <div className="nav-controls">

          <button className="chaos-toggle" onClick={() => setChaos(!chaos)} aria-pressed={chaos} aria-label={`Chaos Mode ${chaos ? 'on' : 'off'}`}>{chaos ? 'Chaos: On' : 'Chaos: Off'}</button>

          <button className="sound-toggle" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'Sound off' : 'Sound on'} <span aria-hidden="true">{muted ? '◌' : '♫'}</span></button>

          <button className="theme-toggle" onClick={() => setNightMode(!nightMode)} aria-label={`Switch to ${nightMode ? 'day' : 'night'} mode`} aria-pressed={!nightMode}>{nightMode ? '☼ Day' : '☾ Night'}</button>

        </div>

      </header>



      <div className="opening-scene">

      <div className="opening-sky" aria-hidden="true"><img className="opening-sky-fill" src="/images/midnight-sky.png" alt="" /><img className="opening-sky-art" src="/images/midnight-sky.png" alt="" /></div>

      <section className="hero" id="home" ref={heroRef} onPointerMove={movePip} onPointerLeave={resetPip}>

        <div className="sky-stars" aria-hidden="true" />

        <div className="particles particles-back" aria-hidden="true" />

        <span className="hero-moon" aria-hidden="true" />

        <span className="lantern-orbit" aria-hidden="true">✧</span>

        <div className="hero-copy">

          <p className="eyebrow">Junior Dream Engineer <b>·</b> Midnight Nursery</p>

          <h1>I build the dreams<br />you fall asleep <em>inside.</em></h1>

          <p className="hero-description">Hello, night visitor. I’m Pip — a little sleepy, a little curious, and very glad you’re here. Come see where the dreams are made.</p>

          <div className="hero-actions"><a className="primary-button" href="#workshop">Explore the dream workshop <span>→</span></a><a className="text-link" href="#about" onClick={beginCurtainEntrance}>Meet Pip <span>↗</span></a></div>

          <p className="hero-note"><span className="live-dot" /> {statusMessage} <span className="status-star" aria-hidden="true"></span></p>

        </div>

        <div className="hero-art"><div className="art-halo" /><span className={`hero-pip-reaction${pipReacting ? ' is-nodding' : ''}`}><img data-silent-click onClick={reactToPip} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reactToPip() } }} role="button" tabIndex={0} aria-label="Say hello to Pip" src="/images/pip_avatar_cloud.png" alt="Pip nestled in a little cloud, wearing a starry nightcap" /></span><span className="art-caption">little keeper of the in-between</span><span className="annotation annotation-log">DREAM LOG · 001</span><span className="annotation annotation-sleep">SLEEP LEVEL · 2%</span></div>

        <div className="cloud cloud-distant" aria-hidden="true" />

        <div className="cloud cloud-middle" aria-hidden="true" />

        <div className="cloud cloud-left" aria-hidden="true" /><div className="cloud cloud-right" aria-hidden="true" />

        <div className="cloud cloud-front-two" aria-hidden="true" />

        <div className="cloud cloud-foreground" aria-hidden="true" />

        <div className="walking-pip" aria-hidden="true"><img className="walking-sprite" src="/images/pip_moving.png" alt="" /></div>

        <div className="particles particles-front" aria-hidden="true" />

        <a className="hidden-star" href="#secret-note" aria-label="A tiny hidden star — discover Pip's secret note" onClick={(event) => { event.preventDefault(); discoverSecret() }}>✦</a>

      </section>



      <section className="about section" id="about">

        <div className="about-atmosphere" aria-hidden="true"><span className="about-cloud about-cloud-far" /><span className="about-cloud about-cloud-near" /><span className="about-cloud about-cloud-low" /><span className="about-stars" /></div>

        <div className="about-cloud-wipe" aria-hidden="true">

          <svg className="wipe-cloud wipe-cloud-one" viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M0 150c44-6 55-46 106-43 0-53 76-77 111-36 35-66 122-63 151-2 39-40 101-28 118 15 53-34 112-2 111 40 46-27 95-7 102 25 61-38 126-14 136 24 55-30 112-14 121 17 55-9 99 13 116 37 39-1 70 6 88 21-37 26-84 29-122 10-44 28-96 26-137 4-57 30-120 27-168 0-53 30-116 27-162-2-51 29-114 25-160-6-47 26-102 20-139-7-48 20-95 12-130-9-46 9-82 3-106-12z" /></svg>

          <svg className="wipe-cloud wipe-cloud-two" viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M0 145c55-1 63-39 104-36 14-51 76-62 112-25 35-59 115-60 146-7 46-43 108-26 123 18 48-32 103-1 105 35 52-28 103-8 113 27 52-23 100-3 109 26 59-28 122-8 134 27 46-13 95 7 119 32-39 24-83 24-119 8-47 24-99 19-138-3-49 29-110 24-151-3-52 28-113 20-154-10-51 27-107 19-146-11-44 23-94 13-126-12-43 12-84 7-111-9-44 7-78-1-100-17z" /></svg>

          <svg className="wipe-cloud wipe-cloud-three" viewBox="0 0 1200 220" preserveAspectRatio="none"><path d="M0 154c41-8 54-39 94-38 6-40 54-61 89-33 29-58 103-62 136-13 37-31 87-21 105 14 40-25 90-4 93 31 46-23 91-2 99 29 49-25 104-4 113 27 48-23 103-7 120 22 43-12 82 4 103 25-36 22-76 20-108 4-42 22-87 18-123-2-45 27-96 22-133-2-47 26-98 19-135-8-44 25-95 19-130-8-38 20-83 12-110-10-39 11-72 5-94-10-37 7-70 0-89-16z" /></svg>

        </div>

        <div className="section-kicker">THE NURSERY NOTEBOOK <span>NO. 001</span></div>

        <div className="profile-layout">

          <button data-silent-click className={`profile-image mood-${mood.toLowerCase()} ${pipGreeting ? 'greeting' : ''}`} onClick={reactToPip} aria-label="Say hello to Pip" aria-describedby="pip-greeting"><span className="portrait-art"><img key={mood} src={mood === 'Sleepy' ? '/images/Sleepy_pip.png' : '/images/Curious_pip.png'} alt={mood === 'Sleepy' ? 'Sleepy Pip with closed eyes, resting on a cloud' : 'Curious Pip with bright open eyes, sitting on a cloud'} /><span className="pip-sparkle-trail" /></span></button>

        <div className="profile-copy"><p className="eyebrow">A LITTLE INTRODUCTION</p><h2>Meet our <em>dreamer.</em></h2><p className="profile-lead">Pip is a Junior Dream Engineer at the Midnight Nursery: curious, cozy, and just a bit clumsy.</p><p>A smooth round skull, two tiny lights for eyes, a crooked smile, and a nightcap with a pink bow. Pip’s favorite thing is making dreams for little creatures — usually while giggling at absolutely nothing.</p><p className={`pip-message ${pipGreeting ? 'greeting-message' : ''}`} id="pip-greeting" role="status" aria-live="polite">{pipMessage}</p><div className="profile-tags"><span>✦ Sleepy, but inventing</span><span>♡ Hates silence</span><span>☾ On night shift</span></div><div className="mood-switch" role="group" aria-label="Pip's mood"><span>PIP'S MOOD</span><button data-silent-click aria-pressed={mood === 'Sleepy'} onClick={() => selectMood('Sleepy')}>Sleepy</button><button data-silent-click aria-pressed={mood === 'Curious'} onClick={() => selectMood('Curious')}>Curious</button></div></div>

        </div>

      </section>

      </div>



      <section className={'pip-story' + (portalOpen ? ' portal-has-opened' : '')} id="how-pip-found-the-stars" aria-labelledby="pip-story-title" style={{ '--story-line-offset': 1 - storyProgress }}>

        <div className="pip-story-cloud-bank cloud-bank-one" aria-hidden="true" />

        <div className="pip-story-cloud-bank cloud-bank-two" aria-hidden="true" />

        <span className="pip-story-dust dust-one" aria-hidden="true" /><span className="pip-story-dust dust-two" aria-hidden="true" /><span className="pip-story-dust dust-three" aria-hidden="true" /><span className="pip-story-dust dust-four" aria-hidden="true" /><span className="pip-story-dust dust-five" aria-hidden="true" /><span className="pip-story-dust dust-six" aria-hidden="true" />

        <svg className="pip-story-constellation" viewBox="0 0 1000 6000" preserveAspectRatio="none" aria-hidden="true">

          <path pathLength="1" d="M240 430 C360 720 730 690 680 1120 S320 1600 340 2140 S760 2680 700 3150 S320 3640 360 4160 S710 4700 680 5150 S410 5560 500 5850" />

          <g className="story-trail-stars"><circle cx="240" cy="430" r="15"/><circle cx="680" cy="1120" r="13"/><circle cx="340" cy="2140" r="16"/><circle cx="700" cy="3150" r="13"/><circle cx="360" cy="4160" r="16"/><circle cx="680" cy="5150" r="15"/><circle cx="500" cy="5850" r="19"/></g>

        </svg>

        <header className="pip-story-heading"><p className="eyebrow">A LITTLE JOURNEY THROUGH THE NIGHT</p><h2 id="pip-story-title">How Pip Found <em>the Stars</em></h2><p>Six small moments that lit up a very big sky.</p>

          <div className="story-mission" aria-labelledby="story-mission-title"><img src="/images/Curious_pip.png" alt="Pip pointing toward the story" loading="lazy" /><div className="story-mission-copy"><h3 id="story-mission-title">✨ A Little Mission for You! ✨</h3><p>Three tiny stars are hiding in Pip’s dreamland. Find them all, discover the secret box, and unlock something magical!</p><div className="mission-stars" aria-label={`${collectedStars.length} of 3 stars found`}>{hiddenStoryStars.map((star) => <span key={star.id} className={collectedStars.includes(star.id) ? 'found' : ''} aria-hidden="true">✦</span>)}</div><div className="story-star-counter" ref={starCounterRef} aria-live="polite"><span aria-hidden="true">&#x2726;</span> {collectedStars.length}/3 <small>STARS FOUND</small></div><p className="mission-instructions">Scroll to explore, then tap or click the glowing stars and the mystery box. Keep your eyes open… Pip has a secret! 👀</p></div></div>

          <p className="story-star-memory" role="status" aria-live="polite">{collectedStars.length === 3 ? 'All three stars found! The secret portal is ready!' : mysteryBoxOpen ? 'Your next little adventure is still waiting…' : starStoryMemory || "Three little stars are tucked into Pip's journey."}</p>

        </header>

        {pipStoryScenes.slice(0, 3).map(renderPipStoryScene)}

        <aside className={`pip-mystery-wrap ${mysteryBoxOpen ? 'box-open' : ''} ${mysteryBoxOpening ? 'box-opening' : ''}`}>

          <p className="mystery-invite">Psst… Pip has been hiding a little secret. Dare to open it?</p><p className="mystery-hint">Tap the box to discover what’s inside!</p>

          <button className="pip-mystery-box" onClick={openMysteryBox} disabled={mysteryBoxOpening || mysteryBoxOpen} aria-expanded={mysteryBoxOpen} aria-label={mysteryBoxOpen ? 'The mystery box is open' : mysteryBoxOpening ? 'Pip’s mystery box is opening' : "Open Pip's mystery box"}>

            <span className="mystery-ribbon" aria-hidden="true" /><span className="mystery-box-lid" aria-hidden="true" /><span className="mystery-box-runes" aria-hidden="true">&#x2727; · &#x2726; · &#x2727; · &#x2726; · &#x2727;</span><span className="mystery-box-lock" aria-hidden="true">?</span><span className="mystery-box-base" aria-hidden="true" /><img className="mystery-box-treasure" src="/images/magic-burst-star.svg" alt="" aria-hidden="true" />

          </button>

          <p className="mystery-tap-hint" role="status" aria-live="polite">{mysteryBoxOpen ? "Psst... you found something Pip was keeping secret!" : "A tiny bit of magic is tucked inside."}</p>



        </aside>

        {pipStoryScenes.slice(3).map((scene, index) => renderPipStoryScene(scene, index + 3))}

        <div className={'pip-story-portal ' + (mysteryBoxOpen && collectedStars.length === 3 ? 'portal-unlocked' : 'portal-locked') + (portalOpen ? ' portal-opened' : '') + (portalBurst ? ' portal-bursting' : '')}>

          <button data-silent-click className="portal-gate" onClick={openStoryPortal} aria-expanded={portalOpen} aria-label={portalOpen ? 'The midnight observatory portal is open' : 'Open the midnight observatory portal'}>

            <span className="portal-ring" aria-hidden="true" /><span className="portal-center" aria-hidden="true">&#x2726;</span><span className="portal-cracks" aria-hidden="true"><svg viewBox="0 0 120 150"><path d="M61 9 48 34l16 11-24 20 18 12-12 32m13-66 22 13-16 18 22 15-12 28M43 52 23 44m53 28 21-13" /></svg></span><span className="portal-label">{mysteryBoxOpen && collectedStars.length === 3 ? 'STEP THROUGH' : 'A QUIET DOOR'}</span>

          </button>

          <p className="portal-hint" role="status" aria-live="polite">{portalHint || (mysteryBoxOpen && collectedStars.length === 3 ? 'Something is waiting beyond the stars…' : "Find Pip's secret and all three stars to wake this little door.")}</p>

          <p className={`portal-found-label ${portalOpen && !portalBurst ? 'is-visible' : ''}`} aria-live="polite" aria-hidden={!portalOpen || portalBurst}>&#x2728; You found it! &#x2728;</p>

          {portalOpen && <div className="portal-reveal" aria-live="polite"><div className="portal-night-sky" aria-hidden="true"><span>&#x2726;</span><span>&#x2727;</span><span>&#x2726;</span><i /></div><div className="portal-observatory" aria-hidden="true"><span className="portal-dome" /><span className="portal-tower" /><span className="portal-clouds" /></div><img src="/images/pip_avatar_cloud.png" alt="Pip welcoming you to the midnight observatory" loading="lazy" /><div className="portal-final-message"><span>THE MIDNIGHT OBSERVATORY</span><p>Every little dream needs someone to believe in it. Tonight, that someone was you.</p></div></div>}

        </div>

        <p className="pip-story-endnote">And the stars kept shining, one dream at a time. <span aria-hidden="true">✦</span></p>

      </section>



      {portalBurst && <div className="magical-explosion-overlay" aria-hidden="true" style={{ '--explosion-x': `${portalBurstOrigin.x}px`, '--explosion-y': `${portalBurstOrigin.y}px` }}>

        <div className="explosion-rainbow-flash" />

        {portalBurstParticles.map((particle) => <img key={particle.id} className="explosion-particle" src={particle.src} style={particle.style} alt="" draggable="false" />)}

      </div>}



      <section className={`workshop section ${workshopView === 'projects' ? 'workshop-projects-open' : ''}`} id="workshop" aria-labelledby="workshop-title">
        {workshopView !== 'projects' ? <div className={`workshop-room ${workshopView === 'opening' ? 'is-opening' : ''}`}>
          <div className="workshop-room-shade" aria-hidden="true" />
          <header className="workshop-heading"><p className="eyebrow">MADE AFTER MOONRISE</p><h2 id="workshop-title">Little dreams. <em>Big magic.</em></h2><p>Tap a glowing bulb to explore a project.</p></header>
          <div className="hanging-bulbs" aria-label="Choose a Dream Workshop project">
            <button data-silent-click className={`hanging-bulb bulb-lullaby ${bulbBurst && activeProject === 'lullaby' ? 'bursting' : ''}`} onClick={() => openWorkshopProject('lullaby')} disabled={workshopView !== 'workshop'} aria-label="Explore Lullaby Lab">
              <span className="bulb-cord"/><span className="bulb-swing"><span className="bulb-glass"><span className="bulb-decoration notes">&#x266A; &#x266B;</span><span className="bulb-filament"/></span><span className="bulb-sparkles" aria-hidden="true">&#x2727; &#x2726; &#x2727;</span></span><span className="bulb-caption">Lullaby Lab</span>
            </button>
            <button data-silent-click className={`hanging-bulb bulb-nightlight ${bulbBurst && activeProject === 'nightlight' ? 'bursting' : ''}`} onClick={() => openWorkshopProject('nightlight')} disabled={workshopView !== 'workshop'} aria-label="Explore Nightlight Collection">
              <span className="bulb-cord"/><span className="bulb-swing"><span className="bulb-glass"><span className="bulb-decoration star-mark">&#x2726;</span><span className="bulb-filament"/></span><span className="bulb-sparkles" aria-hidden="true">&#x2726; &#x2727; &#x2726;</span></span><span className="bulb-caption">Nightlight Collection</span>
            </button>
            <button type="button" data-silent-click className={`hanging-bulb bulb-routes ${bulbBurst && activeProject === 'routes' ? 'bursting' : ''}`} onClick={() => openWorkshopProject('routes')} disabled={workshopView !== 'workshop'} aria-label="Explore Dream Delivery Routes">
              <span className="bulb-cord"/><span className="bulb-swing"><span className="bulb-glass"><span className="bulb-decoration constellation-dots"><i/><i/><i/><i/></span><span className="bulb-filament"/></span><span className="bulb-sparkles" aria-hidden="true">&#x2727; &#x2726; &#x2727;</span></span><span className="bulb-caption">Dream Delivery Routes</span>
            </button>
            <button data-silent-click className={`hanging-bulb bulb-cabinet ${bulbBurst && activeProject === 'cabinet' ? 'bursting' : ''}`} onClick={() => openWorkshopProject('cabinet')} disabled={workshopView !== 'workshop'} aria-label="Explore The Magic Cabinet">
              <span className="bulb-cord"/><span className="bulb-swing"><span className="bulb-glass"><span className="bulb-decoration">&#x2726;</span><span className="bulb-filament"/></span><span className="bulb-sparkles" aria-hidden="true">&#x2727; &#x2726; &#x2727;</span></span><span className="bulb-caption">The Magic Cabinet</span>
            </button>
          </div>
        </div> : <div className="workshop-showcase" id="workshop-showcase">
          {activeProject !== 'lullaby' && activeProject !== 'nightlight' && activeProject !== 'routes' && activeProject !== 'cabinet' && <div className="showcase-topline"><div><p className="eyebrow">THE DREAM WORKSHOP</p><h2>Three little <em>marvels.</em></h2></div><button className="back-workshop" onClick={returnToWorkshop}>&#x2190; Back to Workshop</button></div>}
          {activeProject === 'routes' ? <div className="showcase-projects"><article className="showcase-project showcase-routes is-active">
            <p className="eyebrow">03 / DREAM DELIVERY ROUTES</p><h3>Every dream finds its <em>way home.</em></h3><p className="showcase-description">Choose a destination. Pip will carry a dream across the night.</p>
            <DreamDeliveryRoutes muted={muted} onBack={returnToWorkshop} reducedMotion={reducedMotion} playChime={playCollectedStarSound}/>
          </article></div> : activeProject === 'cabinet' ? <MagicCabinet muted={muted} onBack={returnToWorkshop}/> : activeProject === 'lullaby' ? <LullabyFairytale muted={muted} onBack={returnToWorkshop}/> : activeProject === 'nightlight' ? <NightlightGarden muted={muted} onBack={returnToWorkshop} reducedMotion={reducedMotion}/> : <div className="showcase-projects">
            <article className={`showcase-project showcase-lullaby ${activeProject === 'lullaby' ? 'is-active' : ''}`}>
              <p className="eyebrow">01 / THE LULLABY LAB</p><h3>A softer sort of <em>night song.</em></h3><p className="showcase-description">Wind the little key. Watch the melody turn into starlight.</p>
              <div className={`showcase-music ${playing ? 'playing' : ''}`}><span className="showcase-note note-a">&#x266A;</span><span className="showcase-note note-b">&#x266B;</span><button data-silent-click className="showcase-music-button" onClick={() => { playLullaby() }} aria-pressed={playing} aria-label={playing ? 'Stop the lullaby music box' : 'Wind and play the lullaby music box'}><img src="/images/pip_lullaby_box.png" alt="The original haX.baby Pip lullaby music box"/><span className="music-key" aria-hidden="true">&#x21BB;</span></button></div>
              <button data-silent-click className="project-button" onClick={() => { playLullaby() }} aria-pressed={playing}>{playing ? 'Stop the lullaby' : 'Wind the music box'} <span aria-hidden="true">&#x266B;</span></button>
            </article>
            <article className={`showcase-project showcase-nightlight ${activeProject === 'nightlight' ? 'is-active' : ''} ${glow ? 'glowing' : ''}`}>
              <p className="eyebrow">02 / THE NIGHTLIGHT COLLECTION</p><h3>One small light changes <em>everything.</em></h3><p className="showcase-description">Tap Pip's lantern to bring a little golden courage to the corners.</p>
              <div className="showcase-lantern-scene" style={{'--flash-x':`${lanternPoint.x}%`,'--flash-y':`${lanternPoint.y}%`}} onPointerMove={e=>{const b=e.currentTarget.getBoundingClientRect();setLanternPoint({x:(e.clientX-b.left)/b.width*100,y:(e.clientY-b.top)/b.height*100})}} onPointerLeave={()=>setLanternPoint({x:50,y:50})} onTouchMove={e=>{const b=e.currentTarget.getBoundingClientRect(),t=e.touches[0];setLanternPoint({x:(t.clientX-b.left)/b.width*100,y:(t.clientY-b.top)/b.height*100})}}>
                <span className="showcase-flashlight" aria-hidden="true"/><span className="lantern-hidden-star hidden-star-a" aria-hidden="true">&#x2726;</span><span className="lantern-hidden-star hidden-star-b" aria-hidden="true">&#x2727;</span><span className="lantern-hidden-star hidden-star-c" aria-hidden="true">&#x2726;</span>
                <button data-silent-click className="showcase-lantern-button" onClick={()=>{setGlow(v=>!v);playCollectedStarSound()}} aria-label={glow?'Turn the dream lantern off':'Turn the dream lantern on'} aria-pressed={glow}><span className="showcase-lantern-glow"/><img src="/images/pip_dream_lantern.png" alt="Pip's original haX.baby dream lantern"/>{glow&&<span className="showcase-lantern-sparkles" aria-hidden="true">&#x2726; &#x2727; &#x2726;</span>}</button>
              </div><button data-silent-click className="project-button" onClick={()=>{setGlow(v=>!v);playCollectedStarSound()}} aria-pressed={glow}>{glow?'Dim the lantern':'Light the lantern'} <span aria-hidden="true">&#x2727;</span></button>
            </article>
          </div>}
        </div>}
      </section>





      <MidnightStorybook reducedMotion={reducedMotion} muted={muted} playClickSound={playGlobalClick} />

      {activeProject === 'cabinet' && <button className="cabinet-global-sound" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'Sound off' : 'Sound on'} <span aria-hidden="true">{muted ? '◌' : '♫'}</span></button>}



      <DreamlandGate muted={muted} reducedMotion={reducedMotion} delivered={delivered} onDreamSent={recordDreamDelivery} />



      {curtainState !== 'idle' && curtainState !== 'done' && <div className={`curtain-overlay ${curtainState}`} aria-label="Curtain entrance" aria-modal="true" role="dialog">

        <div className="curtain-panel curtain-left" aria-hidden="true"><img src="/images/Velvet_Curtains.png" alt="" /></div>

        <div className="curtain-panel curtain-right" aria-hidden="true"><img src="/images/Velvet_Curtains.png" alt="" /></div>

        {curtainState === 'closed' && <button className="curtain-open" autoFocus onClick={openCurtains}>Open the curtains</button>}

      </div>}

      {secret && <div className="secret-note" id="secret-note" role="status"><button aria-label="Close secret note" onClick={() => setSecret(false)}>×</button><span>✧ A NOTE FROM PIP ✧</span><p>May your dreams be soft, and may one little star keep you company. Goodnight!</p>{sparkles && <div className="secret-sparkles" aria-hidden="true">✦ · ✧ · ✦</div>}</div>}

    </main>

  )

}



export default App
