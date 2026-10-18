import { useEffect, useRef, useState } from 'react'
import './App.css'

const dreams = [
  { id: 'cloud', label: 'Cloud Garden', message: 'Tonight, a soft cloud carries you over a garden that only blooms in moonlight.' },
  { id: 'moon', label: 'Moon Pond', message: 'A silver boat is waiting on the Moon Pond. The water remembers every wish.' },
  { id: 'rooftop', label: 'Rooftop Kites', message: 'A little kite made of starlight is ready to dance above the rooftops with you.' },
]

function App() {
  const [nightMode, setNightMode] = useState(() => window.localStorage.getItem('pip-theme') !== 'day')
  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [glow, setGlow] = useState(false)
  const [dream, setDream] = useState(null)
  const [secret, setSecret] = useState(false)
  const [sparkles, setSparkles] = useState(false)
  const [mood, setMood] = useState('Sleepy')
  const [pipMessage, setPipMessage] = useState('A little sleepy, a little curious, and very glad you’re here.')
  const [delivered, setDelivered] = useState(0)
  const [chaos, setChaos] = useState(false)
  const audioRef = useRef(null)
  const timersRef = useRef([])
  const heroArtRef = useRef(null)

  useEffect(() => { window.localStorage.setItem('pip-theme', nightMode ? 'night' : 'day') }, [nightMode])

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    if (audioRef.current) audioRef.current.close()
  }, [])

  useEffect(() => {
    const scenes = [...document.querySelectorAll('.story-scene')]
    if (!('IntersectionObserver' in window)) return
    scenes.forEach((scene) => scene.classList.add('reveal-ready'))
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.18 })
    scenes.forEach((scene) => observer.observe(scene))
    return () => observer.disconnect()
  }, [])

  const playLullaby = async () => {
    if (playing) {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      if (audioRef.current) { await audioRef.current.close(); audioRef.current = null }
      setPlaying(false)
      return
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
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
    setMuted((current) => {
      const next = !current
      if (audioRef.current?.state === 'running') {
        // The master gain is attached to the context so the control is also effective mid-song.
        audioRef.current._pipMaster?.gain.setTargetAtTime(next ? 0 : 0.16, audioRef.current.currentTime, 0.03)
      }
      return next
    })
  }

  const discoverSecret = () => {
    setSecret(true); setSparkles(true)
    const timer = setTimeout(() => setSparkles(false), 1500)
    timersRef.current.push(timer)
  }

  const reactToPip = () => {
    const messages = ['Pip says: “Did you hear that? I think the stars are giggling.”', 'Pip says: “I made you a dream. It has a very small boat.”', 'Pip says: “Oh! You found me. I was just counting clouds.”']
    setPipMessage(messages[Math.floor(Math.random() * messages.length)])
    setDelivered((count) => count + 1)
  }

  const movePip = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    if (heroArtRef.current) heroArtRef.current.style.transform = `translate(${x * 8}px, ${y * 7}px) rotate(${x * 2}deg)`
  }

  const resetPip = () => { if (heroArtRef.current) heroArtRef.current.style.transform = '' }

  return (
    <main className={`observatory ${nightMode ? 'night' : 'day'} ${mood.toLowerCase()} ${chaos ? 'chaos' : ''}`}>
      <header className="navbar">
        <a className="brand" href="#home" aria-label="Pip's Observatory home"><img src="/images/pip_avatar_cloud.jpg" alt="" /> <span>Pip's <i>Midnight Observatory</i></span></a>
        <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">☰</span></button>
        <nav id="primary-navigation" className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <a onClick={() => setMenuOpen(false)} href="#about">About Pip</a><a onClick={() => setMenuOpen(false)} href="#workshop">Dream Workshop</a><a onClick={() => setMenuOpen(false)} href="#story">Origin Story</a>
        </nav>
        <div className="nav-controls">
          <button className="chaos-toggle" onClick={() => setChaos(!chaos)} aria-pressed={chaos}>{chaos ? 'Calm stars' : 'Star dance'}</button>
          <button className="sound-toggle" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'Unmute lullaby' : 'Mute lullaby'}>{muted ? 'Sound off' : 'Sound on'} <span aria-hidden="true">{muted ? '◌' : '♫'}</span></button>
          <button className="theme-toggle" onClick={() => setNightMode(!nightMode)} aria-label={`Switch to ${nightMode ? 'day' : 'night'} mode`} aria-pressed={!nightMode}>{nightMode ? '☼ Day' : '☾ Night'}</button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="sky-stars" aria-hidden="true" />
        <span className="hero-moon" aria-hidden="true" />
        <span className="lantern-orbit" aria-hidden="true">✧</span>
        <div className="hero-copy">
          <p className="eyebrow">Junior Dream Engineer <b>·</b> Midnight Nursery</p>
          <h1>I build the dreams<br />you fall asleep <em>inside.</em></h1>
          <p className="hero-description">Hello, night visitor. I’m Pip — a little sleepy, a little curious, and very glad you’re here. Come see where the dreams are made.</p>
          <div className="hero-actions"><a className="primary-button" href="#workshop">Enter the Dream World <span>↓</span></a><a className="text-link" href="#about">Meet Pip <span>↗</span></a></div>
          <p className="hero-note"><span className="live-dot" /> Currently awake past bedtime ✦</p>
        </div>
        <div className="hero-art" onPointerMove={movePip} onPointerLeave={resetPip}><div className="art-halo" /><img ref={heroArtRef} src="/images/pip_avatar_cloud.jpg" alt="Pip nestled in a little cloud, wearing a starry nightcap" /><span className="art-caption">little keeper of the in-between</span><span className="annotation annotation-log">DREAM LOG · 001</span><span className="annotation annotation-sleep">SLEEP LEVEL · 2%</span></div>
        <div className="cloud cloud-left" aria-hidden="true">☁</div><div className="cloud cloud-right" aria-hidden="true">☁</div>
        <a className="hidden-star" href="#secret-note" aria-label="A tiny hidden star — discover Pip's secret note" onClick={(event) => { event.preventDefault(); discoverSecret() }}>✦</a>
      </section>

      <section className="about section" id="about">
        <div className="section-kicker">THE NURSERY NOTEBOOK <span>NO. 001</span></div>
        <div className="profile-layout">
          <button className="profile-image" onClick={reactToPip} aria-label="Say hello to Pip"><img src="/images/pip_portrait.jpg" alt="Pip, a cute skull-faced baby in a starry nightcap with a little bow" /><span className="image-stamp">PIP<br />★</span><span className="profile-hint">TAP TO SAY HELLO</span></button>
          <div className="profile-copy"><p className="eyebrow">A LITTLE INTRODUCTION</p><h2>Meet our <em>dreamer.</em></h2><p className="profile-lead">Pip is a Junior Dream Engineer at the Midnight Nursery: curious, cozy, and just a bit clumsy.</p><p>A smooth round skull, two tiny lights for eyes, a crooked smile, and a nightcap with a pink bow. Pip’s favorite thing is making dreams for little creatures — usually while giggling at absolutely nothing.</p><p className="pip-message" aria-live="polite">{pipMessage}</p><div className="profile-tags"><span>✦ Sleepy, but inventing</span><span>♡ Hates silence</span><span>☾ On night shift</span></div><div className="mood-switch" role="group" aria-label="Pip's mood"><span>PIP'S MOOD</span><button aria-pressed={mood === 'Sleepy'} onClick={() => setMood('Sleepy')}>Sleepy</button><button aria-pressed={mood === 'Curious'} onClick={() => setMood('Curious')}>Curious</button></div></div>
        </div>
      </section>

      <section className="workshop section" id="workshop">
        <div className="section-kicker">OPEN LATE EVERY NIGHT <span>THREE LITTLE PROJECTS</span></div>
        <div className="section-heading"><div><p className="eyebrow">MADE AFTER MOONRISE</p><h2>The Dream <em>Workshop</em></h2></div><p>Small comforts for the hours when the world goes quiet.</p></div>
        <article className="project lullaby-project"><div className="project-image"><img src="/images/pip_lullaby_box.jpg" alt="Pip's music box for making gentle lullabies" /><span className="image-label">01 / SOUND STUDY</span></div><div className="project-copy"><p className="eyebrow">THE LULLABY LAB</p><h3>A softer sort<br />of <em>night song.</em></h3><p>Pip winds the little music box and sends a handful of warm notes out into the nursery.</p><button className="project-button" onClick={() => { setDelivered((count) => count + 1); playLullaby() }} aria-pressed={playing}>{playing ? 'Stop the lullaby' : 'Play a tiny lullaby'} <span>{playing ? 'Ⅱ' : '♫'}</span></button><span className="interaction-hint">A short melody, made with Web Audio. No autoplay.</span></div></article>
        <article className={`project lantern-project ${glow ? 'glowing' : ''}`}><div className="project-copy"><p className="eyebrow">THE NIGHTLIGHT COLLECTION</p><h3>One small light<br />changes <em>everything.</em></h3><p>For the corners of a room that feel a little too quiet. Tap the lantern to warm up the whole night.</p><button className="project-button" onClick={() => { setGlow(!glow); setDelivered((count) => count + 1) }} aria-pressed={glow}>{glow ? 'Dim the lantern' : 'Light the lantern'} <span>{glow ? '☼' : '✧'}</span></button></div><button className="lantern-image" onClick={() => { setGlow(!glow); setDelivered((count) => count + 1) }} aria-label={glow ? 'Turn the lantern glow off' : 'Turn the lantern glow on'} aria-pressed={glow}><img src="/images/pip_dream_lantern.jpg" alt="A glowing dream lantern from Pip’s collection" /><span className="image-label">02 / LIGHT STUDY</span></button></article>
        <article className="project routes-project"><div className="route-intro"><p className="eyebrow">DREAM DELIVERY ROUTES</p><h3>Every dream<br />finds its <em>way home.</em></h3><p>Choose a star destination. Pip will send a tiny dream along the constellation path.</p><div className="dream-message" aria-live="polite">{dream ? <><span>TONIGHT'S DELIVERY</span><p>{dream.message}</p></> : <span className="message-placeholder">Select a star on the map ↗</span>}</div></div><div className="map-wrap"><svg className={`constellation ${dream ? `route-${dream.id}` : ''}`} viewBox="0 0 560 330" role="img" aria-label="A constellation map showing three dream delivery destinations connected by a glowing route"><path className="route-base" d="M64 246 C140 214 126 122 222 147 S310 241 366 166 S458 95 507 63"/><path className="route-dash" d="M64 246 C140 214 126 122 222 147 S310 241 366 166 S458 95 507 63"/><circle className="travel-star" r="8"><animateMotion dur="5s" repeatCount="indefinite" path="M64 246 C140 214 126 122 222 147 S310 241 366 166 S458 95 507 63" /></circle><g className="map-destination"><circle cx="222" cy="147" r="26"/><text x="222" y="153">✦</text></g></svg>{dreams.map((item) => <button key={item.id} className={`map-star star-${item.id}`} onClick={() => { setDream(item); setDelivered((count) => count + 1) }} aria-label={`Send a dream to ${item.label}`} aria-pressed={dream?.id === item.id}><span>✦</span><small>{item.label}</small></button>)}<span className="map-label">NURSERY SKY · 03:17 AM</span></div></article>
      </section>

      <section className="story section" id="story"><div className="section-kicker">FILED UNDER: HOW IT BEGAN <span>THREE SCENES</span></div><div className="story-heading"><p className="eyebrow">BEFORE THE FIRST DREAM</p><h2>A little <em>origin story.</em></h2></div><div className="story-scenes"><article className="story-scene scene-one"><span className="scene-number">01</span><div className="scene-visual"><span className="falling-star">✦</span><span className="scene-lantern">♧</span></div><div><p className="eyebrow">THE LITTLE FALL</p><h3>A star finds shelter.</h3><p>One quiet night, a tiny fallen star tumbled into a forgotten lantern on a rooftop.</p></div></article><article className="story-scene scene-two"><span className="scene-number">02</span><div className="scene-visual"><span className="scene-note">♪</span><span className="scene-glow">✧</span></div><div><p className="eyebrow">A NEW PURPOSE</p><h3>Light, song, and a story.</h3><p>Pip discovered that the smallest comforts could make a lonely night feel safe.</p></div></article><article className="story-scene scene-three"><span className="scene-number">03</span><div className="scene-visual"><span className="scene-route">✧ · · ✦ · · ✧</span></div><div><p className="eyebrow">THE MIDNIGHT DELIVERY</p><h3>A dream engineer is born.</h3><p>Now Pip carries tiny dreams over rooftops and constellations, always home before sunrise.</p></div></article></div><div className="story-signoff">And when the nursery gets quiet... <em>Pip starts humming.</em></div></section>

      <footer className="footer"><div className="footer-mark">✦</div><p className="eyebrow">PIP'S MIDNIGHT OBSERVATORY</p><h2>Sleep well, <em>little star.</em></h2><p>Made with tiny dreams and a little stardust.</p><p className="counter">{delivered.toString().padStart(3, '0')} dreams delivered <small>· playful demo counter</small></p><a className="back-top" href="#home">Back to the top ↑</a><small>Character artwork: official haX.baby Pip asset pack · Track 1</small><a className="footer-home" href="#home" aria-label="Back to top">✦</a></footer>
      {secret && <div className="secret-note" id="secret-note" role="status"><button aria-label="Close secret note" onClick={() => setSecret(false)}>×</button><span>✧ A NOTE FROM PIP ✧</span><p>May your dreams be soft, and may one little star keep you company. Goodnight!</p>{sparkles && <div className="secret-sparkles" aria-hidden="true">✦ · ✧ · ✦</div>}</div>}
    </main>
  )
}

export default App
