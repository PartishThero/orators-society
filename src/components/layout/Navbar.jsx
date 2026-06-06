// Navbar.jsx — fixed pill-style top navigation bar with GlassSurface & Liquid Metal Logo
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import GlassSurface from '../ui/GlassSurface'
import LiquidMetal from '../ui/LiquidMetal'
import logoAsset from '../../assets/logo.svg'
import { navLinks } from '../../data/navigation'
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const activeLinks = [...navLinks];
  if (isAdmin) {
    activeLinks.push({ label: 'ADMIN', to: '/admin', bg: '#2A4035', text: '#F7F5F0' });
  }

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
              {activeLinks.map(({ label, to, bg, text }) => (
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
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto z-50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined text-white text-[24px]">
                {isOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </GlassSurface>
      </motion.div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[90%] max-w-7xl mt-2 overflow-hidden pointer-events-auto md:hidden"
          >
            <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
              {activeLinks.map(({ label, to, bg, text }) => (
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