import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BaseModal from './BaseModal'

export default function ArchiveModal({ isOpen, onClose, item, isAdminEdit = false, onSave, onRegister }) {
  if (typeof document === 'undefined') return null

  const [editItem, setEditItem] = useState(item || {});

  useEffect(() => {
    if (item) {
      setEditItem({
        ...item,
        themes: item.themes || [],
        gallery: item.gallery || [],
        google_form_link: item.google_form_link || '',
        runner_up: item.runner_up || '',
        event_series: item.event_series || '',
        attendance: item.attendance || '',
        speaker_count: item.speaker_count || '',
        duration: item.duration || '',
        participants: item.participants || '',
        rounds: item.rounds || '',
        judges: item.judges || '',
        winning_argument: item.winning_argument || '',
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
      const isPast = (editItem.status || 'past') === 'past';
      const finalItem = { ...editItem };
      if (!isPast) {
        finalItem.winner = '';
        finalItem.runner_up = '';
        finalItem.winning_argument = '';
        finalItem.attendance = '';
        finalItem.speaker_count = '';
        finalItem.gallery = [];
      }
      onSave(finalItem);
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
        onRegister={onRegister}
      />
    </BaseModal>
  )
}

function ArchiveModalContent({ item, isAdminEdit, onFieldChange, onSave, scrollRef, onRegister }) {
  const [adminTab, setAdminTab] = useState('content');
  const themes = item.themes || [];
  const gallery = item.gallery || [];
  const isPast = (item.status || 'past') === 'past';

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
        {isAdminEdit && (
          <div className="flex gap-2 mb-10 border-b border-white/10 pb-4">
            <button
              onClick={() => setAdminTab('content')}
              className={`px-4 py-2 rounded-full font-label-caps text-[10px] uppercase tracking-wider transition-colors ${adminTab === 'content' ? 'bg-primary text-black font-semibold' : 'bg-white/[0.03] text-white/50 hover:text-white/80'}`}
            >
              Frontend Content
            </button>
            <button
              onClick={() => setAdminTab('config')}
              className={`px-4 py-2 rounded-full font-label-caps text-[10px] uppercase tracking-wider transition-colors ${adminTab === 'config' ? 'bg-primary text-black font-semibold' : 'bg-white/[0.03] text-white/50 hover:text-white/80'}`}
            >
              System Configuration
            </button>
          </div>
        )}

        <div className="max-w-2xl pb-32">
          {(!isAdminEdit || adminTab === 'content') ? (
            <>
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
                  placeholder="New Event Title"
                  className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white font-display-xl text-[1.8rem] uppercase w-full focus:outline-none focus:border-primary/50"
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
                  placeholder="Add a subtitle here..."
                  className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-primary italic font-quote-serif text-[1.2rem] w-full focus:outline-none focus:border-primary/50"
                />
              </div>
            ) : (
              <p className="font-quote-serif text-[1.5rem] md:text-[2rem] leading-[1.1] text-primary italic border-l-2 border-primary/30 pl-6">
                "{item.subtitle}"
              </p>
            )}
          </motion.div>

          {/* Inline Metadata */}
          {((isAdminEdit) || [
            item.duration,
            item.participants,
            item.rounds,
            item.judges
          ].some(val => val && val.trim() !== '')) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-16 border-y border-white/5 py-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Duration', key: 'duration', placeholder: '120 Min', options: ['30 Min', '60 Min', '90 Min', '120 Min'] },
                    { label: 'Participants', key: 'participants', placeholder: '14' },
                    { label: 'Rounds', key: 'rounds', placeholder: '3', options: ['1', '2', '3', '4', '5'] },
                    { label: 'Judges', key: 'judges', placeholder: 'Panel of 5', options: ['Single Judge', 'Panel of 3', 'Panel of 5', 'Audience Vote'] }
                  ].filter(d => isAdminEdit || (item[d.key] && item[d.key].trim() !== '')).map(d => (
                    <div key={d.key} className="flex flex-col gap-1.5">
                      <span className="font-label-caps text-[9px] text-white/60 tracking-[0.2em] uppercase">{d.label}:</span>
                      {isAdminEdit ? (
                        d.options ? (
                          <select
                            value={item[d.key] || ''}
                            onChange={(e) => onFieldChange(d.key, e.target.value)}
                            className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-lg px-2 py-1.5 text-white/90 text-[16px] focus:outline-none focus:border-primary/50 text-center font-mono"
                          >
                            <option value="" disabled className="bg-[#090909]">{d.placeholder}</option>
                            {d.options.map(opt => <option key={opt} value={opt} className="bg-[#090909]">{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={item[d.key] || ''}
                            onChange={(e) => onFieldChange(d.key, e.target.value)}
                            placeholder={d.placeholder}
                            className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-lg px-2 py-1.5 text-white/90 text-[16px] focus:outline-none focus:border-primary/50 text-center font-mono"
                          />
                        )
                      ) : (
                        <span className="font-label-caps text-[10px] text-white/80 tracking-wider uppercase">{item[d.key]}</span>
                      )}
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
            {isAdminEdit ? (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-label-caps text-primary/60 uppercase">Main Synopsis (HTML / Paragraph format)</span>
                <textarea
                  value={item.synopsis || ''}
                  onChange={(e) => onFieldChange('synopsis', e.target.value)}
                  placeholder="Add a detailed description here..."
                  rows="6"
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white/90 text-[16px] leading-relaxed resize-none focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
            ) : (
              <div className="space-y-6">
                {item.synopsis ? (
                  item.synopsis.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <>
                    <p>
                      Participants challenged the prevailing narratives, stripping away convention to debate the core philosophies that shape our modern society.
                    </p>
                    <p>
                      The session opened with an exploration of historical precedents, carefully dismantling the established views that have long governed public opinion. It became clear early on that the traditional frameworks were insufficient for addressing the complexities of the digital age.
                    </p>
                    <p>
                      By the final round, the discourse shifted toward actionable governance. The debate not only highlighted the inherent tensions between opposing ideologies but also proposed a radical new synthesis that left the audience in contemplative silence.
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>

          {/* Discussion Themes */}
          {((isAdminEdit) || (themes.length > 0)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mb-16">
              <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-4">Themes</h5>
              {isAdminEdit ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={themes.join(', ')}
                    onChange={(e) => onFieldChange('themes', e.target.value.split(',').map(t => t.trim()))}
                    placeholder="Privacy, Consent, Governance (Comma separated)"
                    className="w-full bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[16px] focus:outline-none focus:border-primary/50"
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
          )}

          {/* Winning Argument Pull-Quote */}
          {((isAdminEdit) || (item.winning_argument && item.winning_argument.trim() !== '')) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="mb-16 p-8 md:p-10 rounded-2xl bg-black border border-white/5 shadow-inner">
              <h5 className="font-label-caps text-[10px] text-primary/70 tracking-[0.2em] uppercase mb-4">Winning Argument</h5>
              {isAdminEdit ? (
                <textarea
                  value={item.winning_argument || ''}
                  onChange={(e) => onFieldChange('winning_argument', e.target.value)}
                  placeholder="Add the winning argument pull-quote..."
                  rows="3"
                  disabled={!isPast}
                  className={`w-full bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-primary text-[16px] leading-relaxed italic resize-none focus:outline-none focus:border-primary/50 ${!isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              ) : (
                <p className="font-body-md text-white/90 text-[1.1rem] leading-relaxed italic">
                  "{item.winning_argument}"
                </p>
              )}
            </motion.div>
          )}

          {/* Gallery Preview */}
          {((isAdminEdit) || (gallery.length > 0)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-20">
              <h5 className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase mb-6">Gallery Images</h5>
              {isAdminEdit ? (
                <div className="flex flex-col gap-6">

                  {/* ── CARD IMAGE UPLOAD ── */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-label-caps text-white/60 uppercase">Card Image (Img URL or Upload)</span>
                    <div
                      onDragEnter={handleCardDrag}
                      onDragOver={handleCardDrag}
                      onDragLeave={handleCardDrag}
                      onDrop={handleCardDrop}
                      onClick={() => document.getElementById('card-image-file').click()}
                      className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[160px] ${cardDragActive
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
                          <span className="text-[10px] text-white/60">PNG, JPG, GIF</span>
                        </div>
                      )}
                    </div>
                  </div>

                {/* ── GALLERY IMAGES UPLOAD ── */}
                  <div className={`flex flex-col gap-2 ${!isPast ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                    <span className="text-[9px] font-label-caps text-white/60 uppercase">Add Gallery Images</span>
                    <div
                      onDragEnter={handleGalleryDrag}
                      onDragOver={handleGalleryDrag}
                      onDragLeave={handleGalleryDrag}
                      onDrop={handleGalleryDrop}
                      onClick={() => document.getElementById('gallery-images-files').click()}
                      className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[120px] ${galleryDragActive
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
                        <span className="text-[10px] text-white/60">Drop multiple files</span>
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
          )}
        </>
      ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
              <h2 className="font-display-xl text-[2rem] text-white uppercase tracking-tighter">System Configuration</h2>
              
              <div className="bg-[#090909] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-[9px] text-white/60 uppercase tracking-widest">Event Status</span>
                  <select
                    value={item.status || 'past'}
                    onChange={(e) => onFieldChange('status', e.target.value)}
                    className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white text-[16px] focus:outline-none focus:border-primary/50"
                  >
                    <option value="past" className="bg-[#090909]">Past</option>
                    <option value="live" className="bg-[#090909]">Live</option>
                    <option value="upcoming" className="bg-[#090909]">Upcoming</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-[9px] text-white/60 uppercase tracking-widest">Google Form Link</span>
                  <input
                    type="url"
                    value={item.google_form_link || ''}
                    onChange={(e) => onFieldChange('google_form_link', e.target.value)}
                    placeholder="https://docs.google.com/forms/..."
                    className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white text-[16px] focus:outline-none focus:border-primary/50 font-mono"
                  />
                  <span className="text-[10px] text-white/40 mt-1">Used if Save Registrations to DB is disabled or as a fallback.</span>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/5 pt-6 mt-2">
                  <span className="font-label-caps text-[9px] text-white/60 uppercase tracking-widest">Save Registrations to DB</span>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => onFieldChange('save_to_database', item.save_to_database === false ? true : false)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${item.save_to_database !== false ? 'bg-primary' : 'bg-white/20'}`}
                    >
                      <motion.div
                        layout
                        className="w-4 h-4 rounded-full bg-white shadow-sm"
                        animate={{ x: item.save_to_database !== false ? 24 : 0 }}
                      />
                    </button>
                    <span className="text-[12px] font-mono text-white/70">{item.save_to_database !== false ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 pt-6 mt-2">
                  <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase">Grid Layout Settings</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="font-label-caps text-[9px] text-white/60 uppercase">Card Height (px)</span>
                      <input
                        type="number"
                        value={item.height || 400}
                        onChange={(e) => onFieldChange('height', parseInt(e.target.value) || 400)}
                        className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white text-[16px] focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="font-label-caps text-[9px] text-white/60 uppercase">Column Span (1-3)</span>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        value={item.col_span || 1}
                        onChange={(e) => onFieldChange('col_span', parseInt(e.target.value) || 1)}
                        className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-xl px-4 py-3 text-white text-[16px] focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
                
              </div>
            </motion.div>
          )}

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
      <div className="w-full md:w-[25%] border-t md:border-t-0 md:border-l border-white/5 bg-[#141414] relative">
        <div data-lenis-prevent className="sticky top-0 h-auto md:h-full max-h-none md:max-h-[80vh] overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-row md:flex-col gap-8 md:gap-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
          >
            {!isAdminEdit && (
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
            )}

            {[
              { label: 'Winner', key: 'winner', placeholder: 'House of Logic', pastOnly: true },
              { label: 'Runner Up', key: 'runner_up', placeholder: 'Coalition for Transparency', pastOnly: true },
              { label: 'Event Series', key: 'event_series', placeholder: 'The Disruption Series' },
              { label: 'Date / Year', key: 'date', placeholder: 'Oct 26, 2024' },
              { label: 'Venue / Location', key: 'location', placeholder: 'The Grand Forum' },
              { label: 'Attendance', key: 'attendance', placeholder: '450 Guests', pastOnly: true },
              { label: 'Speaker Count', key: 'speaker_count', placeholder: '14', pastOnly: true },
            ].filter(data => isAdminEdit || (item[data.key] && item[data.key].trim() !== '')).map((data, i, arr) => (
              <div
                key={data.label}
                className="flex flex-col gap-2 min-w-[120px] md:min-w-0"
              >
                <span className="font-label-caps text-[9px] tracking-[0.2em] uppercase text-white/60">
                  {data.label}
                </span>

                {isAdminEdit ? (
                  <input
                    type="text"
                    value={item[data.key] || ''}
                    onChange={(e) => onFieldChange(data.key, e.target.value)}
                    placeholder={data.placeholder}
                    disabled={data.pastOnly && !isPast}
                    className={`bg-white/[0.03] hover:bg-white/[0.05] transition-colors border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[16px] focus:outline-none focus:border-primary/50 font-mono ${data.pastOnly && !isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                ) : (
                  <span className="font-body-md text-[16px] font-semibold text-white">
                    {item[data.key]}
                  </span>
                )}
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
