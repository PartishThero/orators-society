import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getCdnUrl } from '../../utils/supabaseClient'

export default function HorizontalCatalog({
  items,
  onItemClick = () => {},
  onRegisterClick = () => {}
}) {
  const scrollRef = useRef(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Implement horizontal scrolling with mouse wheel (optional enhancement)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e) => {
      // If scrolling vertically, translate to horizontal scroll
      if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY * 2
      }
    }

    const checkScroll = () => {
      if (el) {
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
      }
    }
    
    checkScroll()
    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [items])

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  if (!items || items.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden archive-tint py-8 group">
      
      {/* Desktop Scroll Controls */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => scrollByAmount(-400)}
          className={`absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 border border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md ${canScrollLeft ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-default'}`}
          disabled={!canScrollLeft}
        >
          <span className="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>
      </div>

      <div className="hidden md:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => scrollByAmount(400)}
          className={`absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 border border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md ${canScrollRight ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-default'}`}
          disabled={!canScrollRight}
        >
          <span className="material-symbols-outlined text-[24px]">chevron_right</span>
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex flex-row overflow-x-auto hide-scrollbar gap-6 md:gap-10 px-[clamp(1.5rem,7vw,10rem)] pb-8 snap-x snap-mandatory relative z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: Math.min(idx * 0.1, 1), ease: 'easeOut' }}
            className="relative w-[85vw] sm:w-[450px] lg:w-[500px] h-[75dvh] max-h-[700px] flex-shrink-0 cursor-pointer overflow-hidden rounded-[1rem] shadow-2xl group/card snap-center border border-white/5 bg-black/20"
            onClick={() => onItemClick(item)}
          >
            {/* Base Image */}
            <img
              src={getCdnUrl(item.img)}
              alt={item.title || ''}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover/card:scale-105"
            />
            
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#f3cd93]/30 to-[#1a2a40]/30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 mix-blend-overlay pointer-events-none" />

            {/* Bottom Gradient for Text */}
            <div className="absolute inset-x-0 bottom-0 p-8 pt-32 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2 translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
              
              {/* Title */}
              <h3 className="font-display-xl text-[24px] font-extrabold tracking-[0.05em] uppercase text-primary leading-[1.2] drop-shadow-xl line-clamp-2">
                {item.title}
              </h3>

              {/* Subtitle */}
              {item.subtitle && (
                <p className="font-body-md text-[16px] font-medium text-white/90 drop-shadow-md">
                  {item.subtitle}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {(item.status === 'live' || item.status === 'upcoming') ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRegisterClick(item)
                    }}
                    className="bg-primary text-black font-label-caps uppercase text-[12px] font-bold px-5 py-2 rounded-full hover:bg-white transition-colors"
                  >
                    Register
                  </button>
                ) : item.winner && (
                  <span className="font-label-caps text-[12px] font-semibold uppercase tracking-[0.05em] text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                    {item.winner}
                  </span>
                )}
                
                {item.date && (
                  <span className="font-body-md text-[14px] font-medium text-white/80">
                    {item.date}
                  </span>
                )}
                
                {item.location && (
                  <span className="font-body-md text-[14px] font-medium text-white/80">
                    📍 {item.location}
                  </span>
                )}
              </div>
            </div>
            
          </motion.div>
        ))}
      </div>
    </div>
  )
}
