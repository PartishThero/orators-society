import { useState, lazy, Suspense, useCallback } from 'react'
import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'

import HorizontalCatalog from '../components/sections/HorizontalCatalog'
import TimelineSection from '../components/sections/TimelineSection'
const LegacyModal = lazy(() => import('../components/ui/LegacyModal'))
import { spotlightData } from '../data/spotlight'
import { useData } from '../context/DataContext'
import { MasonrySkeleton, TimelineSkeleton } from '../components/ui/Skeleton'

const governingCore = [
  { name: "Shrest Sharma", role: "Society President", desc: "Powered entirely by late-night poetry sessions, pure eloquence, and the absolute conviction to over-explain any simple point.", img: "/Cores/shresht.jpeg" },
  { name: "Avishkar Wagh", role: "Society Secretary", desc: "The Secretary ensures that vision translates into action — through clear communication and consistent follow-through.", img: "/Cores/avishkar.jpeg" },
  { name: "Sneha Agarwal", role: "Club core", desc: "Empowering voices through impactful events while keeping the numbers in check", img: "/Cores/sneha%20aggarwal.jpeg" },
  { name: "Sneha Raj", role: "Club Core", desc: "Wise men speak because they have something to say; fools because they have to say something. - Plato", img: "/Cores/sneha.jpeg" },
  { name: "Smit Rupani", role: "Club Core", desc: "I look forward fo interacting with people and finding ways of collaborating whether as teammates or fellow debaters.", img: "/Cores/smit.jpeg" },
  { name: "Koushik", role: "Creative Core", desc: "A driven and creative person who loves taking initiative, leading from the front, and constantly pushing himself to grow.", img: "/Cores/kaushik.jpeg" },
  { name: "Samadrita", role: "Social Core", desc: "⁠Connecting people through stories.", img: "/Cores/samadrita.jpeg" },
];

const foundationalPillar = [
  { name: "Sai Sevithaa", role: "Founding Core Member", desc: "A visionary founder who laid the groundwork for the society's culture and debate formats.", img: "/Cores/sai%20saveta.jpeg" },
  { name: "Kushal S.", role: "Founding Core Member", desc: "Instrumental in establishing the core principles and initial outreach strategies of the society.", img: "/Cores/kushal.jpeg" },
  { name: "Tanishka Mangure", role: "Founding Core Member", desc: "Pioneered the early event structures and fostered a community of passionate debaters.", img: "/Cores/tanishka.jpeg" }
];
export default function LegacyPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const { legacyEvents: legacyList, legacyTimeline: timelineList, loading } = useData()

  const handleItemClick = useCallback(item => {
    setSelectedItem(item)
    setModalOpen(true)
  }, [])

  return (
    <PageLayout grainientProps={{
color1: "#1A2A40", // Navy Blue anchor
      color2: "#C5A872", // Deep Gold
      color3: "#cdcd65", // Bright Gold
      timeSpeed: 2.15
    }}>
      <main className="flex-grow">
        {/* ── 1. Hero ── */}
        <SectionWrapper className="items-center text-center px-[clamp(1.5rem,7vw,10rem)] py-20">
          <motion.div
            className="max-w-6xl mx-auto z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          >
            <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase">
              The Archive of Impact
            </span>
            <h1 className="font-display-xl text-primary uppercase tracking-tighter font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary drop-shadow-[0_0_40px_rgba(243,205,147,0.3)]">
              THE VOICES<br />THAT REMAIN
            </h1>
            <p className="font-label-caps text-[14px] md:text-[16px] text-on-surface-variant tracking-widest mt-4 opacity-70">
              <span className="text-secondary">&lt;</span> Some arguments outlive the room.{' '}
              <span className="text-secondary">&gt;</span>
            </p>
          </motion.div>
        </SectionWrapper>

        {/* ── 1.5. Core Members ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-16 md:py-32 border-t border-white/5">

          <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center text-center">
            
            {/* Governing Executive Core */}
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              THE LEADERSHIP
            </span>
            <h2 className="font-display-xl text-[clamp(2.5rem,4vw,4.5rem)] leading-[0.9] text-white uppercase tracking-tighter mb-16 max-w-4xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              THE GOVERNING EXECUTIVE CORE
            </h2>
            
            <div className="flex flex-wrap justify-center gap-8 w-full mb-32">
              {governingCore.map((person, idx) => (
                <motion.div
                  key={`gov-${idx}`}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                  className="@container group relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0D0D0D] w-full md:w-[calc(33.333%-1.35rem)] lg:w-[calc(25%-1.5rem)] aspect-[4/5] md:aspect-auto md:min-h-[400px]"
                >
                  <img
                    src={person.img}
                    alt={person.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-6 @sm:p-8 flex flex-col justify-end text-left z-10">
                    <h3 className="font-display-xl text-[1.4rem] @sm:text-[1.8rem] text-white uppercase leading-[1.1] tracking-tight mb-1">
                      {person.name}
                    </h3>
                    <span className="font-label-caps text-[9px] text-primary tracking-[0.2em] uppercase mb-0 block">
                      {person.role}
                    </span>
                    <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
                      <div className="overflow-hidden">
                        <p className="font-body-md text-[0.85rem] text-white/70 leading-relaxed pt-3">
                          {person.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Foundational Pillar */}
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold mt-16">
              THE ARCHITECTS
            </span>
            <h2 className="font-display-xl text-[clamp(2.5rem,4vw,4.5rem)] leading-[0.9] text-white uppercase tracking-tighter mb-4 max-w-4xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              THE FOUNDATIONAL PILLAR
            </h2>
            <p className="font-body-md text-[1rem] md:text-[1.1rem] text-white/60 max-w-2xl mb-16 leading-relaxed">
              The architectural spine that laid down the initial charter, structural parameters, and institutional standards of the Orators' Society.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
              {foundationalPillar.map((person, idx) => (
                <motion.div
                  key={`found-${idx}`}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                  className="@container group relative rounded-[2rem] overflow-hidden border border-white/5 bg-[#0D0D0D] w-full aspect-[4/5] md:aspect-auto md:min-h-[450px]"
                >
                  <img
                    src={person.img}
                    alt={person.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-6 @sm:p-8 flex flex-col justify-end text-left z-10">
                    <h3 className="font-display-xl text-[1.6rem] @sm:text-[2.2rem] text-white uppercase leading-[1.1] tracking-tight mb-1">
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

          </div>
        </SectionWrapper>

        {/* ── 2. Hall of Voices ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-24 md:py-32 border-t border-white/5">

          <div className="max-w-7xl mx-auto relative z-10 w-full">
            <div className="mb-24 flex flex-col items-center text-center relative z-20">
              <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
                01 / EST. 2018
              </span>
              <h2 className="font-display-xl text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                HALL OF VOICES
              </h2>
            </div>

            {loading.legacyEvents ? (
            <MasonrySkeleton />
          ) : (
            <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
              <HorizontalCatalog
                items={legacyList}
                onItemClick={handleItemClick}
              />
            </div>
          )}
          </div>
        </SectionWrapper>

        {/* ── 3. Legacy Timeline ── */}
        <SectionWrapper className="border-y border-white/10 py-24 md:py-32">

          <div className="mb-24 flex flex-col items-center text-center relative z-20">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              THE CONTINUUM
            </span>
            <h2 className="font-display-xl text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter px-8 pb-4 relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              LEGACY TIMELINE
            </h2>
          </div>
          {loading.legacyTimeline ? (
            <TimelineSkeleton />
          ) : (
            <TimelineSection items={timelineList} />
          )}
        </SectionWrapper>

        {/* ── 4. Spotlight Section ── */}
        <SectionWrapper className="py-24">

          <div className="max-w-7xl mx-auto px-[clamp(1.5rem,7vw,10rem)] w-full relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1">
              <span className="font-label-caps text-[12px] tracking-[0.2em] text-primary uppercase block mb-8 font-semibold">
                {spotlightData.legacy.tag}
              </span>
              <h3 className="font-display-xl text-[clamp(3rem,4vw,4rem)] text-white uppercase leading-[0.9] tracking-tighter mb-8">
                {spotlightData.legacy.heading}<br/>
                <em className="text-primary italic font-normal tracking-normal">{spotlightData.legacy.highlight}</em>
              </h3>
            </div>
            
            <div className="flex-1 relative">
              <span className="absolute -top-12 -left-8 text-[8rem] text-white/5 font-quote-serif leading-none select-none">"</span>
              <p className="font-quote-serif text-[clamp(1.5rem,2.5vw,2rem)] text-white/90 italic leading-[1.3] relative z-10 mb-8 pl-8 border-l border-primary/30">
                {spotlightData.legacy.quote}
              </p>
              <div className="pl-8 flex items-center gap-4">
                <div className="w-12 h-[1px] bg-white/20" />
                <div className="flex flex-col">
                  <span className="font-label-caps text-[12px] tracking-widest text-primary uppercase">{spotlightData.legacy.author}</span>
                  <span className="font-label-caps text-[9px] tracking-wider text-white/40 uppercase mt-1">{spotlightData.legacy.authorTitle}</span>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </main>

      <Suspense fallback={null}>
        <LegacyModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setTimeout(() => setSelectedItem(null), 300); }} item={selectedItem} />
      </Suspense>
    </PageLayout>
  )
}
