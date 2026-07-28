import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function findMatchingEvent(label, events) {
  if (!events || !label) return null
  const base = label.replace(/\s*\([^)]*\)\s*$/, '').toLowerCase().trim()
  return events.find(e => {
    if (!e.title) return false
    const title = e.title.toLowerCase()
    return title.includes(base) || base.includes(title) ||
      base.split(/[—–-]/)[0].trim() === title.split(/[—–-]/)[0].trim()
  }) || null
}

// Clean event label for display
function parseLabel(label) {
  const cleanTitle = label.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*—\s*/, ' — ')
  const dateMatch = label.match(/\(([^)]*)\)$/)
  return { cleanTitle, date: dateMatch?.[1] || null }
}

export default function TimelineSection({ items, events, onEventClick }) {
  const [selectedYear, setSelectedYear] = useState(() => items?.[0]?.year ?? null)
  const expandedItem = items.find(item => item.year === selectedYear)

  return (
    <div className="flex flex-col w-full">

      {/* ── YEAR SELECTOR STRIP ── */}
      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="flex flex-wrap justify-center gap-4 px-[clamp(1.5rem,7vw,10rem)] py-2">
          {items.map((item, i) => {
            const isActive = selectedYear === item.year
            const isPrimary = item.badge === 'primary' || item.active
            const accentColor = isPrimary ? '#F3CD93' : item.badge === 'secondary' ? '#9A8060' : '#888'

            return (
              <motion.button
                key={item.year + i}
                className="relative flex flex-col gap-5 px-10 py-9 text-left rounded-2xl group overflow-hidden"
                style={{ minWidth: 380 }}
                onClick={() => setSelectedYear(isActive ? null : item.year)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                animate={{
                  borderColor: isActive ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.09)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                }}
                whileHover={{
                  borderColor: 'rgba(255,255,255,0.22)',
                  backgroundColor: 'rgba(255,255,255,0.045)',
                  y: isActive ? 0 : -4,
                }}
              >
                {/* Active top bar */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scaleX: isActive ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: `linear-gradient(to right, ${accentColor}, transparent)`,
                    transformOrigin: 'left center'
                  }}
                />

                {/* Hover top bar */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />

                {/* Ghost watermark year */}
                <div
                  className="absolute inset-0 flex items-center justify-end pr-12 pointer-events-none overflow-hidden"
                  aria-hidden
                >
                  <span
                    className="font-display-xl font-black tracking-tighter leading-none select-none transition-opacity duration-300"
                    style={{
                      fontSize: '120px',
                      color: isActive ? `${accentColor}08` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {item.year}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-3">
                  {/* Year label */}
                  <motion.span
                    className="font-display-xl font-bold tracking-tighter leading-none"
                    animate={{ color: isActive ? accentColor : 'rgba(255,255,255,0.75)' }}
                    transition={{ duration: 0.35 }}
                    style={{ fontSize: '60px' }}
                  >
                    {item.year}
                  </motion.span>

                  {/* Tagline */}
                  <p className={`font-quote-serif text-[15px] leading-snug transition-colors duration-300 ${isActive ? 'text-white/85' : 'text-white/50 group-hover:text-white/70'}`}>
                    "{item.title}"
                  </p>

                  {/* Count + toggle */}
                  {item.entries?.length > 0 && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`font-label-caps text-[10px] uppercase tracking-[0.25em] transition-colors duration-300 ${isActive ? 'text-white/60' : 'text-white/30 group-hover:text-white/50'}`}>
                        {item.entries.length} events
                      </span>
                      <motion.span
                        className="material-symbols-outlined text-[16px]"
                        animate={{ rotate: isActive ? 180 : 0, color: isActive ? accentColor : 'rgba(255,255,255,0.25)' }}
                        transition={{ duration: 0.35 }}
                      >
                        keyboard_arrow_down
                      </motion.span>
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Bottom border of selector strip */}
        <div className="h-[1px] bg-white/8 mx-[clamp(1.5rem,7vw,10rem)] mt-4" />
      </div>

      {/* ── EXPANDED EVENT PANEL ── */}
      <AnimatePresence mode="wait">
        {selectedYear && expandedItem?.entries && (
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div>

              {/* Panel header */}
              <motion.div
                className="px-[clamp(1.5rem,7vw,10rem)] pt-8 pb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="font-label-caps text-[11px] uppercase tracking-[0.35em] text-white/40 mb-1">
                  Showing
                </p>
                <h4 className="font-display-xl text-[2rem] text-white font-bold tracking-tight leading-none">
                  {selectedYear}
                  <span className="text-primary/80 ml-3 text-[1.4rem] font-normal">
                    — {expandedItem.entries.length} events
                  </span>
                </h4>
              </motion.div>

              {/* Horizontal event cards scroll */}
              <div className="w-full overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing pb-10">
                <div className="flex gap-4 min-w-max px-[clamp(1.5rem,7vw,10rem)]">
                  {expandedItem.entries.map(({ label }, idx) => {
                    const { cleanTitle, date } = parseLabel(label)
                    const matched = findMatchingEvent(label, events)
                    const clickable = !!matched && !!onEventClick

                    return (
                      <motion.div
                        key={label}
                        className={`relative flex flex-col justify-between rounded-2xl px-7 py-7 group/ev overflow-hidden ${clickable ? 'cursor-pointer' : ''}`}
                        style={{ minWidth: 280, maxWidth: 300, border: '1px solid' }}
                        initial={{ opacity: 0, y: 20, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        animate={{ opacity: 1, y: 0, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        whileHover={{
                          y: -6,
                          borderColor: 'rgba(255,255,255,0.25)',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }}
                        transition={{ delay: 0.12 + idx * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => clickable && onEventClick(matched)}
                      >
                        {/* Left accent bar on hover */}
                        <motion.div
                          className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full opacity-0 group-hover/ev:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(to bottom, #F3CD93, transparent)' }}
                        />

                        {/* Index */}
                        <span className="font-mono text-[11px] text-white/25 group-hover/ev:text-primary/50 transition-colors duration-300 mb-6 block">
                          {String(idx + 1).padStart(2, '0')} / {String(expandedItem.entries.length).padStart(2, '0')}
                        </span>

                        {/* Title */}
                        <p className="font-label-caps text-[12px] uppercase tracking-wider text-white/75 group-hover/ev:text-white transition-colors duration-300 leading-snug flex-grow mb-6">
                          {cleanTitle}
                        </p>

                        {/* Date + CTA row */}
                        <div className="flex items-center justify-between gap-2">
                          {date && (
                            <span className="font-mono text-[10px] text-white/30 group-hover/ev:text-white/50 transition-colors duration-300">
                              {date}
                            </span>
                          )}
                          {clickable && (
                            <motion.span
                              className="material-symbols-outlined text-[14px] text-primary/0 group-hover/ev:text-primary/70 transition-colors duration-300 ml-auto"
                            >
                              arrow_forward
                            </motion.span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
