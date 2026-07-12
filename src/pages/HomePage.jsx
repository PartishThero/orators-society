import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid'
import ArchiveModal from '../components/ui/ArchiveModal'
import { events as localEvents } from '../data/events'
import { philosophyData } from '../data/philosophy'
import { sectionVariants } from '../styles/theme'
import Masonry from '../components/sections/Masonry'
import { useData } from '../context/DataContext'

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { events: eventsList } = useData()

  
  return (
    <PageLayout grainientProps={{
      color1: "#23426D",
      color2: "#C5A872",
      color3: "#E2E8F0",
      timeSpeed: 2.15
    }}>
      <ArchiveModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setTimeout(() => setSelectedEvent(null), 300); }} item={selectedEvent} />

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
              className="font-display-xl-mobile text-[clamp(2.2rem,10vw,4.5rem)] md:text-[clamp(4.5rem,8vw,7.5rem)] lg:text-display-xl uppercase text-on-surface text-center leading-[0.95] tracking-tighter"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            >
              <span className="block">SPEAK.</span>
              <span className="block bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary bg-clip-text text-transparent">
                DISRUPT.
              </span>
              <span className="block">CONVINCE.</span>
            </motion.h1>

            <motion.p
              className="font-quote-serif text-[18px] md:text-quote-serif italic leading-8 text-on-surface-variant max-w-[420px] text-center mt-2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            >
              The world is built by the words we dare to speak. Enter the arena of high-stakes rhetoric.
            </motion.p>
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
                <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,4vw,4.5rem)] leading-[1] uppercase text-white tracking-tighter">
                  THE ART OF<br/>
                  <em className="italic text-primary tracking-normal">UNSPOKEN</em>
                </h2>
              </div>
              <div className="pt-4 lg:pt-6 flex flex-col justify-start">
                <p className="font-body-md text-[1rem] md:text-[1.1rem] leading-relaxed text-white/70 max-w-md">
                  We are a collective of thinkers, disruptors, and orators dedicated to the craft of persuasive dialogue. In an era of noise, we prioritize the resonance of carefully constructed arguments.
                </p>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* ── 3. From the Archives (Gallery Wall) ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-24 md:py-32 border-t border-white/5">
          <ArchitecturalGrid />
          <div className="max-w-8xl w-full mx-auto relative z-10 flex flex-col justify-center items-center text-center h-full">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              FROM THE ARCHIVES
            </span>
            <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,6vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter mb-16 max-w-4xl">
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
                      <h3 className="font-display-xl-mobile text-[2rem] md:text-[2.25rem] text-white uppercase leading-[1.1] tracking-tight mb-0 truncate w-full block">
                        {event.title}
                      </h3>
                      <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
                        <div className="overflow-hidden">
                          <p className="font-quote-serif text-[1.1rem] italic text-white/80 mt-4 mb-6 line-clamp-2">
                            "{event.subtitle || event.synopsis}"
                          </p>
                          <button className="flex items-center gap-2 font-label-caps text-[10px] tracking-[0.15em] uppercase text-white hover:text-white/70 transition-colors">
                            View Session
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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