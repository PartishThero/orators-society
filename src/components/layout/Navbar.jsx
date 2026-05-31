// Navbar.jsx — fixed pill-style top navigation bar with GlassSurface & Liquid Metal Logo
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import GlassSurface from '../ui/GlassSurface'
import LiquidMetal from '../ui/LiquidMetal'
import logoAsset from '../../assets/logo.svg'
import { navLinks } from '../../data/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed inset-x-0 top-6 z-50 flex flex-col items-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="pointer-events-auto w-[90%] max-w-7xl"
      >
        <GlassSurface
          width="100%"
          height={72}
          borderRadius={999}
          distortionScale={-40}
          redOffset={0}
          greenOffset={3}
          blueOffset={6}
          brightness={18}
          blur={8}
          backgroundOpacity={0.08}
          saturation={0.3}
        >
          <div className="w-full h-full flex justify-between items-center pl-0 pr-6 sm:pr-8">
            {/* Logo Section */}
            <NavLink
              to="/"
              className="flex items-center gap-2 sm:gap-4 group cursor-pointer hover:scale-105 transition-all duration-400 ease-in-out"
            >
              {/* Logo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36">
                <LiquidMetal logo={logoAsset} liquidColor="#C5A872" />
              </div>
            </NavLink>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-8 items-center font-label-caps text-label-caps">
              {navLinks.map(({ label, to, bg, text }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="relative px-5 py-2 group"
                >
                  {({ isActive }) => (
                    <>
                      <span 
                        className={`relative z-10 transition-colors duration-400 ${isActive ? 'font-bold' : 'text-on-surface-variant group-hover:text-on-surface'}`}
                        style={isActive ? { color: text } : {}}
                      >
                        {label}
                      </span>
                      {isActive && (
                        <motion.div
                           layoutId="nav-pill"
                           className="absolute inset-0 z-0"
                           style={{ backgroundColor: bg, borderRadius: '9999px' }}
                           transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none"
              aria-label="Toggle Menu"
            >
              <motion.span
                animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-[1.5px] bg-white block"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-[1.5px] bg-white block"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-[1.5px] bg-white block"
              />
            </button>
          </div>
        </GlassSurface>
      </motion.div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-[90%] max-w-7xl mt-2 overflow-hidden pointer-events-auto md:hidden"
          >
            <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
              {navLinks.map(({ label, to, bg, text }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `block font-label-caps text-center text-sm py-3 px-6 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'font-bold bg-white/10' 
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? { color: text } : {}}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}