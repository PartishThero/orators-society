import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Grainient from '../ui/Grainient'
import { transitions } from '../../styles/theme'
import Footer from './Footer'
import AlternativeFooter from './AlternativeFooter'

const defaultGrainientProps = {
  color1: "#23426d",
  color2: "#C5A872",
  color3: "#E2E8F0",
  timeSpeed: 1,
  colorBalance: 0.11,
  warpStrength: 1.0,
  warpFrequency: 3.6,
  warpSpeed: 2.0,
  warpAmplitude: 38,
  blendAngle: 0.0,
  blendSoftness: 0.05,
  rotationAmount: 500.0,
  noiseScale: 1.1,
  grainAmount: 0.15,
  grainScale: 2.0,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 0.95,
  saturation: 1.2,
  centerX: -0.02,
  centerY: -0.12,
  zoom: 0.8
};

export default function PageLayout({ children, grainientProps, hideFooter = false, includeGrainient = true }) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const showClassicFooter = searchParams.get('footer') === 'classic'

  return (
    <motion.div
      className="antialiased selection:bg-primary/30 selection:text-primary min-h-[100dvh] flex flex-col relative font-body-md text-body-md text-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitions.easeOutFast}
    >
      {/* Full-page dark base */}
      <div className="fixed inset-0 -z-30 bg-black" />

      {/* Animated Grainient background */}
      {includeGrainient && (
        <motion.div
          className="fixed inset-0 -z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
        >
          <Grainient {...defaultGrainientProps} {...grainientProps} />
        </motion.div>
      )}

      {children}

      {!hideFooter && <AlternativeFooter></AlternativeFooter>}
    </motion.div>
  )
}
