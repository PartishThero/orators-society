import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, cloneElement } from 'react'
import { createPortal } from 'react-dom'

export default function BaseModal({ isOpen, onClose, item, children }) {
  const scrollRef = useRef(null)
  
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && item && (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative z-10 w-full h-[100dvh] sm:h-[90vh] sm:max-w-[95vw] md:max-w-[80vw] md:h-[80vh] bg-black rounded-none sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/5"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-white/50 hover:text-primary transition-colors duration-400 group flex items-center justify-center p-3 rounded-full hover:bg-white/5 bg-black/50 backdrop-blur-md min-w-[44px] min-h-[44px]"
            >
              <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-500">close</span>
            </button>

            {/* Left Column: Dedicated Poster Image */}
            <div className="w-full md:w-[35%] h-[200px] md:h-full relative overflow-hidden bg-black flex-shrink-0">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                src={item.img}
                alt={item.title || 'Modal background'}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-black" />
              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")', backgroundSize: '200px' }} />
            </div>

            {/* Right Column: Content Area */}
            <div className="w-full md:w-[65%] h-[calc(100%-200px)] md:h-full flex flex-col md:flex-row relative min-w-0 overflow-y-auto md:overflow-hidden">
              {cloneElement(children, { scrollRef })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
