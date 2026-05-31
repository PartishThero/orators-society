// Footer.jsx — shared bottom footer across all pages
// Highlights the current page link in gold (primary).

import { motion } from 'framer-motion'
import Grainient from '../ui/Grainient'
import { footerData } from '../../data/footer'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
      className="w-full relative z-10 flex flex-col min-h-[100dvh] justify-between overflow-hidden pt-24 md:pt-32 border-t border-white/10"
    >
      {/* Continuous Vertical Line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />

      {/* ── Dynamic Gradient Background ── */}
      <div className="absolute top-0 left-0 w-full h-full -z-20">
        <Grainient
          color1="#2F3A31"
          color2="#293a31"
          color3="#A7B69A"
          timeSpeed={0.5}
          colorBalance={0.3}
          warpStrength={2.0}
          warpFrequency={1.5}
          warpSpeed={1.0}
          warpAmplitude={30}
          blendAngle={0.5}
          blendSoftness={0.2}
          rotationAmount={100.0}
          noiseScale={1.2}
          grainAmount={0.08}
          grainScale={1.5}
          grainAnimated={true}
          contrast={1.3}
          gamma={0.9}
          saturation={1.1}
          centerX={0.0}
          centerY={0.0}
          zoom={1.0}
        />
      </div>
      {/* Subtle bottom gradient to anchor the footer without washing out the colors */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-t from-[#050505]/80 to-transparent pointer-events-none" />

      {/* ── Top Section: Giant Headline ── */}
      <div className="w-full max-w-7xl mx-auto px-[clamp(1.5rem,7vw,5rem)] flex flex-col lg:flex-row justify-between items-center gap-16 flex-grow">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="font-display-xl-mobile md:text-[clamp(4rem,7vw,8rem)] leading-[0.9] text-on-surface uppercase tracking-tight">
            {footerData.headline.part1} <br /> <em className="font-quote-serif text-primary italic lowercase tracking-normal">{footerData.headline.highlight}</em> <br /> {footerData.headline.part2}
          </h2>
          <div className="mt-12 md:mt-16 inline-flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-[0.2em]">
              {footerData.contact.label}
            </span>
            <a 
              href={`mailto:${footerData.contact.email}`} 
              className="text-[clamp(1.2rem,3vw,2.5rem)] font-body-md text-on-surface hover:text-primary transition-colors duration-400"
            >
              {footerData.contact.email}
            </a>
          </div>
        </div>

        {/* ── Contact Form ── */}
        <div className="flex-1 lg:border-l border-white/10 lg:pl-20 self-center w-full max-w-lg lg:max-w-none mx-auto lg:mx-0 mt-16 lg:mt-0">
          <form className="flex flex-col gap-10 w-full" onSubmit={(e) => e.preventDefault()}>
            {/* Name Input */}
            <div className="relative z-0 w-full group">
              <input 
                type="text" 
                id="name"
                className="block py-3 px-0 w-full font-body-md text-lg text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                placeholder=" " 
                required 
              />
              <label 
                htmlFor="name" 
                className="absolute font-label-caps text-[11px] tracking-[0.2em] uppercase text-white/50 duration-300 transform -translate-y-8 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8"
              >
                Your Name
              </label>
            </div>

            {/* Email Input */}
            <div className="relative z-0 w-full group">
              <input 
                type="email" 
                id="email"
                className="block py-3 px-0 w-full font-body-md text-lg text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                placeholder=" " 
                required 
              />
              <label 
                htmlFor="email" 
                className="absolute font-label-caps text-[11px] tracking-[0.2em] uppercase text-white/50 duration-300 transform -translate-y-8 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8"
              >
                Email Address
              </label>
            </div>

            {/* Message Input */}
            <div className="relative z-0 w-full group">
              <textarea 
                id="message"
                rows="3"
                className="block py-3 px-0 w-full font-body-md text-lg text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer resize-none"
                placeholder=" " 
                required 
              ></textarea>
              <label 
                htmlFor="message" 
                className="absolute font-label-caps text-[11px] tracking-[0.2em] uppercase text-white/50 duration-300 transform -translate-y-8 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8"
              >
                Inquiry / Intent
              </label>
            </div>

            {/* Submit Button */}
            <div className="mt-2 flex justify-start">
              <button 
                type="submit" 
                style={{ borderRadius: '9999px' }}
                className="group relative font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 hover:bg-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              >
                <span className="w-6 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-10 transition-all duration-400" />
                Submit Request
                <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="w-full mt-16 border-t border-white/10 relative z-10 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto px-[clamp(1.5rem,7vw,5rem)] py-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="font-label-caps text-on-surface-variant/60 tracking-[0.2em] text-[10px] uppercase text-center md:text-left">
            {footerData.copyright}
          </span>
          <div className="flex items-center gap-8">
            {footerData.socials.map((s) => (
              <a key={s} href="#" className="font-label-caps text-[11px] text-on-surface hover:text-primary transition-colors duration-400 uppercase tracking-[0.2em]">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
