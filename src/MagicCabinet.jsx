import { useCallback, useEffect, useRef, useState } from 'react'
import './MagicCabinet.css'

const wishes = [
  'Tonight, may the moon save you a little seat among the stars.',
  'May your dreams be softer than clouds and brighter than fireflies.',
  'Somewhere in your sleep, a tiny adventure is waiting just for you.',
  'May tomorrow greet you with a warm sun and a pocketful of wonder.',
  'The stars are keeping your happiest thought safe until morning.',
  'May a kind little breeze carry every worry far away tonight.',
  'You are allowed to rest; the moon will watch over the sky for you.',
  'A thousand tiny wishes are shining just to say you matter.',
  'May your pillow feel like a cloud and your heart feel light.',
  'Even the smallest dream can open a very big door.',
  'Sleep softly. Somewhere, Pip is saving you the brightest star.',
  'May you wake with a song in your heart and stardust in your hair.',
]

const starSpots = [{ x: 22, y: 36 }, { x: 73, y: 29 }, { x: 58, y: 72 }]

function getVisitNumber() {
  try { return Number(sessionStorage.getItem('pip-magic-cabinet-visits') || 0) + 1 }
  catch { return 1 }
}

function playAudio(src, muted, volume = 0.45) {
  if (muted) return null
  const audio = new Audio(src)
  audio.volume = volume
  return audio
}

function CatchDreamGame({ sound, onFeedback }) {
  const [status, setStatus] = useState('ready')
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(20)
  const [dreams, setDreams] = useState([])
  const [bursts, setBursts] = useState([])
  const scoreRef = useRef(0)
  const secondsRef = useRef(20)
  const statusRef = useRef('ready')
  const nextId = useRef(0)
  const nextBurstId = useRef(0)
  const caughtIds = useRef(new Set())
  const arenaRef = useRef(null)

  const finish = useCallback((result) => {
    if (statusRef.current !== 'playing') return
    statusRef.current = result
    setStatus(result)
    setDreams([])
    if (result === 'won') sound('magic_chime.mp3', 0.55)
    onFeedback(result === 'won' ? 'Ten dreams! You did it!' : 'The dreams are drifting away… try again!')
  }, [onFeedback, sound])

  useEffect(() => {
    if (status !== 'playing') return undefined
    const timer = window.setInterval(() => {
      if (statusRef.current !== 'playing') return
      secondsRef.current -= 1
      setSeconds(secondsRef.current)
      if (secondsRef.current <= 0) finish('lost')
    }, 1000)
    const spawner = window.setInterval(() => {
      if (statusRef.current !== 'playing') return
      const id = ++nextId.current
      const width = arenaRef.current?.clientWidth || 320
      const inset = Math.min(28, (62 / width) * 100)
      const left = inset + Math.random() * (100 - inset * 2)
      setDreams((items) => items.length >= 3 ? items : [...items, { id, left }])
    }, 1150)
    return () => { window.clearInterval(timer); window.clearInterval(spawner) }
  }, [finish, status])

  const start = () => {
    scoreRef.current = 0
    secondsRef.current = 20
    caughtIds.current.clear()
    setScore(0)
    setSeconds(20)
    setDreams([])
    setBursts([])
    statusRef.current = 'playing'
    setStatus('playing')
    onFeedback('Catch it before it floats away!')
  }

  const catchDream = (dream) => {
    if (statusRef.current !== 'playing' || caughtIds.current.has(dream.id)) return
    caughtIds.current.add(dream.id)
    const rect = arenaRef.current?.getBoundingClientRect()
    const burstId = `${dream.id}-${++nextBurstId.current}`
    const burstLeft = rect ? (dream.left / 100) * rect.width : 50
    setDreams((items) => items.filter((item) => item.id !== dream.id))
    setBursts((items) => [...items, { id: burstId, left: burstLeft }])
    scoreRef.current += 1
    setScore((current) => current + 1)
    sound('dream_catch.mp3', 0.4)
    onFeedback('Caught a little dream! ✨')
    if (scoreRef.current >= 10) finish('won')
  }

  const removeDream = (id) => setDreams((items) => items.filter((item) => item.id !== id))
  const removeBurst = (id) => setBursts((items) => items.filter((item) => item.id !== id))

  return <div className="dream-game">
    <div className="dream-game-status" aria-live="polite"><span className={`dream-score ${score ? 'score-updated' : ''}`} key={score}>Dreams: <strong>{score}/10</strong></span><span className={seconds <= 5 && status === 'playing' ? 'time-warning' : ''}>Time: <strong>{seconds}s</strong></span></div>
    <div className={`dream-game-field ${status === 'playing' ? 'game-running' : ''} ${status === 'won' ? 'game-won' : ''}`} ref={arenaRef} aria-label="Catch falling dreams in this game area">
      {dreams.map((dream) => <button key={dream.id} data-silent-click className="falling-dream" style={{ left: `${dream.left}%` }} onClick={() => catchDream(dream)} onAnimationEnd={() => removeDream(dream.id)} aria-label="Catch this falling dream">✦</button>)}
      {bursts.map((burst) => <span key={burst.id} className="caught-pop" style={{ left: `${burst.left}px` }} onAnimationEnd={() => removeBurst(burst.id)} aria-hidden="true">✦</span>)}
      {status !== 'playing' && <div className={`game-message game-message-${status}`} role={status === 'ready' ? undefined : 'status'}>
        {status === 'ready' && <p>Ready to catch a few dreams?</p>}
        {status === 'won' && <><strong>Wonderful catching, little star!</strong><p>You tucked all ten dreams safely away.</p><span className="game-celebration" aria-hidden="true">✦ ✧ ✦ ✧ ✦</span></>}
        {status === 'lost' && <><strong>Time for a soft landing.</strong><p>You caught {score} of 10 dreams.</p></>}
      </div>}
    </div>
    {status !== 'playing' && <button className="cabinet-action" onClick={start}>{status === 'ready' ? 'Start Game' : status === 'won' ? 'Play Again' : 'Try Again'}</button>}
  </div>
}

export default function MagicCabinet({ onBack, muted }) {
  const [day, setDay] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [secretOpen, setSecretOpen] = useState(false)
  const [foundStars, setFoundStars] = useState([])
  const [flashlight, setFlashlight] = useState({ x: 50, y: 50, active: false })
  const [wishIndex, setWishIndex] = useState(0)
  const [notice, setNotice] = useState('')
  const [pipMessage, setPipMessage] = useState('Choose a drawer and I’ll show you a little wonder!')
  const [sparkleBursts, setSparkleBursts] = useState([])
  const [visits] = useState(getVisitNumber)
  const [lullabyPlaying, setLullabyPlaying] = useState(false)
  const audioRefs = useRef([])
  const lullabyRef = useRef(null)
  const sceneRef = useRef(null)
  const sparkleId = useRef(0)

  const releaseAudio = useCallback((audio) => {
    audio.pause()
    audio.currentTime = 0
    audio.removeAttribute('src')
    audio.load()
    const index = audioRefs.current.indexOf(audio)
    if (index !== -1) audioRefs.current.splice(index, 1)
  }, [])

  useEffect(() => {
    const key = 'pip-magic-cabinet-visits'
    try { sessionStorage.setItem(key, String(visits)) } catch { /* Session storage is optional. */ }
    const ownedAudio = audioRefs.current
    return () => [...ownedAudio].forEach(releaseAudio)
  }, [releaseAudio, visits])

  useEffect(() => {
    if (muted) {
      [...audioRefs.current].forEach(releaseAudio)
      lullabyRef.current = null
    }
  }, [muted, releaseAudio])

  const sound = useCallback((file, volume = 0.45) => {
    const audio = playAudio(`/audio/${file}`, muted, volume)
    if (!audio) return
    const cleanup = () => {
      audio.removeEventListener('ended', cleanup)
      audio.removeEventListener('error', cleanup)
      releaseAudio(audio)
    }
    audio.addEventListener('ended', cleanup)
    audio.addEventListener('error', cleanup)
    audioRefs.current.push(audio)
    audio.play().catch(cleanup)
  }, [muted, releaseAudio])

  const triggerSparkle = useCallback((x = 50, y = 54) => {
    const id = ++sparkleId.current
    setSparkleBursts((items) => [...items, { id, x, y }])
  }, [])

  const openDrawer = (index, event) => {
    setDrawer((current) => current === index ? null : index)
    setSecretOpen(false)
    setPipMessage(['Ooh, let’s let in a little morning!', 'A tiny star is hiding nearby!', 'Catch it before it floats away!', 'I wonder what dream is in the post…'][index])
    const bounds = sceneRef.current?.getBoundingClientRect()
    if (bounds) triggerSparkle(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100)
    if (lullabyRef.current) { lullabyRef.current.pause(); lullabyRef.current.currentTime = 0; lullabyRef.current = null; setLullabyPlaying(false) }
    sound('drawer_click.mp3', 0.5)
  }

  const moveFlashlight = (event) => {
    const rect = sceneRef.current?.getBoundingClientRect()
    if (!rect) return
    setFlashlight({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100, active: true })
  }

  const findStar = (index, event) => {
    if (foundStars.includes(index)) return
    setFoundStars((stars) => [...stars, index])
    setPipMessage('A tiny star! You found one!')
    const bounds = sceneRef.current?.getBoundingClientRect()
    if (bounds) triggerSparkle(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100)
    sound('magic_chime.mp3', 0.48)
  }

  const gameFeedback = useCallback((message) => {
    setPipMessage(message)
    if (message.startsWith('Caught') || message.startsWith('Ten dreams')) triggerSparkle(52, 60)
  }, [triggerSparkle])

  const nextWish = () => {
    setWishIndex((index) => (index + 1 + Math.floor(Math.random() * (wishes.length - 1))) % wishes.length)
    setNotice('A new little dream arrived.')
  }

  const copyWish = async () => {
    const wish = wishes[wishIndex]
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(wish)
      else {
        const field = document.createElement('textarea'); field.value = wish; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.appendChild(field); field.select()
        const copied = document.execCommand('copy'); field.remove()
        if (!copied) throw new Error('Clipboard unavailable')
      }
      setNotice('Dream copied to your clipboard.')
    } catch { setNotice('Copy is unavailable here. You can select the wish to copy it.') }
  }

  const shareWish = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'A dream from Pip', text: wishes[wishIndex] }); setNotice('Your dream is on its way.') }
      catch (error) { if (error.name !== 'AbortError') await copyWish() }
    } else await copyWish()
  }

  const openSecret = () => { setDrawer(null); setSecretOpen(true); setPipMessage('You found the secret I kept just for you!'); triggerSparkle(50, 48); sound('secret_reveal.mp3', 0.42) }

  const toggleLullaby = () => {
    if (lullabyRef.current) {
      releaseAudio(lullabyRef.current); lullabyRef.current = null; setLullabyPlaying(false)
      return
    }
    if (muted) { setNotice('Turn sound on to hear Pip’s quiet lullaby.'); return }
    const audio = new Audio('/audio/cabinet_lullaby.mp3')
    audio.loop = true; audio.volume = 0.18
    audio.onplay = () => setLullabyPlaying(true)
    audio.onpause = () => setLullabyPlaying(false)
    lullabyRef.current = audio
    audioRefs.current.push(audio)
    audio.play().catch(() => {
      const wasCurrent = lullabyRef.current === audio
      if (wasCurrent) lullabyRef.current = null
      releaseAudio(audio)
      if (wasCurrent) {
        setLullabyPlaying(false)
        setNotice('The lullaby could not be played right now.')
      }
    })
  }

  return <section className={`magic-cabinet ${day ? 'cabinet-day' : ''}`} aria-label="The Magic Cabinet">
    <div className="cabinet-sky-fluff" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><img className="cabinet-cloud-art" src="/images/pip_cloud.png" alt=""/><span className="cabinet-firefly firefly-one"/><span className="cabinet-firefly firefly-two"/><span className="cabinet-firefly firefly-three"/><span className="cabinet-firefly firefly-four"/></div>
    <header className="cabinet-header"><button className="cabinet-back" onClick={onBack}>← Back to Workshop</button><div><p className="cabinet-eyebrow">PIP'S MIDNIGHT OBSERVATORY</p><h1>The Magic Cabinet <span aria-hidden="true">✨</span></h1><p className="cabinet-subtitle">Psst… Pip keeps his tiniest wonders in here. Which drawer will you open?</p></div></header>
    <section className="cabinet-scene" ref={sceneRef} onPointerMove={moveFlashlight} onPointerDown={(event) => { if (event.pointerType === 'touch') moveFlashlight(event) }} aria-label="A magical cabinet with four drawers">
      <div className="cabinet-sun" aria-hidden="true">☀</div>
      <div className="cabinet-art"><img className="cabinet-pip" src="/images/Curious_pip.png" alt="Curious Pip watching over the magic cabinet"/><div className="cabinet-furniture" role="group" aria-label="Four magic drawers">
        <div className="cabinet-label">PIP'S LITTLE WONDERS</div>
        {[0, 1, 2, 3].map((index) => <button data-silent-click className={`cabinet-drawer drawer-${index + 1} ${drawer === index ? 'drawer-open' : ''}`} key={index} onClick={(event) => openDrawer(index, event)} aria-expanded={drawer === index} aria-label={`Open ${['Day and Night', 'Secret Star Finder', 'Catch a Falling Dream', 'Dream Post Office'][index]} drawer`}><span className="drawer-title">{['Day & Night', 'Star Finder', 'Catch a Dream', 'Dream Post'][index]}</span><span className="drawer-handle" aria-hidden="true">✦</span></button>)}
        <button data-silent-click className="cabinet-secret-handle" onClick={openSecret} aria-label="Open the hidden star-shaped secret compartment">✦</button>
      </div></div>
      <div className={`cabinet-flashlight ${drawer === 1 ? 'flashlight-active' : ''}`} style={{ '--flash-x': `${flashlight.x}%`, '--flash-y': `${flashlight.y}%` }} aria-hidden="true" />
      {drawer === 1 && starSpots.map((spot, index) => {
        const closeToLight = Math.hypot(spot.x - flashlight.x, spot.y - flashlight.y) < 19
        return <button key={index} data-silent-click className={`cabinet-hidden-star star-${index + 1} ${foundStars.includes(index) ? 'star-found' : ''} ${flashlight.active && closeToLight ? 'star-searching' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onClick={(event) => findStar(index, event)} aria-label={`Find hidden star ${index + 1}${foundStars.includes(index) ? ', found' : ''}`} disabled={foundStars.includes(index)}>{foundStars.includes(index) ? '✦' : '✧'}</button>
      })}
      {sparkleBursts.map((burst) => <span key={burst.id} className="cabinet-spark-burst" style={{ left: `${burst.x}%`, top: `${burst.y}%` }} onAnimationEnd={() => setSparkleBursts((items) => items.filter((item) => item.id !== burst.id))} aria-hidden="true">✦ ✧ ✦</span>)}
      <div className="cabinet-speech" role="status" aria-live="polite"><span className="speech-pip-name">Pip</span>{pipMessage}</div>
      <div className="cabinet-counter" aria-label={`${visits} visits this session`}>VISITOR NO. {String(visits).padStart(3, '0')}</div>
    </section>
    <p className="cabinet-hint">Choose a drawer to peek inside <span aria-hidden="true">✧</span></p>

    {drawer !== null && <section className={`cabinet-panel ${drawer === 1 ? 'cabinet-panel-finder' : ''}`} role="dialog" aria-modal={drawer !== 1} aria-labelledby="cabinet-panel-title"><button className="cabinet-close" onClick={() => setDrawer(null)} aria-label="Close drawer">×</button>
      {drawer === 0 && <><p className="cabinet-eyebrow">DRAWER ONE</p><h2 id="cabinet-panel-title">A little day, a little night</h2><p>Turn the cabinet toward a gentler morning, then tuck it back into midnight.</p><button data-silent-click className="cabinet-action" onClick={() => { setDay((value) => !value); sound('magic_chime.mp3') }}>{day ? 'Return to night ✦' : 'Let morning in ☀'}</button><button data-silent-click className="cabinet-secondary" onClick={toggleLullaby}>{lullabyPlaying && !muted ? 'Stop cabinet lullaby ♪' : 'Play cabinet lullaby ♪'}</button></>}
      {drawer === 1 && <><p className="cabinet-eyebrow">DRAWER TWO</p><h2 id="cabinet-panel-title">Secret Star Finder</h2><p>Move the light across the scene, or tap a glowing star. Stars found: {foundStars.length}/3</p>{foundStars.length === 3 ? <div className="cabinet-constellation" role="status"><span>{'\u2726  ·  \u2727  ·  \u2726'}</span><p>You found the whole constellation! Pip saved these stars just for you.</p></div> : <p className="cabinet-small-hint">Use your pointer, touch the scene, or tab to a star.</p>}</>}
      {drawer === 2 && <><p className="cabinet-eyebrow">DRAWER THREE</p><h2 id="cabinet-panel-title">Catch a Falling Dream</h2><CatchDreamGame sound={sound} onFeedback={gameFeedback}/></>}
      {drawer === 3 && <><p className="cabinet-eyebrow">DRAWER FOUR</p><h2 id="cabinet-panel-title">Dream Post Office</h2><blockquote className="cabinet-wish" aria-live="polite">“{wishes[wishIndex]}”</blockquote><div className="cabinet-wish-actions"><button className="cabinet-action" onClick={nextWish}>New Dream ✧</button><button onClick={copyWish}>Copy</button><button onClick={shareWish}>Share</button></div><p className="cabinet-notice" role="status">{notice}</p></>}
    </section>}

    {secretOpen && <div className="cabinet-secret-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSecretOpen(false) }}><section className="cabinet-secret-card" role="dialog" aria-modal="true" aria-labelledby="secret-title"><button className="cabinet-close" onClick={() => setSecretOpen(false)} aria-label="Close secret compartment">×</button><div className="secret-star-burst" aria-hidden="true">✦ ✧ ✦</div><p className="cabinet-eyebrow">A SECRET JUST FOR YOU</p><h2 id="secret-title">You found the dream Pip was keeping just for you. You're made of a little magic, too. 💗</h2></section></div>}
    <footer className="cabinet-footer">A pocket of wonder, kept safe by Pip <span aria-hidden="true">✧</span></footer>
  </section>
}
