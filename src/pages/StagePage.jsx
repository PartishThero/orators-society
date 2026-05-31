import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'

export default function StagePage() {
  return (
    <PageLayout grainientProps={{
      color1: "#1A2A40",
      color2: "#DC143C",
      color3: "#E2E8F0",
      timeSpeed: 2.15
    }}>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1, ease: 'easeOut' }}
        className="min-h-[100dvh] flex flex-col items-center justify-center px-[clamp(1.5rem,7vw,10rem)] relative"
      >
        <div className="absolute top-1/2 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent to-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="max-w-6xl mx-auto z-10 flex flex-col items-center gap-6 text-center"
        >
          <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase">
            COMING SOON
          </span>
          <h1 className="font-display-xl-mobile md:font-display-xl text-primary uppercase tracking-tighter font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary drop-shadow-[0_0_40px_rgba(243,205,147,0.3)]">
            THE ACTIVE<br />STAGE
          </h1>
          <p className="font-label-caps text-[14px] md:text-[16px] text-on-surface-variant tracking-widest mt-4 opacity-70">
            <span className="text-secondary">&lt;</span> Live sessions, debate schedules, and speaker lineups will be announced here. <span className="text-secondary">&gt;</span>
          </p>
        </motion.div>
      </motion.main>
    </PageLayout>
  )
}
