import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid'
import Masonry from '../components/sections/Masonry'
import TimelineSection from '../components/sections/TimelineSection'
import LegacyModal from '../components/ui/LegacyModal'
import { legacyItems } from '../data/legacy'
import { legacyTimelineEvents } from '../data/timeline'
import { spotlightData } from '../data/spotlight'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'

export default function LegacyPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [legacyList, setLegacyList] = useState(legacyItems)
  const [timelineList, setTimelineList] = useState(legacyTimelineEvents)

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    async function loadLegacy() {
      try {
        const { data, error } = await supabase
          .from('legacy_events')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          const formatted = data.map(item => ({
            ...item,
            colSpan: item.col_span
          }));
          setLegacyList(formatted);
        }
      } catch (err) {
        console.error('Failed to load legacy events from Supabase, using local fallback:', err);
      }
    }

    async function loadTimeline() {
      try {
        const { data, error } = await supabase
          .from('legacy_timeline')
          .select('*')
          .order('year', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setTimelineList(data);
        }
      } catch (err) {
        console.error('Failed to load legacy timeline from Supabase, using local fallback:', err);
      }
    }

    loadLegacy();
    loadTimeline();
  }, []);

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
          <div className="absolute top-1/2 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent to-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />

          <motion.div
            className="max-w-6xl mx-auto z-10 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          >
            <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase">
              The Archive of Impact
            </span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-primary uppercase tracking-tighter font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary drop-shadow-[0_0_40px_rgba(243,205,147,0.3)]">
              THE VOICES<br />THAT REMAIN
            </h1>
            <p className="font-label-caps text-[14px] md:text-[16px] text-on-surface-variant tracking-widest mt-4 opacity-70">
              <span className="text-secondary">&lt;</span> Some arguments outlive the room.{' '}
              <span className="text-secondary">&gt;</span>
            </p>
          </motion.div>
        </SectionWrapper>

        {/* ── 2. Hall of Voices ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] py-24 md:py-32 border-t border-white/5">
          <ArchitecturalGrid />
          <div className="max-w-7xl mx-auto relative z-10 w-full">
            <div className="mb-24 flex flex-col items-center text-center relative z-20">
              <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
                01 / EST. 2018
              </span>
              <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                HALL OF VOICES
              </h2>
            </div>

            <Masonry
              items={legacyList}
              ease="power3.out"
              duration={0.75}
              stagger={0.06}
              animateFrom="bottom"
              scaleOnHover={true}
              hoverScale={0.96}
              blurToFocus={true}
              colorShiftOnHover={false}
              onItemClick={item => {
                setSelectedItem(item)
                setModalOpen(true)
              }}
            />
          </div>
        </SectionWrapper>

        {/* ── 3. Legacy Timeline ── */}
        <SectionWrapper className="border-y border-white/10 py-24 md:py-32">
          <ArchitecturalGrid />
          <div className="mb-24 flex flex-col items-center text-center relative z-20">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-6 block font-semibold">
              THE CONTINUUM
            </span>
            <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter px-8 pb-4 relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              LEGACY TIMELINE
            </h2>
          </div>
          <TimelineSection items={timelineList} />
        </SectionWrapper>

        {/* ── 4. Spotlight Section ── */}
        <SectionWrapper className="py-24">
          <ArchitecturalGrid />
          <div className="max-w-7xl mx-auto px-[clamp(1.5rem,7vw,10rem)] w-full relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1">
              <span className="font-label-caps text-[12px] tracking-[0.2em] text-primary uppercase block mb-8 font-semibold">
                {spotlightData.legacy.tag}
              </span>
              <h3 className="font-display-xl-mobile md:text-[clamp(3rem,4vw,4rem)] text-white uppercase leading-[0.9] tracking-tighter mb-8">
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

      <LegacyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} item={selectedItem} />
    </PageLayout>
  )
}
