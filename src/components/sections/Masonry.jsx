import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}

const preloadImages = async urls => {
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image()
          img.src = src
          img.onload = img.onerror = () => resolve()
        })
    )
  )
}

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick = () => {}
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1024px)', '(min-width:768px)', '(min-width:640px)'],
    [5, 4, 3, 2],
    1
  )

  const [containerRef, { width }] = useMeasure()
  const [imagesReady, setImagesReady] = useState(false)

  useEffect(() => {
    if (!items.length) return
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true))
  }, [items])

  const grid = useMemo(() => {
    if (!width) return []

    const colHeights = new Array(columns).fill(0)
    const columnWidth = width / columns

    return items.map(child => {
      const span = Math.min(child.colSpan || 1, columns)
      
      let bestCol = 0
      let minMaxHeight = Infinity
      
      for (let i = 0; i <= columns - span; i++) {
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
      const height = 400 // Uniform height for a perfect rectangular bottom
      const itemWidth = columnWidth * span
      
      for (let j = 0; j < span; j++) {
        colHeights[bestCol + j] = y + height
      }

      return { ...child, x, y, w: itemWidth, h: height }
    })
  }, [columns, items, width])

  const containerHeight = useMemo(() => {
    if (!grid.length) return 0
    return Math.max(...grid.map(item => item.y + item.h))
  }, [grid])

  const hasMounted = useRef(false)

  const getInitialPosition = item => {
    let direction = animateFrom
    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right']
      direction = directions[Math.floor(Math.random() * directions.length)]
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 }
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 }
      case 'left':
        return { x: -200, y: item.y }
      case 'right':
        return { x: window.innerWidth + 200, y: item.y }
      case 'center':
        return {
          x: width / 2 - item.w / 2,
          y: containerHeight / 2 - item.h / 2
        }
      default:
        return { x: item.x, y: item.y + 100 }
    }
  }

  useLayoutEffect(() => {
    if (!imagesReady || !grid.length) return

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      }

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item)
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        }

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: duration,
          ease,
          delay: index * stagger
        })
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration,
          ease,
          overwrite: 'auto'
        })
      }
    })

    hasMounted.current = true
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, containerHeight, width])

  const handleMouseEnter = (e, item) => {
    const selector = `[data-key="${item.id}"]`

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector('.color-overlay')
      if (overlay) {
        gsap.to(overlay, { opacity: 0.3, duration: 0.3 })
      }
    }
  }

  const handleMouseLeave = (e, item) => {
    const selector = `[data-key="${item.id}"]`

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    if (colorShiftOnHover) {
      const overlay = e.currentTarget.querySelector('.color-overlay')
      if (overlay) {
        gsap.to(overlay, { opacity: 0, duration: 0.3 })
      }
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
        onClick={() => onItemClick(item)}
        onMouseEnter={e => handleMouseEnter(e, item)}
        onMouseLeave={e => handleMouseLeave(e, item)}
      >
        <div className="item-img" style={{ backgroundImage: `url(${item.img})` }}>
          {colorShiftOnHover && <div className="color-overlay" />}

          {/* Card overlay */}
          <div className="item-overlay">
            <span className="item-overlay-title">{item.title}</span>
            {item.subtitle && (
              <span className="item-overlay-sub">{item.subtitle}</span>
            )}
            <div className="item-overlay-meta">
              {item.winner && (
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

export default Masonry
