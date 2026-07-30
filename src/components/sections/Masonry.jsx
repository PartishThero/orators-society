// Masonry.jsx — Optimized: Intersection Observer entrance, transform-only GSAP, will-change lifecycle
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'

import './Masonry.css'

const useMedia = (queries, values, defaultValue) => {
  const getValue = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue
  const [value, setValue] = useState(getValue)

  useEffect(() => {
    const handler = () => setValue(getValue)
    queries.forEach(q => matchMedia(q).addEventListener('change', handler))
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries])

  return value
}

const useMeasure = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!ref.current) return
    let timeoutId = null
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setSize({ width, height })
      }, 200)
    })
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return [ref, size]
}

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = false,
  colorShiftOnHover = false,
  onItemClick = () => {},
  onRegisterClick = () => {}
}) => {
  // useMedia already handles breakpoints via matchMedia — no extra resize listener needed
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1024px)', '(min-width:768px)', '(min-width:640px)'],
    [5, 4, 3, 2],
    1
  )

  const [containerRef, { width }] = useMeasure()
  const [imagesReady, setImagesReady] = useState(false)

  // Derive activeCols directly — no extra state, no extra effect
  const activeCols = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 1
    return columns
  }, [columns])

  useEffect(() => {
    if (!items.length) return
    setImagesReady(true)
  }, [items])

  const grid = useMemo(() => {
    if (!width) return []

    const colHeights = new Array(activeCols).fill(0)
    const columnWidth = width / activeCols

    return items.map(child => {
      const span = Math.min(child.colSpan || 1, activeCols)

      let bestCol = 0
      let minMaxHeight = Infinity

      for (let i = 0; i <= activeCols - span; i++) {
        let maxHeightInSpan = 0
        for (let j = 0; j < span; j++) {
          if (colHeights[i + j] > maxHeightInSpan) {
            maxHeightInSpan = colHeights[i + j]
          }
        }
        if (maxHeightInSpan < minMaxHeight) {
          minMaxHeight = maxHeightInSpan
          bestCol = i
        }
      }

      const x = columnWidth * bestCol
      const y = minMaxHeight
      const height = 400
      const itemWidth = columnWidth * span

      for (let j = 0; j < span; j++) {
        colHeights[bestCol + j] = y + height
      }

      return { ...child, x, y, w: itemWidth, h: height }
    })
  }, [activeCols, items, width])

  const containerHeight = useMemo(() => {
    if (!grid.length) return 0
    return Math.max(...grid.map(item => item.y + item.h))
  }, [grid])

  // Track which items have already played their entrance animation
  const animatedIds = useRef(new Set())
  const hasMounted = useRef(false)

  // Stable helper — memoized so random directions don't shift between renders
  const getInitialPosition = useCallback((item) => {
    let direction = animateFrom
    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right']
      direction = directions[Math.floor(Math.random() * directions.length)]
    }
    switch (direction) {
      case 'top':    return { x: item.x, y: -200 }
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 }
      case 'left':   return { x: -200, y: item.y }
      case 'right':  return { x: window.innerWidth + 200, y: item.y }
      case 'center': return { x: width / 2 - item.w / 2, y: containerHeight / 2 - item.h / 2 }
      default:       return { x: item.x, y: item.y + 100 }
    }
  }, [animateFrom, width, containerHeight])

  // On reflow (column / filter change): just move existing items with transforms only
  useLayoutEffect(() => {
    if (!imagesReady || !grid.length || !hasMounted.current) return
    grid.forEach(item => {
      const el = document.querySelector(`[data-key="${item.id}"]`)
      if (!el) return
      gsap.to(el, { x: item.x, y: item.y, duration, ease, overwrite: 'auto' })
    })
  }, [grid, imagesReady, duration, ease])

  // Intersection Observer: trigger entrance animation only when item enters viewport
  useEffect(() => {
    if (!imagesReady || !grid.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const id = el.dataset.key
          if (animatedIds.current.has(id)) return
          animatedIds.current.add(id)
          hasMounted.current = true

          const item = grid.find(g => String(g.id) === String(id))
          if (!item) return

          const initialPos = getInitialPosition(item)

          // Set will-change just before animating; clear it after to free GPU memory
          gsap.set(el, { willChange: 'transform, opacity' })

          gsap.fromTo(
            el,
            {
              opacity: 0,
              x: initialPos.x,
              y: initialPos.y,
              ...(blurToFocus && { filter: 'blur(10px)' })
            },
            {
              opacity: 1,
              x: item.x,
              y: item.y,
              ...(blurToFocus && { filter: 'blur(0px)' }),
              duration,
              ease,
              onComplete: () => {
                gsap.set(el, { willChange: 'auto', clearProps: 'filter' })
              }
            }
          )

          observer.unobserve(el)
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )

    grid.forEach(item => {
      const el = document.querySelector(`[data-key="${item.id}"]`)
      if (el && !animatedIds.current.has(String(item.id))) {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [grid, imagesReady, getInitialPosition, blurToFocus, duration, ease])

  const handleMouseEnter = (e, item) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${item.id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' })
    }
    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector('.color-overlay')
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 })
    }
  }

  const handleMouseLeave = (e, item) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${item.id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }
    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector('.color-overlay')
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 })
    }
  }

  return (
    <div
      ref={containerRef}
      className="list"
      style={{ minHeight: '400px', height: containerHeight ? `${containerHeight}px` : 'auto' }}
    >
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="item-wrapper"
          style={{
            // Width/height set as static inline styles — GSAP never touches layout properties
            width: `${item.w}px`,
            height: `${item.h}px`,
            // Items start invisible; IntersectionObserver triggers entrance per-item
            opacity: animatedIds.current.has(String(item.id)) ? undefined : 0,
            transform: `translate(${item.x}px, ${item.y}px)`
          }}
          onClick={() => onItemClick(item)}
          onMouseEnter={e => handleMouseEnter(e, item)}
          onMouseLeave={e => handleMouseLeave(e, item)}
        >
          <div className="item-img">
            <img
              src={item.img}
              alt={item.title || ''}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            />
            {colorShiftOnHover && <div className="color-overlay" />}

            <div className="item-overlay">
              <span className="item-overlay-title">{item.title}</span>
              {item.subtitle && (
                <span className="item-overlay-sub">{item.subtitle}</span>
              )}
              <div className="item-overlay-meta">
                {(item.status === 'live' || item.status === 'upcoming') ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRegisterClick(item)
                    }}
                    className="bg-primary text-black font-label-caps uppercase text-[9px] font-bold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    Register
                  </button>
                ) : item.winner && (
                  <span className="item-overlay-badge">{item.winner}</span>
                )}
                {item.date && (
                  <span className="item-overlay-date">{item.date}</span>
                )}
              </div>
              {item.location && (
                <span className="item-overlay-location">📍 {item.location}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default React.memo(Masonry)
