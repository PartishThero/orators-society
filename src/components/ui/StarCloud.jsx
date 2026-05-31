// StarCloud.jsx — Star cloud background effect component
import React, { useRef, useEffect, useState, useMemo, startTransition } from 'react'

export default function StarCloud(props) {
  const {
    starCount = 180,
    starSize = 1.5,
    starColor = "#000000ff",
    cloudSize = 1000,
    baseSpeed = 0.8,
    variant = "desktop"
  } = props

  const containerRef = useRef(null)
  const animationRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })
  const centerRef = useRef({ x: 0, y: 0 })
  const [stars, setStars] = useState([])

  // Generate initial stars
  const initialStars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      x: (Math.random() - 0.5) * cloudSize,
      y: (Math.random() - 0.5) * cloudSize,
      z: Math.random() * cloudSize,
      id: i
    }))
  }, [starCount, cloudSize])

  useEffect(() => {
    setStars(initialStars)
  }, [initialStars])

  // Update center position on resize
  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      }
    }
    updateCenter()
    window.addEventListener("resize", updateCenter)
    return () => window.removeEventListener("resize", updateCenter)
  }, [])

  // Mouse tracking (only for desktop variant)
  useEffect(() => {
    if (variant === "phone") return
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [variant])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      let speed
      let moveX = 0
      let moveY = 0
      let moveZ = 0

      if (variant === "phone") {
        speed = baseSpeed * 10
        moveZ = speed
      } else {
        const mouse = mouseRef.current
        const center = centerRef.current
        const dx = mouse.x - center.x
        const dy = mouse.y - center.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        const centerZone = 50
        const transitionZone = 150

        if (distance < centerZone) {
          speed = baseSpeed * 10
          moveZ = speed
        } else if (distance < centerZone + transitionZone) {
          const blendFactor = (distance - centerZone) / transitionZone
          const easedBlend = blendFactor * blendFactor * (3 - 2 * blendFactor)
          const zSpeed = baseSpeed * 10 * (1 - easedBlend)
          moveZ = zSpeed
          const directionalSpeed = baseSpeed * (1200 / distance) * easedBlend
          const dirX = -dx / distance
          const dirY = -dy / distance
          moveX = dirX * directionalSpeed
          moveY = dirY * directionalSpeed
        } else {
          speed = baseSpeed * (1200 / distance)
          const dirX = -dx / distance
          const dirY = -dy / distance
          moveX = dirX * speed
          moveY = dirY * speed
        }
      }

      startTransition(() => {
        setStars((prevStars) =>
          prevStars.map((star) => {
            let newX = star.x + moveX
            let newY = star.y + moveY
            let newZ = star.z + moveZ

            if (newX > cloudSize / 2) newX = -cloudSize / 2
            if (newX < -cloudSize / 2) newX = cloudSize / 2
            if (newY > cloudSize / 2) newY = -cloudSize / 2
            if (newY < -cloudSize / 2) newY = cloudSize / 2
            if (newZ > cloudSize) newZ = 0
            if (newZ < 0) newZ = cloudSize

            return { ...star, x: newX, y: newY, z: newZ }
          })
        )
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [baseSpeed, cloudSize, variant])

  // Initialize center position after mount
  useEffect(() => {
    const initializeCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      }
    }
    const timeoutId = setTimeout(initializeCenter, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        backgroundColor: "transparent",
        overflow: "hidden",
        position: "relative",
        ...props.style
      }}
    >
      {stars.map((star) => {
        const scale = 300 / (300 + star.z)
        const x = star.x * scale
        const y = star.y * scale
        const size = starSize * scale
        const opacity = Math.max(0.1, 1 - star.z / cloudSize)
        return (
          <div
            key={star.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: size,
              height: size,
              backgroundColor: starColor,
              borderRadius: "50%",
              transform: `translate(${x - size / 2}px, ${y - size / 2}px)`,
              opacity,
              pointerEvents: "none"
            }}
          />
        )
      })}
    </div>
  )
}
