import { motion } from 'framer-motion'
import BaseModal from './BaseModal'

export default function ArchiveModal({ isOpen, onClose, item }) {
  if (typeof document === 'undefined') return null

  // Rich fallback data for the new editorial sections
  const mockThemes = item?.themes || ['Privacy', 'Consent', 'Governance', 'Digital Ethics']
  const mockGallery = item?.gallery || [
    'https://picsum.photos/id/1025/400/300?grayscale',
    'https://picsum.photos/id/1035/400/300?grayscale',
    'https://picsum.photos/id/1005/400/300?grayscale',
    'https://picsum.photos/id/1041/400/300?grayscale'
  ]

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} item={item}>
      <ArchiveModalContent item={item} mockThemes={mockThemes} mockGallery={mockGallery} />
    </BaseModal>
  )
}

function ArchiveModalContent({ item, mockThemes, mockGallery, scrollRef }) {
  return (
    <>
      {/* Center Content Column (Scrollable) */}
      <div 
        ref={scrollRef}
        data-lenis-prevent
        className="w-full md:w-[75%] h-full overflow-y-auto hide-scrollbar flex flex-col relative pt-12 md:pt-24 px-8 md:px-16"
      >
            <div className="max-w-2xl pb-32">
                  
              {/* Header (Year + Category) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col gap-1 mb-8"
                  >
                    <span className="font-label-caps text-primary/80 tracking-[0.3em] text-[10px] uppercase">
                      {item.date?.split(',')[1]?.trim() || '2024'}
                    </span>
                    <span className="font-label-caps text-white/50 tracking-[0.2em] text-[12px] uppercase">
                      Featured Debate
                    </span>
                  </motion.div>

                  {/* Large Title */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                    className="font-display-xl-mobile md:text-[clamp(3rem,4.5vw,5rem)] leading-[0.9] text-white uppercase tracking-tighter mb-8"
                  >
                    {item.title}
                  </motion.h2>

                  {/* Memorable Quote */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
                    className="font-quote-serif text-[1.5rem] md:text-[2rem] leading-[1.1] text-primary italic mb-12 border-l-2 border-primary/30 pl-6"
                  >
                    "{item.subtitle}"
                  </motion.p>

                  {/* Inline Metadata */}
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-wrap gap-x-8 gap-y-4 mb-16 border-y border-white/5 py-4"
                  >
                    {[
                      { l: 'Duration', v: '120 Min' },
                      { l: 'Participants', v: '14' },
                      { l: 'Rounds', v: '3' },
                      { l: 'Judges', v: 'Panel of 5' }
                    ].map(d => (
                      <div key={d.l} className="flex gap-2 items-center">
                        <span className="font-label-caps text-[9px] text-white/40 tracking-[0.2em] uppercase">{d.l}:</span>
                        <span className="font-label-caps text-[10px] text-white/80 tracking-wider uppercase">{d.v}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Event Overview (Multi-paragraph narrative) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
                    className="font-body-md text-white/70 text-[1.05rem] leading-[1.8] space-y-6 mb-16"
                  >
                    <p>
                      {item.synopsis || 'Participants challenged the prevailing narratives, stripping away convention to debate the core philosophies that shape our modern society.'}
                    </p>
                    <p>
                      The session opened with an exploration of historical precedents, carefully dismantling the established views that have long governed public opinion. It became clear early on that the traditional frameworks were insufficient for addressing the complexities of the digital age.
                    </p>
                    <p>
                      By the final round, the discourse shifted toward actionable governance. The debate not only highlighted the inherent tensions between opposing ideologies but also proposed a radical new synthesis that left the audience in contemplative silence.
                    </p>
                  </motion.div>

                  {/* Discussion Themes */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-16">
                    <div className="flex flex-wrap gap-3">
                      {mockThemes.map(theme => (
                        <span key={theme} className="font-label-caps text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Winning Argument Pull-Quote */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }} className="mb-16 p-8 md:p-10 rounded-2xl bg-[#0A0D14]/60 backdrop-blur-md border border-white/5 shadow-inner">
                    <h5 className="font-label-caps text-[10px] text-primary/70 tracking-[0.2em] uppercase mb-4">Winning Argument</h5>
                    <p className="font-body-md text-white/90 text-[1.1rem] leading-relaxed italic">
                      "The boundaries of the public record are no longer dictated by physical walls, but by the invisible architecture of consent. We must rebuild that architecture before the concept of personal sanctuary is entirely forgotten."
                    </p>
                  </motion.div>

                  {/* Gallery Preview */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }} className="mb-20">
                    <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-6">Gallery Preview</h5>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8 md:mx-0 md:px-0">
                      {mockGallery.map((imgUrl, idx) => (
                        <img key={idx} src={imgUrl} alt={`Gallery preview ${idx}`} className="w-[180px] h-[120px] object-cover rounded-lg flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-400 cursor-pointer" />
                      ))}
                    </div>
                  </motion.div>

                  {/* Bottom Editorial Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
                    className="flex flex-col sm:flex-row gap-8 border-t border-white/10 pt-10"
                  >
                    {[
                      { label: 'Explore Gallery', icon: 'photo_library' },
                      { label: 'Read Transcript', icon: 'description' },
                      { label: 'View Previous Editions', icon: 'history' }
                    ].map(btn => (
                      <button key={btn.label} className="group flex items-center gap-3 font-label-caps tracking-[0.15em] text-[10px] uppercase text-white/50 hover:text-white transition-colors duration-400">
                        <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">{btn.icon}</span>
                        {btn.label}
                      </button>
                    ))}
                  </motion.div>

                </div>
              </div>

              {/* Right Column: Sticky Metadata Sidebar */}
              <div className="w-full md:w-[25%] border-t md:border-t-0 md:border-l border-white/5 bg-[#0A0D14]/60 backdrop-blur-xl relative">
                <div data-lenis-prevent className="sticky top-0 h-full max-h-[80vh] overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-12">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } } }}
                    className="flex flex-row md:flex-col gap-8 md:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
                  >
                    {[
                      { label: 'Winner', value: item.winner || 'House of Logic' },
                      { label: 'Runner Up', value: 'Coalition for Transparency' },
                      { label: 'Event Series', value: 'The Disruption Series' },
                      { label: 'Year', value: item.date?.split(',')[1]?.trim() || '2024' },
                      { label: 'Venue', value: item.location || 'The Grand Forum' },
                      { label: 'Attendance', value: '450 Guests' },
                      { label: 'Speaker Count', value: item.speakerCount || '14' },
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
                        {i < 6 && (
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
