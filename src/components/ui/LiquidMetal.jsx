import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function LiquidMetal({
  logo = "../assets/logo.svg",
  liquidColor = "#ffffff",
  metalness = 0.9,
  roughness = 0.1,
  style
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springX = useSpring(mouseX, { stiffness: 60, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 15 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // Normalize coordinates between -1 and 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      mouseX.set(x)
      mouseY.set(y)
    }

    const handleMouseLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [mouseX, mouseY])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Simple fallback rendering loop if full shader compilation fails locally
    let animationFrameId
    const render = () => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        ...style 
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none' 
        }} 
      />
      <motion.div 
        title="Liquid Metal Logo"
        style={{
          width: '100%',
          height: '100%',
          maskImage: `url("${logo}")`,
          WebkitMaskImage: `url("${logo}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: liquidColor,
          x: springX.get() * 5,
          y: -springY.get() * 5,
          filter: `drop-shadow(0px 4px 20px ${liquidColor}80)`
        }}
      />
    </div>
  )
}