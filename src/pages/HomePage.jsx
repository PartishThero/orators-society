import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid'

const ArchiveModal = lazy(() => import('../components/ui/ArchiveModal'))
const RegistrationModal = lazy(() => import('../components/ui/RegistrationModal'))
import RecruitmentModal from '../components/ui/RecruitmentModal'
import { events as localEvents } from '../data/events'
import { philosophyData } from '../data/philosophy'
import { sectionVariants } from '../styles/theme'
import Masonry from '../components/sections/Masonry'
import { useData } from '../context/DataContext'

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [recruitModalOpen, setRecruitModalOpen] = useState(false)

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
      color1: "#2e4c74",
      color2: "#6D7A8D",
      color3: "#334a5d",
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
                  setTimeout(() => setRegisterModalOpen(true), 100);
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
                    img: 'motto.jpeg',
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
                  THE ART OF<br />
                  <em className="text-primary tracking-normal">UNSPOKEN</em>
                </h2>
              </div>
              <div className="pt-4 lg:pt-6 flex flex-col justify-start">
                <p className="font-body-md text-[1rem] md:text-[1.1rem] leading-relaxed text-white/70 max-w-md">
                  Welcome to the premier hub of expression and leadership. The Orators’ Society is the central engine for public speaking, specialized debate, and structural event execution. We build unignorable voices.
                </p>
                <button
                  onClick={() => setRecruitModalOpen(true)}
                  className="group mt-8 self-start flex items-center gap-3 px-7 py-3.5 rounded-full border border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all duration-400"
                >
                  <span className="font-label-caps text-[11px] tracking-[0.2em] uppercase text-primary group-hover:text-white transition-colors duration-400">
                    Join the Society
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-white transition-colors duration-400">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* ── 3. Our Foundations ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-24 md:py-32 border-t border-white/5">
          <ArchitecturalGrid />
          <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              OUR FOUNDATIONS
            </span>
            <h2 className="font-display-xl text-[clamp(3.5rem,5vw,5.5rem)] leading-[0.9] text-white uppercase tracking-tighter mb-16 max-w-4xl">
              MEET OUR CLUB COORDINATORS
            </h2>

            {/* Club Coordinators Masonry-like Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-32">
              {[
                {
                  name: "Dr. Noor Nigar",
                  role: "Club Coordinator",
                  desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
                  marginTop: "",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80"
                },
                {
                  name: "Fiza Farzeen",
                  role: "Club Coordinator",
                  desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
                  marginTop: "",
                  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80"
                }
              ].map((person, idx) => (
                <motion.div
                  key={`coord-${idx}`}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                  /* Note for height/width: Modify 'md:h-[450px]' for height or change the grid columns above for width */
                  className={`group relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0D0D0D] w-full aspect-[4/5] md:aspect-auto md:h-[450px] ${person.marginTop}`}
                >
                  <img
                    src={person.img}
                    alt={person.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end text-left z-10">
                    <h3 className="font-display-xl text-[1.8rem] md:text-[2.2rem] text-white uppercase leading-[1.1] tracking-tight mb-1">
                      {person.name}
                    </h3>
                    <span className="font-label-caps text-[10px] text-primary tracking-[0.2em] uppercase mb-0 block">
                      {person.role}
                    </span>
                    <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
                      <div className="overflow-hidden">
                        <p className="font-body-md text-[0.95rem] text-white/70 leading-relaxed pt-4">
                          {person.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <h2 className="font-display-xl text-[clamp(3.5rem,5vw,5.5rem)] leading-[0.9] text-white uppercase tracking-tighter mb-16 max-w-4xl">
              STRUCTURAL PILLARS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[
                {
                  title: "The Executive Core (OSC)",
                  text: "The primary strategic organ of the society. Oversees full event conceptualization, masterclasses, and executive administration."
                },
                {
                  title: "Specialized Sub-Committees",
                  text: "Dedicated expert domains hosting the elite Debating Society (Deb Soc) and Model United Nations (MUN) assemblies."
                },
                {
                  title: "Specialized Cores",
                  text: "The architectural spine of our brand, managing high-velocity design production and premium digital presence. (Public speaking is not mandatory for these creative/social roles!)"
                }
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                  className="group relative p-8 md:p-10 rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md hover:bg-white/[0.05] transition-colors duration-500 text-left flex flex-col justify-start"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:border-primary/50 transition-colors duration-500 bg-white/[0.02]">
                    <span className="font-label-caps text-[14px] text-primary">0{idx + 1}</span>
                  </div>
                  <h3 className="font-display-xl text-[1.4rem] md:text-[1.6rem] text-white uppercase leading-[1.1] tracking-tight mb-4">
                    {card.title}
                  </h3>
                  <p className="font-body-md text-[1rem] text-white/50 leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                    {card.text}
                  </p>
                </motion.div>
              ))}
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
                        <h3 className="font-display-xl text-[clamp(1.5rem,5vw,2.25rem)] text-white uppercase leading-[1.1] tracking-tight mb-0 truncate w-full block">
                          {event.title}
                        </h3>
                        <div className="grid grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
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

      <RecruitmentModal 
        isOpen={recruitModalOpen}
        onClose={() => setRecruitModalOpen(false)}
      />
    </PageLayout>
  )
}