import { useEffect, useState } from 'react'
import './StardustCursor.css'

const MAX_SPARKLES = 12

export default function StardustCursor({ reducedMotion }) {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!pointerQuery.matches || reducedMotion || motionQuery.matches) return undefined

    let frame = 0
    let lastSpawn = 0
    let nextId = 0
    let point = null
    const onPointerMove = (event) => {
      if (event.pointerType === 'touch') return
      point = { x: event.clientX, y: event.clientY }
      if (frame) return
      frame = window.requestAnimationFrame((time) => {
        frame = 0
        if (!point || time - lastSpawn < 42) return
        lastSpawn = time
        const sparkle = { id: nextId++, ...point, tone: nextId % 2 ? 'gold' : 'lilac' }
        setSparkles((current) => [...current.slice(-(MAX_SPARKLES - 1)), sparkle])
      })
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  if (!sparkles.length || reducedMotion) return null
  return <div className="stardust-cursor" aria-hidden="true">{sparkles.map((sparkle) => <i key={sparkle.id} className={`stardust-particle ${sparkle.tone}`} style={{ left: sparkle.x, top: sparkle.y }} />)}</div>
}
