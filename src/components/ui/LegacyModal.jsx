import { motion } from 'framer-motion'
import BaseModal from './BaseModal'

export default function LegacyModal({ isOpen, onClose, item }) {
  if (typeof document === 'undefined') return null

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} item={item}>
      <LegacyModalContent item={item} scrollRef={null} />
    </BaseModal>
  )
}

function LegacyModalContent({ item, scrollRef }) {
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
              { label: 'Event Attended', value: item.location || 'External Tournament' }
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
                {i < 1 && (
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
