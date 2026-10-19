import { useEffect, useState } from 'react'
import './StardustCursor.css'

const MAX_SPARKLES = 12

export default function StardustCursor({ reducedMotion }) {
  const [sparkles, setSparkles] = useState([])

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion || motionQuery.matches) return undefined

    const maxSparkles = coarsePointerQuery.matches ? 6 : MAX_SPARKLES
    const spawnInterval = coarsePointerQuery.matches ? 90 : 42

    let frame = 0
    let lastSpawn = 0
    let nextId = 0
    let point = null
    const onPointerMove = (event) => {
      point = { x: event.clientX, y: event.clientY }
      if (frame) return
      frame = window.requestAnimationFrame((time) => {
        frame = 0
        if (!point || time - lastSpawn < spawnInterval) return
        lastSpawn = time
        const sparkle = { id: nextId++, ...point, tone: nextId % 2 ? 'gold' : 'lilac' }
        setSparkles((current) => [...current.slice(-(maxSparkles - 1)), sparkle])
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
