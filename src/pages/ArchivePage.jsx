import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import SectionWrapper from '../components/layout/SectionWrapper'
import Masonry from '../components/sections/Masonry'
import TimelineSection from '../components/sections/TimelineSection'
import ArchiveModal from '../components/ui/ArchiveModal'
import ArchitecturalGrid from '../components/layout/ArchitecturalGrid'
import { events as localEvents } from '../data/events'
import { archiveTimelineEvents } from '../data/timeline'
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient'

export default function ArchivePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [eventsList, setEventsList] = useState(localEvents)
  const [timelineList, setTimelineList] = useState(archiveTimelineEvents)

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          const formatted = data.map(item => ({
            ...item,
            colSpan: item.col_span
          }));
          setEventsList(formatted);
        }
      } catch (err) {
        console.error('Failed to load events from Supabase, using local fallback:', err);
      }
    }

    async function loadTimeline() {
      try {
        const { data, error } = await supabase
          .from('archive_timeline')
          .select('*')
          .order('year', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setTimelineList(data);
        }
      } catch (err) {
        console.error('Failed to load timeline from Supabase, using local fallback:', err);
      }
    }

    loadEvents();
    loadTimeline();
  }, []);

  const sortedEvents = [...eventsList].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featuredEvent = sortedEvents[0] || localEvents[0];

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
            <h1 className="font-display-xl-mobile md:font-display-xl text-primary uppercase tracking-tighter font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary drop-shadow-[0_0_40px_rgba(243,205,147,0.3)]">
              ARCHIVE OF<br />VOICES
            </h1>
            <p className="font-label-caps text-[14px] md:text-[16px] text-on-surface-variant tracking-widest mt-4 opacity-70">
              <span className="text-secondary">&lt;</span> Every argument leaves an echo. <span className="text-secondary">&gt;</span>
            </p>
          </motion.div>
        </SectionWrapper>

        {/* ── 2. Featured Archive ── */}
        <SectionWrapper className="py-16 md:py-24 px-[clamp(1.5rem,7vw,10rem)] relative z-10">
          <ArchitecturalGrid />
          <div className="flex flex-col items-center text-center mb-8 md:mb-16">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-3 md:mb-6 block font-semibold">
              FEATURED SESSION
            </span>
            <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,5vw,5.5rem)] leading-[0.9] text-white uppercase tracking-tighter">
              THE LATEST DISCOURSE
            </h2>
          </div>

          <motion.div
            className="glass-panel rounded-xl overflow-hidden group cursor-pointer relative h-[380px] sm:h-[480px] md:h-[600px] flex flex-col justify-end border border-outline-variant/20"
            onClick={() => {
              setSelectedItem(featuredEvent)
              setModalOpen(true)
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 z-0 bg-[#0D0D0D] overflow-hidden">
              <motion.img
                alt={featuredEvent.title}
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-transform duration-1000 ease-out"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
                src={featuredEvent.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-10 md:p-16 flex flex-col justify-end h-full w-full md:w-2/3">
              <div className="flex items-center gap-4 mb-3 md:mb-6">
                <span className="font-label-caps text-secondary tracking-[0.2em] uppercase font-semibold">
                  LATEST SESSION
                </span>
                <span className="font-label-caps text-on-surface-variant">
                  {new Date(featuredEvent.date).getFullYear()}
                </span>
              </div>
              <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] md:text-[64px] font-display-xl-mobile text-on-surface mb-3 md:mb-6 leading-none group-hover:translate-x-2 transition-transform duration-500 uppercase tracking-tighter">
                {featuredEvent.title}
              </h2>
              <p className="font-quote-serif text-on-surface-variant italic max-w-md text-sm md:text-base">
                "{featuredEvent.subtitle}"
              </p>
            </div>

            <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-10 w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-400">
              <span className="material-symbols-outlined text-primary text-xl md:text-3xl">play_arrow</span>
            </div>
          </motion.div>
        </SectionWrapper>

        {/* ── 3. Discourse Catalog Masonry ── */}
        <SectionWrapper className="px-[clamp(1.5rem,7vw,10rem)] relative z-10">
          <ArchitecturalGrid />
          <div className="mb-12 md:mb-24 flex flex-col items-center text-center relative z-20">
            <span className="font-label-caps text-[12px] tracking-[0.3em] uppercase text-primary mb-3 md:mb-6 block font-semibold">
              THE VAULT
            </span>
            <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,5vw,6rem)] leading-[0.9] text-white uppercase tracking-tighter px-4 md:px-8 pb-2 md:pb-4 relative z-10 drop-shadow-[0_0_20px_rgba(5,8,15,0.8)]">
              DISCOURSE CATALOG
            </h2>
            <p className="max-w-2xl text-on-surface-variant font-body-md px-4 relative z-10 drop-shadow-[0_0_15px_rgba(5,8,15,0.8)] text-sm md:text-base">
              A curated archive of memorable arguments, archived for curious minds and restless rhetoricians.
            </p>
          </div>

          <Masonry
            items={eventsList}
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

      <ArchiveModal isOpen={modalOpen} onClose={() => setModalOpen(false)} item={selectedItem} />
    </PageLayout>
  )
}
