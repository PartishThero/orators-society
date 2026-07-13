import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid'

const ArchiveModal = lazy(() => import('../components/ui/ArchiveModal'))
const RegistrationModal = lazy(() => import('../components/ui/RegistrationModal'))
import { events as localEvents } from '../data/events'
import { philosophyData } from '../data/philosophy'
import { sectionVariants } from '../styles/theme'
import Masonry from '../components/sections/Masonry'
import { useData } from '../context/DataContext'

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  const [promoOpen, setPromoOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  
  const { events: eventsList } = useData()

  const promoEvent = useMemo(() => {
    if (!eventsList || eventsList.length === 0) return null;
    return eventsList.find(e => (e.status || 'past').toLowerCase() === 'live') 
        || eventsList.find(e => (e.status || 'past').toLowerCase() === 'upcoming') 
        || eventsList[0];
  }, [eventsList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasDismissed = sessionStorage.getItem('promo_dismissed');
      if (!hasDismissed && promoEvent) {
        setPromoOpen(true);
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [promoEvent])

  
  return (
    <PageLayout grainientProps={{
      color1: "#23426D",
      color2: "#C5A872",
      color3: "#E2E8F0",
      timeSpeed: 2.15
    }}>
      <Suspense fallback={null}>
        <ArchiveModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setTimeout(() => setSelectedEvent(null), 300); }} item={selectedEvent} />
        
        <RegistrationModal 
          isOpen={registerModalOpen} 
          onClose={() => setRegisterModalOpen(false)} 
          eventItem={promoEvent} 
        />
      </Suspense>

      <AnimatePresence>
        {promoOpen && promoEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[9000] w-[380px] max-w-[calc(100vw-3rem)] bg-[#0E1117]/60 backdrop-blur-2xl border border-white/[0.08] rounded-[1.5rem] shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Poster strip */}
            <div className="relative h-[140px] overflow-hidden">
              <img src={promoEvent.img} alt={promoEvent.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117]/90 via-[#0E1117]/40 to-transparent" />
              <button 
                onClick={() => {
                  setPromoOpen(false);
                  sessionStorage.setItem('promo_dismissed', 'true');
                }}
                className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5 pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-label-caps text-[9px] text-white/40 tracking-[0.2em] uppercase">
                  {promoEvent.date}
                </span>
                <span className="bg-secondary border-primary/30 text-tertiary px-3 rounded-full font-label-caps text-[8px] uppercase tracking-[0.2em]">
                  {promoEvent.status === 'live' ? '● Live Now' : 'Upcoming'}
                </span>
              </div>
              <h4 className="font-display-xl text-[1.15rem] text-white uppercase leading-[1.15] tracking-tight mb-4 line-clamp-2">
                {promoEvent.title}
              </h4>
              
              <button 
                onClick={() => {
                  setPromoOpen(false);
                  sessionStorage.setItem('promo_dismissed', 'true');
                  setTimeout(() => setRegisterModalOpen(true), 300);
                }}
                style={{ borderRadius: '9999px' }}
                className="group relative w-full font-label-caps tracking-[0.2em] text-[10px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/5 px-6 py-3 hover:bg-white/[0.08]"
              >
                <span className="w-6 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-10 transition-all duration-400" />
                Register Now
                <span className="material-symbols-outlined text-[14px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* ── 1. Hero ── */}
        <SectionWrapper className="items-center text-center px-[clamp(1.5rem,7vw,10rem)] py-16 md:py-20">
          <div className="absolute top-1/2 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent to-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
          <motion.div
            className="max-w-7xl w-full mx-auto z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
          >
            <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase">
              ESTABLISHED MMXXVI
            </span>

            <motion.h1
              className="font-display-xl text-[clamp(4.5rem,8vw,7.5rem)] lg:text-display-xl uppercase text-on-surface text-center leading-[0.95] tracking-tighter"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            >
              <span className="block">TALK.</span>
              <span className="block bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary bg-clip-text text-transparent">
                INSPIRE.
              </span>
              <span className="block">TRANSFORM.</span>
            </motion.h1>
          </motion.div>
        </SectionWrapper>

        {/* ── 2. Philosophy (Architectural Grid) ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-20 md:py-32">
          <ArchitecturalGrid showHorizontal={true} />
          <div className="absolute top-1/2 left-1/2 w-[1px] h-4 bg-white/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden lg:block z-10" />
          <div className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-white/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden lg:block z-10" />

          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 relative z-10 gap-12 lg:gap-0">
            <div className="relative pr-0 lg:pr-20 w-full max-w-md mx-auto lg:ml-auto pb-6 lg:pb-0 z-20">
              <Masonry
                items={[
                  {
                    id: 'philosophy-img',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKLcZnxXtiUpym29nbZcmcGIRFzPBzTboLmcn70G0q-i7-76jQg8VyHbtyQ0IysutbAlW2RGS0Yj47hopUhV3mj-Y7pQv8rapayb-e2C7V46W5h1XoBaMVTQUsliV4qgUUHehJ9Owtkx_lTMEn6dUthO2kE-A5yszgD0wkQKwXlyNSme9b3UyQdUKvwI88OzpY3OhKkc8N5xM2xrMWYVLe0azNdv23MrQwLqjkKTN5EQRNs6rtXJbzs82rorTDhpTeYhzoOu7Mtp0',
                    colSpan: 5
                  }
                ]}
                stagger={0}
                animateFrom="bottom"
                scaleOnHover={true}
                hoverScale={0.97}
                blurToFocus={true}
                colorShiftOnHover={false}
              />
            </div>

            <div className="relative pl-0 lg:pl-20 flex flex-col justify-center gap-6 lg:gap-8 z-20">
              <div className="pb-4 lg:pb-6 flex flex-col justify-end">
                <span className="font-label-caps text-[10px] text-white/90 uppercase tracking-[0.4em] block mb-4 lg:mb-6">OUR PHILOSOPHY</span>
                <h2 className="font-display-xl text-[clamp(3.5rem,4vw,4.5rem)] leading-[1] uppercase text-white tracking-tighter">
                  THE ART OF<br/>
                  <em className="text-primary tracking-normal">UNSPOKEN</em>
                </h2>
              </div>
              <div className="pt-4 lg:pt-6 flex flex-col justify-start">
                <p className="font-body-md text-[1rem] md:text-[1.1rem] leading-relaxed text-white/70 max-w-md">
                  Welcome to the premier hub of expression and leadership. The Orators’ Society is the central engine for public speaking, specialized debate, and structural event execution. We build unignorable voices.
                </p>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* ── 3. The Founders ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-24 md:py-32 border-t border-white/5">
          <ArchitecturalGrid />
          <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              THE ARCHITECTS
            </span>
            <h2 className="font-display-xl text-[clamp(3.5rem,6vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter mb-6 max-w-4xl">
              OUR FOUNDERS
            </h2>
            <p className="font-body-md text-[1rem] md:text-[1.05rem] text-white/50 max-w-lg mb-20 leading-relaxed">
              The voices who laid the foundation. The minds who built the arena.
            </p>

            {/* Core Founders — 3 centered cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-24 w-full">
              {coreFounders.map((founder, idx) => (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                  className="group relative w-[280px] rounded-[2rem] overflow-hidden border border-white/5 bg-[#0D0D0D]"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={founder.img} 
                      alt={founder.name} 
                      loading="lazy" 
                      className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-50 group-hover:opacity-80 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    <span className="font-label-caps text-[9px] text-primary tracking-[0.2em] uppercase mb-2 block">
                      {founder.role}
                    </span>
                    <h3 className="font-display-xl text-[1.4rem] text-white uppercase leading-[1.1] tracking-tight">
                      {founder.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Other Members — horizontal scroll strip */}
            <div className="w-full">
              <span className="font-label-caps text-[10px] text-white/40 tracking-[0.2em] uppercase block mb-6">
                The Extended Council
              </span>
              <div className="relative w-full">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050810] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050810] to-transparent z-10 pointer-events-none" />
                
                <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar px-4">
                  {otherMembers.map((member, idx) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                      className="group flex-shrink-0 w-[200px] rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0A] hover:border-white/10 transition-colors duration-500"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={member.img} 
                          alt={member.name} 
                          loading="lazy" 
                          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:opacity-70 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                      </div>
                      <div className="p-4 pt-2">
                        <h4 className="font-display-xl text-[0.9rem] text-white uppercase leading-[1.2] tracking-tight mb-1">
                          {member.name}
                        </h4>
                        <span className="font-label-caps text-[8px] text-white/40 tracking-[0.15em] uppercase">
                          {member.role}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* ── 4. From the Archives (Gallery Wall) ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-24 md:py-32 border-t border-white/5">
          <ArchitecturalGrid />
          <div className="max-w-8xl w-full mx-auto relative z-10 flex flex-col justify-center items-center text-center h-full">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              FROM THE ARCHIVES
            </span>
            <h2 className="font-display-xl text-[clamp(3.5rem,6vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter mb-16 max-w-4xl">
              A PRESERVED HISTORY
            </h2>

            <div className="flex flex-wrap justify-center gap-8 w-full mb-20">
              {[...eventsList]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3)
                .map((event, idx) => (
                <motion.div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setModalOpen(true)
                  }}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                  className="group relative rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 bg-[#0D0D0D] w-full max-w-[500px] aspect-square md:w-[500px] md:h-[500px]"
                >
                  <img src={event.img} alt={event.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:opacity-60 group-hover:scale-105 group-hover:mix-blend-normal transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-10">
                    <div>
                      <span className="font-label-caps text-[10px] text-primary tracking-[0.2em] uppercase mb-3 block group-hover:text-white/80 transition-colors duration-500">
                        {event.date}
                      </span>
                      <h3 className="font-display-xl text-[2.25rem] text-white uppercase leading-[1.1] tracking-tight mb-0 truncate w-full block">
                        {event.title}
                      </h3>
                      <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
                        <div className="overflow-hidden">
                          <p className="font-quote-serif text-[1.1rem] italic text-white/80 mt-4 mb-6 line-clamp-2">
                            "{event.subtitle || event.synopsis}"
                          </p>
                          <button className="flex items-center gap-2 font-label-caps text-[10px] tracking-[0.15em] uppercase text-white hover:text-white/70 transition-colors">
                            View Session
                            <span className="material-symbols-outlined text-[5px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/archive" style={{ borderRadius: '9999px' }} className="group relative font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08]">
              <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
              Explore Full Archive
              <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">open_in_new</span>
            </Link>
          </div>
        </SectionWrapper>
      </main>
    </PageLayout>
  )
}