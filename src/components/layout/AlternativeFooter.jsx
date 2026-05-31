// AlternativeFooter.jsx — a modern, floating pill-style footer option
import { motion } from 'framer-motion'
import { footerData } from '../../data/footer'

export default function AlternativeFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full relative z-10 flex flex-col items-center justify-end pt-24"
    >
      {/* Continuous Vertical Line running from top down to the floating pill */}
      <div className="absolute top-0 h-24 left-1/2 w-[1px] bg-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
      {/* Floating Pill Container (CSS-based glassmorphism for zero-lag performance) */}
      <div className="w-full max-w-7xl px-[clamp(1.5rem,7vw,5rem)] relative">
        <div
          style={{ borderRadius: '40px' }}
          className="w-full bg-[#0E1117]/35 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 p-6 sm:p-10 md:p-16 gap-12 lg:gap-16">

            {/* Left Column */}
            <div className="flex flex-col justify-between gap-8 md:gap-12">
              {/* Top Left: Let's create together */}
              <div>
                <h2 className="font-display-xl-mobile md:text-[clamp(3.5rem,5vw,5rem)] leading-[0.95] text-white uppercase tracking-tighter">
                  LET’S CREATE <br />
                  <em className="font-quote-serif text-primary italic lowercase tracking-normal">together.</em>
                </h2>
              </div>

              {/* Bottom Left: Direct access */}
              <div className="flex flex-col gap-3">
                <span className="font-label-caps text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  DIRECT ACCESS
                </span>
                <a
                  href={`mailto:${footerData.contact.email}`}
                  className="text-[clamp(0.95rem,1.25vw,1.25rem)] font-body-md text-white/80 hover:text-primary transition-colors duration-400"
                >
                  {footerData.contact.email}
                </a>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8 md:gap-12 justify-between">
              {/* Top Right: Socials */}
              <div className="flex flex-wrap justify-start lg:justify-end gap-6 lg:gap-8 items-center border-b border-white/5 pb-8">
                <span className="font-label-caps text-[11px] tracking-[0.2em] text-white/40 uppercase mr-4">
                  CONNECT WITH US:
                </span>
                <div className="flex gap-6">
                  {footerData.socials.map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="font-label-caps text-[11px] text-white hover:text-primary transition-colors duration-400 uppercase tracking-[0.2em]"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>

              {/* Bottom Right: Form */}
              <form className="flex flex-col gap-8 w-full" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name Input */}
                  <div className="relative z-0 w-full group">
                    <input
                      type="text"
                      id="alt-name"
                      className="block py-2.5 px-0 w-full font-body-md text-base text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="alt-name"
                      className="absolute font-label-caps text-[10px] tracking-[0.2em] uppercase text-white/50 duration-300 transform -translate-y-8 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8"
                    >
                      Your Name
                    </label>
                  </div>

                  {/* Email Input */}
                  <div className="relative z-0 w-full group">
                    <input
                      type="email"
                      id="alt-email"
                      className="block py-2.5 px-0 w-full font-body-md text-base text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                      placeholder=" "
                      required
                    />
                    <label
                      htmlFor="alt-email"
                      className="absolute font-label-caps text-[10px] tracking-[0.2em] uppercase text-white/50 duration-300 transform -translate-y-8 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8"
                    >
                      Email Address
                    </label>
                  </div>
                </div>

                {/* Message Input */}
                <div className="relative z-0 w-full group">
                  <textarea
                    id="alt-message"
                    rows="2"
                    className="block py-2.5 px-0 w-full font-body-md text-base text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer resize-none"
                    placeholder=" "
                    required
                  ></textarea>
                  <label
                    htmlFor="alt-message"
                    className="absolute font-label-caps text-[10px] tracking-[0.2em] uppercase text-white/50 duration-300 transform -translate-y-8 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-8"
                  >
                    Inquiry / Intent
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    style={{ borderRadius: '9999px' }}
                    className="group relative font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3.5 hover:bg-white/10"
                  >
                    <span className="w-6 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-10 transition-all duration-400" />
                    Submit Request
                    <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* ── Sub Bar: Copyright & Created by Partish! ── */}
      <div className="w-full bg-black mt-12 py-4 flex justify-center border-t border-white/10 relative z-10">
        <div className="w-full max-w-7xl flex flex-row justify-between items-center gap-4 px-[clamp(1.5rem,7vw,5rem)] text-on-surface-variant/60 font-label-caps text-[9px] tracking-[0.2em] uppercase">
          <span>
            {footerData.copyright}
          </span>
          <span className="text-primary font-bold">
            Created with love!
          </span>
        </div>
      </div>
    </motion.footer>
  )
}
