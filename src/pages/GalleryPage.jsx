import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import { useData } from '../context/DataContext'
import { fetchDriveFiles } from '../utils/googleDrive'
import { useState, useEffect } from 'react'

function DriveGallerySection({ event }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        const driveFiles = await fetchDriveFiles(event.driveFolderId);
        setFiles(driveFiles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFiles();
  }, [event.driveFolderId]);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="w-full aspect-[4/3] rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <span className="text-primary/30 text-[9px] font-label-caps tracking-[0.2em] uppercase">Syncing Drive</span>
        </div>
      ))}
    </div>
  );
  
  if (error === 'MISSING_API_KEY') return (
    <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center py-16 text-center">
      <span className="text-3xl mb-4 opacity-50">🔑</span>
      <h3 className="text-white/80 font-display-xl uppercase text-[1.2rem] tracking-wider mb-2">System Configuration Required</h3>
      <p className="text-white/40 text-[11px] max-w-md font-mono leading-relaxed">
        Google Drive API Key is missing. Please add <strong className="text-white/60">VITE_GOOGLE_DRIVE_API_KEY</strong> to your .env file to enable fetching files from Google Drive folders.
      </p>
    </div>
  );

  if (error === 'ACCESS_DENIED' || files.length === 0) return (
    <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center py-16 text-center">
      <span className="text-3xl mb-4 opacity-50">🔒</span>
      <h3 className="text-white/80 font-display-xl uppercase text-[1.2rem] tracking-wider mb-2">Access Restricted or Empty</h3>
      <p className="text-white/40 text-[11px] max-w-md font-mono leading-relaxed">
        The connected Google Drive folder could not be loaded or contains no images/videos. If you are an admin, please ensure the folder is set to <strong className="text-white/60">"Anyone with the link"</strong> in Google Drive share settings.
      </p>
    </div>
  );

  const displayFiles = files.slice(0, 4);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {displayFiles.map((file, idx) => (
          <motion.div 
            key={file.id}
            onClick={() => setActiveFile(file)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (idx % 10) * 0.1, duration: 0.5 }}
            className="overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] relative group w-full aspect-[4/3] cursor-pointer"
          >
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
            
            {file.mimeType && file.mimeType.includes('video') && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 z-10 border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            )}

            <img 
              src={file.url} 
              alt={file.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            {/* Fallback if image fails to load or browser doesn't support it */}
            <div className="hidden absolute inset-0 bg-[#151515] flex-col items-center justify-center text-white/30 border border-white/5">
              <span className="text-2xl mb-2">{file.mimeType?.includes('video') ? '🎬' : '🖼️'}</span>
              <span className="text-[10px] font-mono truncate max-w-[80%] px-2 text-center break-all text-white/40">{file.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {files.length > 4 && (
        <div className="mt-8 flex justify-center">
          <a 
            href={event.driveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08]"
            style={{ borderRadius: '9999px' }}
          >
            SEE ALL IN DRIVE
            <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
          </a>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl" onClick={() => setActiveFile(null)}>
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-3 transition-colors z-50"
            onClick={() => setActiveFile(null)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl aspect-video bg-[#111] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* We use iframe to embed Google Drive's native previewer, which elegantly handles videos, high-res HEIC zooming, and docs */}
            <iframe 
              src={`https://drive.google.com/file/d/${activeFile.id}/preview`} 
              className="w-full h-full border-none"
              allow="autoplay"
              allowFullScreen
            />
          </motion.div>
        </div>
      )}
    </>
  );
}

export default function GalleryPage() {
  const { events, legacyEvents } = useData();

  // Extract all events that have a gallery
  const allEvents = [...(events || []), ...(legacyEvents || [])];
  const eventsWithGallery = allEvents.map(event => {
    if (!event.gallery || !Array.isArray(event.gallery) || event.gallery.length === 0) return null;
    
    const firstItem = event.gallery[0];
    let driveFolderId = null;
    let driveLink = null;
    
    if (typeof firstItem === 'string' && firstItem.includes('drive.google.com/drive/folders/')) {
      const match = firstItem.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        driveFolderId = match[1];
        driveLink = firstItem;
      }
    }
    
    return {
      ...event,
      driveFolderId,
      driveLink,
      galleryFiles: driveFolderId ? [] : event.gallery
    };
  }).filter(Boolean);

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
                  
                  {event.driveFolderId ? (
                    <DriveGallerySection event={event} />
                  ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 w-full">
                      {event.galleryFiles.map((imgUrl, idx) => (
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
                  )}
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
