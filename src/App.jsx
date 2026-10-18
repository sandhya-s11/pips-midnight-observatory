import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const notes = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88]
const stops = [
  ['Bakery rooftop', 'A dream that smells like warm bread.'],
  ['Moon pond', 'A silver boat remembers your wish.'],
  ['Cloud garden', 'Every flower hums a sleepy secret.'],
  ['Old clocktower', 'Time slows down for soft sleepers.'],
  ['Nursery window', 'A tiny star is waiting inside.'],
]
const scenes = [
  ['01', 'A sleepy star falls', 'It tumbled softly onto a cloud.'],
  ['02', 'Pip wakes giggling', 'The smallest light made a very big hello.'],
  ['03', 'Some ghosts need help', 'So Pip listened until the quiet felt friendly.'],
  ['04', 'A first nightlight', 'Warm glow, tiny switch, zero scary corners.'],
  ['05', 'Doors open at midnight', 'The nursery welcomed every wandering dream.'],
  ['06', 'Your invitation', 'What will you dream tonight?'],
]

function safeRead(key, fallback) {
  try { return window.localStorage.getItem(key) || fallback } catch { return fallback }
}

function App() {
  const [night, setNight] = useState(() => safeRead('pip-theme', 'night') === 'night')
  const [sound, setSound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Pip is dreaming…')
  const [playing, setPlaying] = useState(false)
  const [lamps, setLamps] = useState([false, false, false, false])
  const [selectedStop, setSelectedStop] = useState(null)
  const [wishes, setWishes] = useState(() => { try { return JSON.parse(window.localStorage.getItem('pip-wishes') || '[]') } catch { return [] } })
  const [wish, setWish] = useState('')
  const [delivered, setDelivered] = useState(1204)
  const [awake, setAwake] = useState(true)
  const [toast, setToast] = useState('')
  const audio = useRef(null)
  const pipTaps = useRef(0)

  useEffect(() => { const timer = setTimeout(() => setLoading(false), 1450); return () => clearTimeout(timer) }, [])
  useEffect(() => { try { window.localStorage.setItem('pip-theme', night ? 'night' : 'day') } catch { /* storage may be unavailable */ } }, [night])
  useEffect(() => { const id = setInterval(() => setStatus((current) => current === 'Pip is dreaming…' ? 'Pip is tinkering…' : current === 'Pip is tinkering…' ? 'Pip is giggling…' : 'Pip is dreaming…'), 2800); return () => clearInterval(id) }, [])
  useEffect(() => { const id = setTimeout(() => setAwake(false), 20000); return () => clearTimeout(id) }, [])
  useEffect(() => () => audio.current?.close(), [])

  const welcome = useMemo(() => safeRead('pip-seen', '') ? 'Welcome back, sleepy friend!' : 'Hello, new dreamer!', [])
  useEffect(() => { try { window.localStorage.setItem('pip-seen', 'yes') } catch { /* storage may be unavailable */ } }, [])

  const chime = (frequency = 440) => {
    if (!sound) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const context = audio.current || new AudioContextClass()
    audio.current = context
    const oscillator = context.createOscillator(); const gain = context.createGain()
    oscillator.type = 'sine'; oscillator.frequency.value = frequency * (night ? 1 : 1.12)
    gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.16, context.currentTime + .03); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .55)
    oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .6)
  }
  const playLullaby = () => {
    if (!sound) { setToast('Turn sound on for Pip’s tiny lullaby.'); return }
    if (playing) { setPlaying(false); return }
    setPlaying(true); notes.forEach((note, index) => setTimeout(() => chime(note), index * 400)); setTimeout(() => setPlaying(false), notes.length * 400 + 400)
  }
  const tapPip = () => { pipTaps.current += 1; chime(660); if (pipTaps.current >= 5) { setToast('You woke Pip!'); setStatus('Pip woke up giggling!'); pipTaps.current = 0 } }
  const submitWish = (event) => { event.preventDefault(); const clean = wish.trim().replace(/[<>]/g, '').slice(0, 80); if (!clean) return; const next = [clean, ...wishes].slice(0, 8); setWishes(next); setWish(''); setDelivered((value) => value + 1); try { window.localStorage.setItem('pip-wishes', JSON.stringify(next)) } catch { /* storage may be unavailable */ } }
  const toggleLamp = (index) => { setLamps((current) => current.map((lamp, i) => i === index ? !lamp : lamp)); chime([392, 440, 523, 659][index]) }

  return <main className={`observatory ${night ? 'night' : 'day'} ${lamps.some(Boolean) ? 'lamps-on' : ''}`} onPointerMove={() => setAwake(true)}>
    {loading && <div className="loading-screen"><div className="loading-lamp">☾</div><p>Pip is turning on the nightlight…</p></div>}
    <div className="grain" aria-hidden="true" />
    <div className="progress" aria-hidden="true" />
    <header className="topbar"><a className="brand" href="#home">Pip <span>✦</span></a><nav><a href="#about">About</a><a href="#projects">Projects</a><a href="#story">Story</a></nav><div className="controls"><button onClick={() => setSound(!sound)} aria-pressed={sound}>{sound ? 'Sound on ♫' : 'Sound off ◌'}</button><button onClick={() => setNight(!night)} aria-label="Toggle day and night mode">{night ? '☼ Day' : '☾ Night'}</button></div></header>

    <section className="hero" id="home"><div className="stars" aria-hidden="true">✦ · ✧ · ★ · ✦ · ✧ · ★</div><div className="hero-moon" onClick={() => { chime(540); setToast('The moon winks back.') }} aria-label="Winking moon">☾</div><div className="hero-copy"><p className="mono">{welcome} · {night ? 'still awake?' : 'good morning!'}</p><h1>Hello, I&apos;m <em>Pip.</em></h1><p className="tagline">I build the dreams you fall asleep inside.</p><p className="hero-text">I&apos;m a Junior Dream Engineer at the Midnight Nursery. I make lullabies, nightlights, and tiny bedtime stories for curious little sleepers.</p><div className="hero-actions"><a className="button primary" href="#projects">Follow the stars ↓</a><a className="button ghost" href="#about">Meet Pip ↗</a></div><div className="status"><i /> {status}</div></div><div className={`hero-art ${awake ? '' : 'asleep'}`} onClick={tapPip}><div className="orbit-label">JUNIOR DREAM ENGINEER ✦ MIDNIGHT NURSERY ✦</div><img src="/images/pip_avatar_cloud.jpg" alt="Pip waving on a cloud in a starry nightcap"/><span className="sticker sticker-one">little dream<br/>builder</span><span className="sticker sticker-two">tap me ✦</span>{!awake && <b className="zzz">z z z</b>}</div><div className="cloud cloud-a" aria-hidden="true">☁</div><div className="cloud cloud-b" aria-hidden="true">☁</div></section>

    <section className="section about" id="about"><p className="mono">THE NURSERY NOTEBOOK · NO. 001</p><div className="about-grid"><div className="portrait-frame"><img src="/images/pip_portrait.jpg" alt="Pip holding a lantern and a tiny unicorn music box"/><span className="spin-badge">PIP ★ PIP ★</span></div><div><p className="mono">A LITTLE INTRODUCTION</p><h2>Meet our <em>dreamer.</em></h2><p className="lead">Pip is curious, sleepy, a little clumsy, and easily delighted. Pip hates silence, so every night gets a song.</p><div className="traits"><span>✦ Sleepy but inventing</span><span>♡ Hates silence</span><span>☾ On night shift</span></div><div className="sheet"><div><b>IS</b><span>A baby dream engineer</span></div><div><b>DOES</b><span>Designs soft landings</span></div><div><b>LIVES</b><span>At the Midnight Nursery</span></div></div></div></div></section>

    <section className="section projects" id="projects"><div className="section-heading"><div><p className="mono">OPEN LATE EVERY NIGHT · THREE LITTLE PROJECTS</p><h2>The Dream <em>Workshop</em></h2></div><p>Small comforts for the hours when the world goes quiet.</p></div><article className="project-card lavender"><div className="project-image"><img src="/images/pip_lullaby_box.jpg" alt="Pip's pastel unicorn music box"/></div><div className="project-copy"><p className="mono">01 · THE LULLABY LAB</p><h3>A softer sort of <em>night song.</em></h3><p>Pip winds the music box and sends warm notes into the nursery.</p><div className="keys">{notes.map((note, index) => <button key={note} onClick={() => chime(note)} aria-label={`Play note ${index + 1}`}><span>{['do','re','mi','fa','sol','la','ti'][index]}</span></button>)}</div><button className="button primary" onClick={playLullaby}>{playing ? 'Stop the lullaby' : 'Play a tiny lullaby ♫'}</button></div></article><article className="project-card dark-card"><div className="project-copy"><p className="mono">02 · THE NIGHTLIGHT COLLECTION</p><h3>One small light changes <em>everything.</em></h3><p>Tap a lamp to warm up the corners of the night. The sleepy doodles are hiding nearby.</p><div className="lamps">{['☾','★','☁','♡'].map((lamp, index) => <button key={lamp} className={lamps[index] ? 'lit' : ''} onClick={() => toggleLamp(index)} aria-label={`Toggle ${lamp} lamp`}>{lamp}</button>)}</div></div><img className="lantern" src="/images/pip_dream_lantern.jpg" alt="Pip's glowing moon dream lantern"/></article><article className="project-card route-card"><div className="route-copy"><p className="mono">03 · DREAM DELIVERY ROUTES</p><h3>Every dream finds its <em>way home.</em></h3><p>Choose a star destination. Pip will send a tiny dream along the constellation path.</p><div className="dream-note" aria-live="polite">{selectedStop ? <><b>{stops[selectedStop][0]}</b><span>{stops[selectedStop][1]}</span></> : 'Select a star on the map ↗'}</div></div><div className="map"><svg viewBox="0 0 500 250" aria-hidden="true"><path d="M28 210 C100 100 150 220 230 125 S370 40 465 70"/><path d="M28 210 C100 100 150 220 230 125 S370 40 465 70" className="dash"/></svg>{stops.map((stop, index) => <button key={stop[0]} style={{left: `${8 + index * 20}%`, top: `${72 - (index % 3) * 23}%`}} onClick={() => { setSelectedStop(index); setDelivered((value) => value + 1); chime(500 + index * 40) }} aria-label={`Deliver dream to ${stop[0]}`} className={selectedStop === index ? 'selected' : ''}>✦<small>{stop[0]}</small></button>)}</div></article></section>

    <section className="story section" id="story"><p className="mono">FILED UNDER: HOW IT BEGAN · SIX SCENES</p><h2>A little <em>origin story.</em></h2><div className="story-line" /> <div className="scenes">{scenes.map(([number, title, caption], index) => <article className={`scene scene-${index + 1}`} key={number}><span className="scene-number">{number}</span><div className="scene-art">{['✦','☻','◌','☼','✧','☾'][index]}</div><div><p className="mono">PIP SAYS</p><h3>{title}</h3><p>{caption}</p></div></article>)}</div><p className="story-end">What will you dream tonight? <em>✦</em></p></section>

    <section className="growth section"><p className="mono">THE GROWTH CHART · NIGHT SHIFT SKILLS</p><div className="growth-grid"><div><h2>Growing into <em>the job.</em></h2><p>Every little skill gets taller when someone needs a softer night.</p></div><div className="chart">{['Dream design','Lullabies','Nightlights','Storytelling','Giggling'].map((skill, index) => <div className="bar" key={skill}><span style={{height: `${52 + index * 8}%`}}><b>{index + 3}</b></span><label>{skill}</label></div>)}</div></div></section>

    <section className="guestbook section"><div className="guest-copy"><p className="mono">THE DREAM GUESTBOOK · 00{Math.min(wishes.length + 1, 9)}</p><h2>Leave a dream wish for <em>Pip.</em></h2><p>Write something tiny for the nursery wall. Pip reads every note at bedtime.</p><form onSubmit={submitWish}><input value={wish} onChange={(event) => setWish(event.target.value)} maxLength="80" placeholder="I wish for…" aria-label="Your dream wish"/><button className="button primary">Pin it ✦</button></form></div><div className="wish-wall">{wishes.length ? wishes.map((item, index) => <div className={`wish wish-${index % 4}`} key={`${item}-${index}`}>{item}</div>) : <><div className="wish wish-0">A pocket full of stars</div><div className="wish wish-1">A nap with the moon</div><div className="wish wish-2">No more scary quiet</div></>}<div className="odometer"><strong>{delivered.toString().padStart(5, '0')}</strong><span>dreams delivered</span></div></div></section>

    <footer><div className="footer-star">✦</div><h2>Sleep well, <em>little star.</em></h2><p>Made with tiny dreams and a little stardust.</p><div className="badges"><span>BEST VIEWED<br/>IN DREAMLAND</span><span>MADE WITH<br/>CLAUDE & LOVE</span></div><small>Pip art: official haX.baby Pip Creator Asset Pack · Fonts: Google Fonts · Sound: synthesised with Web Audio API · Libraries: React, Tailwind, GSAP, Framer Motion</small><p className="credits">haX.baby “Baby&apos;s First Website” hackathon · Track 1 · Last updated at bedtime</p></footer>
    {toast && <button className="toast" onClick={() => setToast('')} role="status">{toast} ×</button>}
  </main>
}

export default App
