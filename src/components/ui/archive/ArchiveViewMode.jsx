import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchiveViewMode({ item, scrollRef, onRegister }) {
  const themes = item.themes || [];
  const gallery = item.gallery || [];
  const isPast = (item.status || 'past') === 'past';
  const [expandedImageIndex, setExpandedImageIndex] = useState(null);

  useEffect(() => {
    if (expandedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setExpandedImageIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'ArrowRight') {
        setExpandedImageIndex(prev => prev < gallery.length - 1 ? prev + 1 : prev);
      } else if (e.key === 'Escape') {
        setExpandedImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedImageIndex, gallery.length]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-y-auto md:overflow-hidden">
      {/* Center Content Column (Scrollable) */}
      <div
        ref={scrollRef}
        data-lenis-prevent
        className="w-full md:w-[75%] h-auto md:h-full overflow-visible md:overflow-y-auto hide-scrollbar flex flex-col relative pt-12 md:pt-24 px-8 md:px-16"
      >
        <div className="max-w-2xl pb-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col gap-1 mb-8"
          >
            <div className="flex gap-4 items-center">
              <span className="font-label-caps tracking-[0.3em] uppercase text-primary/80">
                {item.date?.split(',')[1]?.trim() || ''}
              </span>
              <span className="font-label-caps text-white/50 tracking-[0.2em] text-[12px] uppercase">
                {item.event_series || 'Archived Event'}
              </span>
            </div>
          </motion.div>

          {/* Large Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display-xl text-[clamp(3rem,4.5vw,5rem)] leading-[0.9] text-white uppercase tracking-tighter">
              {item.title}
            </h2>
          </motion.div>

          {/* Memorable Quote */}
          {item.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <p className="font-quote-serif text-[1.5rem] md:text-[2rem] leading-[1.1] text-primary italic border-l-2 border-primary/30 pl-6">
                "{item.subtitle}"
              </p>
            </motion.div>
          )}

          {/* Inline Metadata */}
          {[
            item.duration,
            item.participants,
            item.rounds,
            item.judges
          ].some(val => val && val.trim() !== '') && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-16 border-y border-white/5 py-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Duration', key: 'duration' },
                  { label: 'Participants', key: 'participants' },
                  { label: 'Rounds', key: 'rounds' },
                  { label: 'Judges', key: 'judges' }
                ].filter(d => item[d.key] && item[d.key].trim() !== '').map(d => (
                  <div key={d.key} className="flex flex-col gap-1.5">
                    <span className="font-label-caps text-[9px] text-white/60 tracking-[0.2em] uppercase">{d.label}:</span>
                    <span className="font-label-caps text-[10px] text-white/80 tracking-wider uppercase">{item[d.key]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Event Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="font-body-md text-white/80 text-[1.1rem] md:text-[1.15rem] leading-[2] tracking-[0.01em] max-w-[65ch] space-y-6 mb-16"
          >
            <div className="space-y-6">
              {item.synopsis ? (
                item.synopsis.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <>
                  <p>Participants challenged the prevailing narratives, stripping away convention to debate the core philosophies that shape our modern society.</p>
                  <p>The session opened with an exploration of historical precedents, carefully dismantling the established views that have long governed public opinion.</p>
                  <p>By the final round, the discourse shifted toward actionable governance.</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Discussion Themes */}
          {themes.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-16">
              <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-4">Themes</h5>
              <div className="flex flex-wrap gap-3">
                {themes.map(theme => (
                  <span key={theme} className="font-label-caps text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80">
                    {theme}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gallery Preview */}
          {gallery.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-20">
              <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-6">Gallery Images</h5>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8 md:mx-0 md:px-0">
                {gallery.map((imgUrl, idx) => (
                  <img key={idx} src={imgUrl} onClick={() => setExpandedImageIndex(idx)} alt={`Gallery preview ${idx}`} className="w-[280px] h-[185px] object-cover rounded-lg flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-400 cursor-pointer" />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Metadata Sidebar */}
      <div className="w-full md:w-[25%] border-t md:border-t-0 md:border-l border-white/5 bg-[#141414] relative">
        <div data-lenis-prevent className="sticky top-0 h-auto md:h-full max-h-none md:max-h-[80vh] overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-row md:flex-col gap-8 md:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
          >
            <div className="mb-8 md:mb-10 w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPast && onRegister) onRegister();
                }}
                disabled={isPast}
                style={{ borderRadius: '9999px' }}
                className={`group relative w-full font-label-caps tracking-[0.2em] text-[11px] uppercase transition-colors duration-400 flex items-center justify-center gap-4 border px-8 py-4 ${isPast ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed' : 'bg-white/[0.03] backdrop-blur-md border-white/5 text-white/80 hover:text-white hover:bg-white/[0.08]'}`}
              >
                {!isPast && <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />}
                {isPast ? 'Registrations Closed' : 'Register for Event'}
                {!isPast && <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>}
              </button>
            </div>

            {[
              { label: 'Winner', key: 'winner', pastOnly: true },
              { label: 'Runner Up', key: 'runner_up', pastOnly: true },
              { label: 'Event Series', key: 'event_series' },
              { label: 'Date / Year', key: 'date' },
              { label: 'Venue / Location', key: 'location' },
              { label: 'Attendance', key: 'attendance', pastOnly: true },
              { label: 'Speaker Count', key: 'speaker_count', pastOnly: true },
            ].filter(data => item[data.key] && item[data.key].trim() !== '').map((data, i, arr) => (
              <div
                key={data.label}
                className="flex flex-col gap-2 min-w-[120px] md:min-w-0"
              >
                <span className="font-label-caps text-[9px] tracking-[0.2em] uppercase text-white/60">
                  {data.label}
                </span>
                <span className="font-body-md text-[16px] font-semibold text-white">
                  {item[data.key]}
                </span>
                {i < arr.length - 1 && (
                  <div className="hidden md:block w-full h-[1px] bg-white/5 mt-4" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Lightbox / Expanded Image overlay */}
      {expandedImageIndex !== null && gallery[expandedImageIndex] && (
        <div
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setExpandedImageIndex(null)}
        >
          {expandedImageIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImageIndex(prev => prev - 1);
              }}
              className="absolute left-6 z-[160] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-[20px] transition-colors"
            >
              ‹
            </button>
          )}

          <div
            className="relative flex items-center justify-center max-w-[92vw] max-h-[88vh] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={expandedImageIndex}
                src={gallery[expandedImageIndex]}
                alt="Expanded gallery preview"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(e, info) => {
                  const swipeThreshold = 50;
                  if (info.offset.x < -swipeThreshold && expandedImageIndex < gallery.length - 1) {
                    setExpandedImageIndex(prev => prev + 1);
                  } else if (info.offset.x > swipeThreshold && expandedImageIndex > 0) {
                    setExpandedImageIndex(prev => prev - 1);
                  }
                }}
                initial={{ opacity: 0, scale: 0.95, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -50 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-[88vh] object-contain rounded-lg shadow-2xl border border-white/10 select-none cursor-grab active:cursor-grabbing"
              />
            </AnimatePresence>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[11px] font-mono text-white/60 tracking-wider">
              {expandedImageIndex + 1} / {gallery.length}
            </div>
          </div>

          {expandedImageIndex < gallery.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImageIndex(prev => prev + 1);
              }}
              className="absolute right-6 z-[160] w-12 h-12 rounded-full border border-white/10 hover:border-white/30 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-[20px] transition-colors"
            >
              ›
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpandedImageIndex(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-[16px] transition-colors z-[160]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
