// AmbientGlows.jsx — decorative fixed background glow orbs
// Used on pages with the dark cinematic atmosphere.

import { motion } from 'framer-motion'

export default function AmbientGlows() {
  return (
    <>
      <motion.div
        className="fixed top-0 left-1/4 w-[40vw] h-[40vw] bg-secondary-container/20 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen"
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ x: [0, 12, 0], y: [0, -24, 0], opacity: 0.75 }}
        transition={{
          x: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 1.4, delay: 0.6, ease: 'easeOut' },
        }}
      />
      <motion.div
        className="fixed bottom-0 right-1/4 w-[50vw] h-[50vw] bg-primary-container/10 rounded-full blur-[180px] -z-10 pointer-events-none mix-blend-screen"
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ x: [0, -18, 0], y: [12, -14, 12], opacity: 0.8 }}
        transition={{
          x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 1.4, delay: 0.6, ease: 'easeOut' },
        }}
      />
    </>
  )
}
