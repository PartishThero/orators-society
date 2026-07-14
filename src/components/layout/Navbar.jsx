// Navbar.jsx — fixed pill-style top navigation bar with GlassSurface & Liquid Metal Logo
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import GlassSurface from '../ui/GlassSurface'
import LiquidMetal from '../ui/LiquidMetal'
import logoAsset from '../../assets/logo.svg'
import { navLinks } from '../../data/navigation'
import { supabase, isSupabaseConfigured } from '../../utils/supabaseClient'
import RegistrationModal from '../ui/RegistrationModal'
import RecruitmentModal from '../ui/RecruitmentModal'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [recruitModalOpen, setRecruitModalOpen] = useState(false)
  
  const location = useLocation()
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    return !hasSeenWelcome && location.pathname === '/'
  })

  useEffect(() => {
    if (location.pathname !== '/' || sessionStorage.getItem('hasSeenWelcome')) {
      setShowWelcome(false)
      return
    }
    
    setShowWelcome(true)

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setShowWelcome(false)
        sessionStorage.setItem('hasSeenWelcome', 'true')
        window.removeEventListener('scroll', handleScroll)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

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
    <>
      {/* Top Left Welcome Pop-up */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.4, ease: 'easeIn' } }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="fixed top-6 left-6 z-[60] pointer-events-auto hidden md:block"
          >
            <GlassSurface
              width="max-content"
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
              <div className="px-6 h-full flex items-center justify-center">
                <p className="font-['Sora'] text-[11px] tracking-wide text-white/70">
                  Welcome to <span className="font-semibold text-white">Orators Society!</span>
                </p>
              </div>
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="flex items-center group cursor-pointer hover:scale-105 transition-all duration-400 ease-in-out"
            >
              {/* Logo */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
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

              {/* Recruitment Button */}
              <button
                onClick={() => setRecruitModalOpen(true)}
                className="relative px-5 py-2 group overflow-hidden rounded-full border border-[#C5A872]/30 hover:border-[#C5A872] transition-colors duration-400 bg-[#C5A872]/5 hover:bg-[#C5A872]/10"
              >
                <span className="relative z-10 text-[#C5A872] font-bold group-hover:text-white transition-colors duration-400">
                  RECRUIT
                </span>
              </button>
            </div>

            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden items-center justify-center w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors pointer-events-auto z-50 focus:outline-none"
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
                    `block font-label-caps text-center text-sm py-4 px-6 rounded-full transition-all duration-300 ${
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
              <button
                onClick={() => {
                  setIsOpen(false);
                  setRecruitModalOpen(true);
                }}
                className="block font-label-caps text-center text-sm py-4 px-6 rounded-full transition-all duration-300 font-bold text-[#C5A872] border border-[#C5A872]/30 hover:border-[#C5A872] bg-[#C5A872]/5 hover:bg-[#C5A872]/10"
              >
                RECRUIT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className="pointer-events-auto">
      <RecruitmentModal 
        isOpen={recruitModalOpen}
        onClose={() => setRecruitModalOpen(false)}
      />
    </div>
    </>
  )
}