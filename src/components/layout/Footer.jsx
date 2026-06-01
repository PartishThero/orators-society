// Footer.jsx — shared bottom footer across all pages
// Highlights the current page link in gold (primary).

import { motion } from 'framer-motion'
import Grainient from '../ui/Grainient'
const getSocialIcon = (name) => {
  if (name === 'LinkedIn') {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  if (name === 'Instagram') {
    return (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  return null;
};

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
          <div className="flex items-center gap-6">
            {footerData.socials.map((s) => (
              <a 
                key={s.name} 
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-on-surface hover:text-primary transition-colors duration-400 p-2 hover:scale-110 transform"
                aria-label={s.name}
              >
                {getSocialIcon(s.name)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
