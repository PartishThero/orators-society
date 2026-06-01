import { motion } from 'framer-motion'
import { sectionVariants } from '../../styles/theme'

export default function SectionWrapper({ children, className = '', id = '' }) {
  return (
    <motion.section
      id={id}
      className={`min-h-[60dvh] md:min-h-[100dvh] flex flex-col justify-center py-16 md:py-24 relative overflow-hidden ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      {children}
    </motion.section>
  )
}
