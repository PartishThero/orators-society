// Navbar.jsx — fixed pill-style top navigation bar with GlassSurface & Liquid Metal Logo
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import GlassSurface from '../ui/GlassSurface'
import LiquidMetal from '../ui/LiquidMetal'
import logoAsset from '../../assets/logo.svg'
import { navLinks } from '../../data/navigation'

export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none">
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

            {/* Nav Links */}
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
          </div>
        </GlassSurface>
      </motion.div>
    </div>
  )
}