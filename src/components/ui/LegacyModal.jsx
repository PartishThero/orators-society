import { motion } from 'framer-motion'
import BaseModal from './BaseModal'

export default function LegacyModal({ isOpen, onClose, item }) {
  if (typeof document === 'undefined') return null

  const mockExpertise = item?.themes || ['Rhetorical Theory', 'Policy Debate', 'Public Philosophy', 'Advocacy']
  const mockGallery = item?.gallery || [
    'https://picsum.photos/id/1025/400/300?grayscale',
    'https://picsum.photos/id/1035/400/300?grayscale',
    'https://picsum.photos/id/1005/400/300?grayscale',
    'https://picsum.photos/id/1041/400/300?grayscale'
  ]

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} item={item}>
      <LegacyModalContent item={item} mockExpertise={mockExpertise} mockGallery={mockGallery} />
    </BaseModal>
  )
}

function LegacyModalContent({ item, mockExpertise, mockGallery, scrollRef }) {
  return (
    <>
      <div 
        ref={scrollRef}
        data-lenis-prevent
        className="w-full md:w-[75%] h-auto md:h-full overflow-visible md:overflow-y-auto hide-scrollbar flex flex-col relative pt-12 md:pt-24 px-8 md:px-16"
      >
        <div className="max-w-2xl pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-1 mb-8"
          >
            <span className="font-label-caps text-primary/80 tracking-[0.3em] text-[10px] uppercase">
              {item.date?.split(',')[1]?.trim() || ''}
            </span>
            <span className="font-label-caps text-white/50 tracking-[0.2em] text-[12px] uppercase">
              Society Ambassador
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display-xl text-[clamp(3rem,4.5vw,5rem)] leading-[0.9] text-white uppercase tracking-tighter mb-8"
          >
            {item.title}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="font-quote-serif text-[1.5rem] md:text-[2rem] leading-[1.1] text-primary italic mb-12 border-l-2 border-primary/30 pl-6"
          >
            "{item.subtitle}"
          </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
            className="font-body-md text-white/70 text-[1.05rem] leading-[1.8] space-y-6 mb-16"
          >
            <p>
              {item.bio || `Representing our college at the ${item.location || 'external tournament'}, ${item.title} delivered an outstanding performance against top-tier competitive circuits.`}
            </p>
            <p>
              Their presence marked a significant milestone for our society's outreach, demonstrating the strength of our rhetorical training on a broader stage.
            </p>
            <p>
              The experience gained from this representation continues to enrich our internal practices, setting a high benchmark for future delegations.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-16">
            <div className="flex flex-wrap gap-3">
              {mockExpertise.map(theme => (
                <span key={theme} className="font-label-caps text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80">
                  {theme}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className="mb-16 p-8 md:p-10 rounded-2xl bg-black border border-white/5 shadow-inner">
            <h5 className="font-label-caps text-[10px] text-primary/70 tracking-[0.2em] uppercase mb-4">Tournament Reflection</h5>
            <p className="font-body-md text-white/90 text-[1.1rem] leading-relaxed italic">
              "Competing against diverse perspectives outside our own walls tested the very core of our arguments. It wasn't just about winning the room, but understanding the universal resonance of our ideas."
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }} className="mb-20">
            <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-6">Gallery Preview</h5>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8 md:mx-0 md:px-0">
              {mockGallery.map((imgUrl, idx) => (
                <img key={idx} src={imgUrl} alt={`Gallery preview ${idx}`} className="w-[180px] h-[120px] object-cover rounded-lg flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-400 cursor-pointer" />
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-8 border-t border-white/10 pt-10"
          >
            {[
              { label: 'Explore Gallery', icon: 'photo_library' },
              { label: 'Read Transcripts', icon: 'description' },
              { label: 'View Match History', icon: 'emoji_events' }
            ].map(btn => (
              <button key={btn.label} className="group flex items-center gap-3 font-label-caps tracking-[0.15em] text-[10px] uppercase text-white/50 hover:text-white transition-colors duration-400">
                <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-full md:w-[25%] border-t md:border-t-0 md:border-l border-white/5 bg-black relative">
        <div data-lenis-prevent className="sticky top-0 h-auto md:h-full max-h-none md:max-h-[80vh] overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } } }}
            className="flex flex-row md:flex-col gap-8 md:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
          >
            {[
              { label: 'Achievement', value: item.winner || 'Tournament Finalist' },
              { label: 'Event Attended', value: item.location || 'External Tournament' },
              { label: 'Year', value: item.date?.split(',')[1]?.trim() || item.date || '' },
              { label: 'Format', value: 'British Parliamentary' }
            ].map((data, i) => (
              <motion.div 
                key={data.label}
                variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-2 min-w-[120px] md:min-w-0"
              >
                <span className="font-label-caps text-[9px] tracking-[0.2em] uppercase text-white/40">
                  {data.label}
                </span>
                <span className="font-body-md text-[13px] text-white/90">
                  {data.value}
                </span>
                {i < 3 && (
                  <div className="hidden md:block w-full h-[1px] bg-white/5 mt-8" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  )
}
