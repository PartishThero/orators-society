import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BaseModal from './BaseModal'

export default function ArchiveModal({ isOpen, onClose, item, isAdminEdit = false, onSave }) {
  if (typeof document === 'undefined') return null

  const [editItem, setEditItem] = useState(item || {});

  useEffect(() => {
    if (item) {
      setEditItem({
        ...item,
        themes: item.themes || ['Privacy', 'Consent', 'Governance', 'Digital Ethics'],
        gallery: item.gallery || [
          'https://picsum.photos/id/1025/400/300?grayscale',
          'https://picsum.photos/id/1035/400/300?grayscale',
          'https://picsum.photos/id/1005/400/300?grayscale'
        ],
        runner_up: item.runner_up || 'Coalition for Transparency',
        event_series: item.event_series || 'The Disruption Series',
        attendance: item.attendance || '450 Guests',
        speaker_count: item.speaker_count || '14',
        duration: item.duration || '120 Min',
        participants: item.participants || '14',
        rounds: item.rounds || '3',
        judges: item.judges || 'Panel of 5',
        winning_argument: item.winning_argument || 'The boundaries of the public record are no longer dictated by physical walls, but by the invisible architecture of consent.',
      });
    }
  }, [item, isOpen]);

  const handleFieldChange = (field, value) => {
    setEditItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editItem);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} item={item}>
      <ArchiveModalContent 
        item={editItem} 
        isAdminEdit={isAdminEdit} 
        onFieldChange={handleFieldChange} 
        onSave={handleSave} 
      />
    </BaseModal>
  )
}

function ArchiveModalContent({ item, isAdminEdit, onFieldChange, onSave, scrollRef }) {
  const themes = item.themes || [];
  const gallery = item.gallery || [];

  const [cardDragActive, setCardDragActive] = useState(false);
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);
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

  const compressAndGetBase64 = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleCardDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setCardDragActive(true);
    } else if (e.type === "dragleave") {
      setCardDragActive(false);
    }
  };

  const handleCardDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCardDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          setCompressing(true);
          const base64 = await compressAndGetBase64(file);
          onFieldChange('img', base64);
        } catch (err) {
          console.error("Error loading image file:", err);
        } finally {
          setCompressing(false);
        }
      }
    }
  };

  const handleCardFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        try {
          setCompressing(true);
          const base64 = await compressAndGetBase64(file);
          onFieldChange('img', base64);
        } catch (err) {
          console.error("Error loading image file:", err);
        } finally {
          setCompressing(false);
        }
      }
    }
  };

  const handleGalleryDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setGalleryDragActive(true);
    } else if (e.type === "dragleave") {
      setGalleryDragActive(false);
    }
  };

  const handleGalleryDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setCompressing(true);
      const files = Array.from(e.dataTransfer.files);
      const newImages = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          try {
            const base64 = await compressAndGetBase64(file);
            newImages.push(base64);
          } catch (err) {
            console.error("Error processing file:", err);
          }
        }
      }
      if (newImages.length > 0) {
        onFieldChange('gallery', [...gallery, ...newImages]);
      }
      setCompressing(false);
    }
  };

  const handleGalleryFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCompressing(true);
      const files = Array.from(e.target.files);
      const newImages = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          try {
            const base64 = await compressAndGetBase64(file);
            newImages.push(base64);
          } catch (err) {
            console.error("Error processing file:", err);
          }
        }
      }
      if (newImages.length > 0) {
        onFieldChange('gallery', [...gallery, ...newImages]);
      }
      setCompressing(false);
    }
  };

  const removeGalleryImage = (idxToRemove) => {
    const updatedGallery = gallery.filter((_, idx) => idx !== idxToRemove);
    onFieldChange('gallery', updatedGallery);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-y-auto md:overflow-hidden">
      {/* Center Content Column (Scrollable) */}
      <div 
        ref={scrollRef}
        data-lenis-prevent
        className="w-full md:w-[75%] h-auto md:h-full overflow-visible md:overflow-y-auto hide-scrollbar flex flex-col relative pt-12 md:pt-24 px-8 md:px-16"
      >
        <div className="max-w-2xl pb-32">
              
          {/* Header (Year + Category) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col gap-1 mb-8"
          >
            <div className="flex gap-4 items-center">
              <span className="font-label-caps text-primary/80 tracking-[0.3em] text-[10px] uppercase">
                {item.date?.split(',')[1]?.trim() || '2024'}
              </span>
              <span className="font-label-caps text-white/50 tracking-[0.2em] text-[12px] uppercase">
                Featured Debate
              </span>
            </div>
          </motion.div>

          {/* Large Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            {isAdminEdit ? (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-label-caps text-primary/60 uppercase">Live Title</span>
                <input 
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => onFieldChange('title', e.target.value)}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-display-xl text-[1.8rem] uppercase w-full focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
            ) : (
              <h2 className="font-display-xl text-[clamp(3rem,4.5vw,5rem)] leading-[0.9] text-white uppercase tracking-tighter">
                {item.title}
              </h2>
            )}
          </motion.div>

          {/* Memorable Quote */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            {isAdminEdit ? (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-label-caps text-primary/60 uppercase">Subtitle / Quote</span>
                <input 
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => onFieldChange('subtitle', e.target.value)}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-primary italic font-quote-serif text-[1.2rem] w-full focus:outline-none focus:border-primary/50"
                />
              </div>
            ) : (
              <p className="font-quote-serif text-[1.5rem] md:text-[2rem] leading-[1.1] text-primary italic border-l-2 border-primary/30 pl-6">
                "{item.subtitle}"
              </p>
            )}
          </motion.div>

          {/* Inline Metadata */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16 border-y border-white/5 py-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Duration', key: 'duration', placeholder: '120 Min' },
                { label: 'Participants', key: 'participants', placeholder: '14' },
                { label: 'Rounds', key: 'rounds', placeholder: '3' },
                { label: 'Judges', key: 'judges', placeholder: 'Panel of 5' }
              ].map(d => (
                <div key={d.key} className="flex flex-col gap-1.5">
                  <span className="font-label-caps text-[9px] text-white/40 tracking-[0.2em] uppercase">{d.label}:</span>
                  {isAdminEdit ? (
                    <input 
                      type="text"
                      value={item[d.key] || ''}
                      onChange={(e) => onFieldChange(d.key, e.target.value)}
                      placeholder={d.placeholder}
                      className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-white/90 text-[16px] focus:outline-none focus:border-primary/50 text-center font-mono"
                    />
                  ) : (
                    <span className="font-label-caps text-[10px] text-white/80 tracking-wider uppercase">{item[d.key]}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Event Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="font-body-md text-white/70 text-[1.05rem] leading-[1.8] space-y-6 mb-16"
          >
            {isAdminEdit ? (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-label-caps text-primary/60 uppercase">Main Synopsis (HTML / Paragraph format)</span>
                <textarea 
                  value={item.synopsis || ''}
                  onChange={(e) => onFieldChange('synopsis', e.target.value)}
                  rows="6"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/90 text-[16px] leading-relaxed resize-none focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
            ) : (
              <>
                <p>
                  {item.synopsis || 'Participants challenged the prevailing narratives, stripping away convention to debate the core philosophies that shape our modern society.'}
                </p>
                <p>
                  The session opened with an exploration of historical precedents, carefully dismantling the established views that have long governed public opinion. It became clear early on that the traditional frameworks were insufficient for addressing the complexities of the digital age.
                </p>
                <p>
                  By the final round, the discourse shifted toward actionable governance. The debate not only highlighted the inherent tensions between opposing ideologies but also proposed a radical new synthesis that left the audience in contemplative silence.
                </p>
              </>
            )}
          </motion.div>

          {/* Discussion Themes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-16">
            <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-4">Themes</h5>
            {isAdminEdit ? (
              <div className="flex flex-col gap-1">
                <input 
                  type="text"
                  value={themes.join(', ')}
                  onChange={(e) => onFieldChange('themes', e.target.value.split(',').map(t => t.trim()))}
                  placeholder="Privacy, Consent, Governance (Comma separated)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[16px] focus:outline-none focus:border-primary/50"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {themes.map(theme => (
                  <span key={theme} className="font-label-caps text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80">
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Winning Argument Pull-Quote */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="mb-16 p-8 md:p-10 rounded-2xl bg-black border border-white/5 shadow-inner">
            <h5 className="font-label-caps text-[10px] text-primary/70 tracking-[0.2em] uppercase mb-4">Winning Argument</h5>
            {isAdminEdit ? (
              <textarea 
                value={item.winning_argument || ''}
                onChange={(e) => onFieldChange('winning_argument', e.target.value)}
                rows="3"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-primary text-[16px] leading-relaxed italic resize-none focus:outline-none focus:border-primary/50"
              />
            ) : (
              <p className="font-body-md text-white/90 text-[1.1rem] leading-relaxed italic">
                "{item.winning_argument}"
              </p>
            )}
          </motion.div>

          {/* Gallery Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-20">
            <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-6">Gallery Images</h5>
            {isAdminEdit ? (
              <div className="flex flex-col gap-6">
                
                {/* ── CARD IMAGE UPLOAD ── */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-label-caps text-white/40 uppercase">Card Image (Img URL or Upload)</span>
                  <div 
                    onDragEnter={handleCardDrag}
                    onDragOver={handleCardDrag}
                    onDragLeave={handleCardDrag}
                    onDrop={handleCardDrop}
                    onClick={() => document.getElementById('card-image-file').click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[160px] ${
                      cardDragActive 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input 
                      id="card-image-file"
                      type="file" 
                      accept="image/*"
                      onChange={handleCardFileSelect}
                      className="hidden" 
                    />
                    {item.img ? (
                      <div className="relative group w-full max-w-[200px] h-[130px] overflow-hidden rounded-lg border border-white/10">
                        <img 
                          src={item.img} 
                          alt="Card preview" 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] font-label-caps tracking-wider text-white">Click/Drop to Replace</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[24px]">📁</span>
                        <span className="text-[12px] font-label-caps tracking-wider text-center">
                          Drag & Drop or Click to Upload Card Image
                        </span>
                        <span className="text-[10px] text-white/40">PNG, JPG, GIF</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="url"
                    value={item.img || ''}
                    onChange={(e) => onFieldChange('img', e.target.value)}
                    placeholder="https://picsum.photos/id/... (or paste direct URL here)"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[16px] focus:outline-none focus:border-primary/50 mb-3 font-mono"
                  />
                </div>

                {/* ── GALLERY IMAGES UPLOAD ── */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-label-caps text-white/40 uppercase">Add Gallery Images</span>
                  <div 
                    onDragEnter={handleGalleryDrag}
                    onDragOver={handleGalleryDrag}
                    onDragLeave={handleGalleryDrag}
                    onDrop={handleGalleryDrop}
                    onClick={() => document.getElementById('gallery-images-files').click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[120px] ${
                      galleryDragActive 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input 
                      id="gallery-images-files"
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFileSelect}
                      className="hidden" 
                    />
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[24px]">📂</span>
                      <span className="text-[12px] font-label-caps tracking-wider text-center">
                        Drag & Drop or Click to Add Gallery Images
                      </span>
                      <span className="text-[10px] text-white/40">Drop multiple files</span>
                    </div>
                  </div>

                  {compressing && (
                    <div className="text-[11px] font-label-caps text-primary tracking-wider animate-pulse text-center">
                      Processing files...
                    </div>
                  )}

                  {/* Thumbnail Management Grid */}
                  {gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                      {gallery.map((imgUrl, idx) => (
                        <div key={idx} onClick={() => setExpandedImageIndex(idx)} className="relative group aspect-video rounded-lg overflow-hidden border border-white/10 bg-neutral-900 cursor-zoom-in">
                          <img src={imgUrl} alt={`Gallery preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(idx);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Raw Text Area Fallback */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[9px] font-label-caps text-white/40 uppercase">Or edit raw Comma-separated URLs</span>
                    <textarea 
                      value={gallery.join(', ')}
                      onChange={(e) => onFieldChange('gallery', e.target.value.split(',').map(u => u.trim()).filter(Boolean))}
                      placeholder="https://url1, https://url2"
                      rows="2"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[16px] focus:outline-none focus:border-primary/50 resize-none font-mono"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8 md:mx-0 md:px-0">
                {gallery.map((imgUrl, idx) => (
                  <img key={idx} src={imgUrl} onClick={() => setExpandedImageIndex(idx)} alt={`Gallery preview ${idx}`} className="w-[280px] h-[185px] object-cover rounded-lg flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-400 cursor-pointer" />
                ))}
              </div>
            )}
          </motion.div>

          {/* Admin Save Button */}
          {isAdminEdit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-8 border-t border-white/10 flex gap-4">
              <button 
                type="button" 
                onClick={onSave}
                className="w-full bg-primary text-black font-label-caps uppercase text-[11px] font-bold py-4 rounded-xl hover:bg-white transition-colors tracking-widest shadow-lg shadow-primary/10"
              >
                Save & Update Database
              </button>
            </motion.div>
          )}

        </div>
      </div>

      {/* Right Column: Sticky Metadata Sidebar */}
      <div className="w-full md:w-[25%] border-t md:border-t-0 md:border-l border-white/5 bg-black relative">
        <div data-lenis-prevent className="sticky top-0 h-auto md:h-full max-h-none md:max-h-[80vh] overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-row md:flex-col gap-8 md:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
          >
            {[
              { label: 'Winner', key: 'winner', placeholder: 'House of Logic' },
              { label: 'Runner Up', key: 'runner_up', placeholder: 'Coalition for Transparency' },
              { label: 'Event Series', key: 'event_series', placeholder: 'The Disruption Series' },
              { label: 'Date / Year', key: 'date', placeholder: 'Oct 26, 2024' },
              { label: 'Venue / Location', key: 'location', placeholder: 'The Grand Forum' },
              { label: 'Attendance', key: 'attendance', placeholder: '450 Guests' },
              { label: 'Speaker Count', key: 'speaker_count', placeholder: '14' },
            ].map((data, i) => (
              <div 
                key={data.label}
                className="flex flex-col gap-2 min-w-[120px] md:min-w-0"
              >
                <span className="font-label-caps text-[9px] tracking-[0.2em] uppercase text-white/40">
                  {data.label}
                </span>
                
                {isAdminEdit ? (
                  <input 
                    type="text"
                    value={item[data.key] || ''}
                    onChange={(e) => onFieldChange(data.key, e.target.value)}
                    placeholder={data.placeholder}
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[16px] focus:outline-none focus:border-primary/50 font-mono"
                  />
                ) : (
                  <span className="font-body-md text-[13px] text-white/90">
                    {item[data.key]}
                  </span>
                )}
                {i < 6 && (
                  <div className="hidden md:block w-full h-[1px] bg-white/5 mt-4" />
                )}
              </div>
            ))}

            {/* Layout parameters (Admins only see this in edit mode) */}
            {isAdminEdit && (
              <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">Grid Layout Settings</span>
                
                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-[9px] text-white/40 uppercase">Card Height (px)</span>
                  <input 
                    type="number"
                    value={item.height || 400}
                    onChange={(e) => onFieldChange('height', parseInt(e.target.value) || 400)}
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[16px] focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-[9px] text-white/40 uppercase">Column Span (1-3)</span>
                  <input 
                    type="number"
                    min="1"
                    max="3"
                    value={item.col_span || 1}
                    onChange={(e) => onFieldChange('col_span', parseInt(e.target.value) || 1)}
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[16px] focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>

      {/* Lightbox / Expanded Image overlay */}
      {expandedImageIndex !== null && gallery[expandedImageIndex] && (
        <div 
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setExpandedImageIndex(null)}
        >
          {/* Navigation Controls */}
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

            {/* Bottom Counter / Indicators */}
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

          {/* Close Button */}
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
  )
}
