import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import { useData } from '../context/DataContext'

export default function GalleryPage() {
  const { events, legacyEvents } = useData();

  // Extract all events that have a gallery
  const allEvents = [...(events || []), ...(legacyEvents || [])];
  const eventsWithGallery = allEvents.filter(event => event.gallery && Array.isArray(event.gallery) && event.gallery.length > 0);

  return (
    <PageLayout grainientProps={{
      color1: "#401a1a",
      color2: "#E05769",
      color3: "#cc6f6f",
      timeSpeed: 2.15
    }}>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1, ease: 'easeOut' }}
        className="min-h-[100dvh] flex flex-col items-center px-[clamp(1.5rem,7vw,10rem)] relative pt-32 pb-24"
      >
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent to-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="max-w-7xl mx-auto w-full z-10 flex flex-col items-center gap-6 text-center"
        >
          <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] uppercase">
            EVENT GALLERIES
          </span>
          <h1 className="font-display-xl text-primary uppercase tracking-tighter font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-fixed to-inverse-primary drop-shadow-[0_0_40px_rgba(243,205,147,0.3)]">
            THE<br />GALLERY
          </h1>
          <p className="font-label-caps text-[14px] md:text-[16px] text-on-surface-variant tracking-widest mt-4 opacity-70 mb-12">
            <span className="text-secondary">&lt;</span> Captured moments from the podium. <span className="text-secondary">&gt;</span>
          </p>

          <div className="w-full flex flex-col gap-16">
            {eventsWithGallery.length > 0 ? (
              eventsWithGallery.map((event, eventIdx) => (
                <div key={event.id || eventIdx} className="w-full text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-label-caps text-lg text-primary uppercase tracking-widest whitespace-nowrap">
                      {event.title}
                    </h2>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
                  </div>
                  
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 w-full">
                    {event.gallery.map((imgUrl, idx) => (
                      <motion.div 
                        key={`${imgUrl}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (idx % 10) * 0.1, duration: 0.5 }}
                        className="mb-4 overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] relative group inline-block w-full"
                      >
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
                        <img 
                          src={imgUrl} 
                          alt={`${event.title} gallery ${idx}`} 
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-20 flex flex-col items-center justify-center text-white/50">
                <span className="material-symbols-outlined text-4xl mb-4 opacity-50">photo_library</span>
                <p className="font-label-caps tracking-widest uppercase text-sm">No images yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.main>
    </PageLayout>
  )
}
