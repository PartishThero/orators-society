import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'
import Masonry from '../components/sections/Masonry'
import TimelineSection from '../components/sections/TimelineSection'
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid'
import { events as localEvents } from '../data/events'
import { archiveTimelineEvents } from '../data/timeline'
import { useData } from '../context/DataContext'

const ArchiveModal = lazy(() => import('../components/ui/ArchiveModal'))
const RegistrationModal = lazy(() => import('../components/ui/RegistrationModal'))

export default function ArchivePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [registerItem, setRegisterItem] = useState(null)
  const [returnToArchive, setReturnToArchive] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All Events')
  const { events: eventsList, archiveTimeline: timelineList } = useData()

  return (
    <PageLayout grainientProps={{
      color1: "#1A2A40",
      color2: "#6D7A8D",
      color3: "#C5A872",
      timeSpeed: 2.15
    }}>
      <main className="pb-[10rem] relative flex-grow">

        {/* ── 1. Hero ── */}
        <SectionWrapper className="items-center justify-center text-center px-[clamp(1.5rem,7vw,10rem)]">
          <div className="absolute top-1/2 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent to-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
          <motion.div
            className="max-w-6xl mx-auto z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          >
            <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase">
              THE CHRONICLE OF DISCOURSE
            </span>
            <h1 className="font-display-xl text-primary uppercase tracking-tighter font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary drop-shadow-[0_0_40px_rgba(243,205,147,0.3)]">
              ARCHIVE OF<br />VOICES
            </h1>
            <p className="font-label-caps text-[14px] md:text-[16px] text-on-surface-variant tracking-widest mt-4 opacity-70">
              <span className="text-secondary">&lt;</span> Every argument leaves an echo. <span className="text-secondary">&gt;</span>
            </p>
          </motion.div>
        </SectionWrapper>


        {/* ── 3. Discourse Catalog Masonry ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] relative z-10">
          <ArchitecturalGrid />
          <div className="mb-12 md:mb-24 flex flex-col items-center text-center relative z-20">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-3 md:mb-6 block font-semibold">
              THE VAULT
            </span>
            <h2 className="font-display-xl text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter px-4 md:px-8 pb-2 md:pb-4 relative z-10 drop-shadow-[0_0_20px_rgba(5,8,15,0.8)]">
              DISCOURSE CATALOG
            </h2>
            <p className="max-w-2xl text-on-surface-variant font-body-md px-4 relative z-10 drop-shadow-[0_0_15px_rgba(5,8,15,0.8)] text-sm md:text-base">
              A curated archive of memorable arguments, archived for curious minds and restless rhetoricians.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12 relative z-20">
            {['All Events', 'Upcoming', 'Live'].map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setActiveFilter(filterOption)}
                className={`relative px-6 py-2.5 rounded-full text-[12px] font-label-caps uppercase tracking-wider transition-all duration-300 ${
                  activeFilter === filterOption
                    ? 'text-black font-semibold'
                    : 'text-white/60 hover:text-white bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                {filterOption}
                {activeFilter === filterOption && (
                  <motion.div
                    layoutId="archiveFilter"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <Masonry
            items={
              activeFilter === 'All Events' 
                ? eventsList 
                : eventsList.filter(e => (e.status || 'past').toLowerCase() === activeFilter.toLowerCase())
            }
            ease="power3.out"
            duration={0.75}
            stagger={0.06}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.96}
            blurToFocus={true}
            colorShiftOnHover={false}
            onItemClick={useCallback(item => {
              setSelectedItem(item)
              setModalOpen(true)
            }, [])}
            onRegisterClick={useCallback(item => {
              setReturnToArchive(false)
              setRegisterItem(item)
              setRegisterModalOpen(true)
            }, [])}
          />
        </SectionWrapper>

        {/* ── 4. Continuum Timeline ── */}
        <SectionWrapper className="relative z-10 py-16 md:py-24">
          <ArchitecturalGrid />
          <h3 className="font-headline-lg-mobile text-on-surface mb-6 md:mb-12 px-[clamp(1.5rem,7vw,10rem)] uppercase text-center">
            THE CONTINUUM
          </h3>
          <TimelineSection items={timelineList} />
        </SectionWrapper>

      </main>

      <Suspense fallback={null}>
        <ArchiveModal 
          isOpen={modalOpen} 
          onClose={() => { setModalOpen(false); setTimeout(() => setSelectedItem(null), 300); }} 
          item={selectedItem} 
          onRegister={() => {
            setReturnToArchive(true)
            setRegisterItem(selectedItem)
            setModalOpen(false)
            setTimeout(() => setRegisterModalOpen(true), 300)
          }}
        />
        <RegistrationModal 
          isOpen={registerModalOpen} 
          onClose={() => { 
            setRegisterModalOpen(false);
            if (returnToArchive && registerItem) {
              setSelectedItem(registerItem);
              setTimeout(() => {
                setModalOpen(true);
                setReturnToArchive(false);
              }, 300);
            } else {
              setTimeout(() => setRegisterItem(null), 300); 
            }
          }} 
          eventItem={registerItem} 
        />
      </Suspense>
    </PageLayout>
  )
}
