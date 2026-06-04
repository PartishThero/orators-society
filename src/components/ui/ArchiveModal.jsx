import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
      {/* Center Content Column (Scrollable) */}
      <div 
        ref={scrollRef}
        data-lenis-prevent
        className="w-full md:w-[75%] h-full overflow-y-auto hide-scrollbar flex flex-col relative pt-12 md:pt-24 px-8 md:px-16"
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
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-display-xl-mobile text-[1.8rem] uppercase w-full focus:outline-none focus:border-primary/50"
                  required
                />
              </div>
            ) : (
              <h2 className="font-display-xl-mobile md:text-[clamp(3rem,4.5vw,5rem)] leading-[0.9] text-white uppercase tracking-tighter">
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
                      className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-white/90 text-[12px] focus:outline-none focus:border-primary/50 text-center font-mono"
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/90 text-[14px] leading-relaxed resize-none focus:outline-none focus:border-primary/50"
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[13px] focus:outline-none focus:border-primary/50"
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
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-primary text-[14px] leading-relaxed italic resize-none focus:outline-none focus:border-primary/50"
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
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-label-caps text-white/40 uppercase">Card Image (Img URL)</span>
                <input 
                  type="url"
                  value={item.img || ''}
                  onChange={(e) => onFieldChange('img', e.target.value)}
                  placeholder="https://picsum.photos/id/... (Core Card Image)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[13px] focus:outline-none focus:border-primary/50 mb-3"
                />
                
                <span className="text-[9px] font-label-caps text-white/40 uppercase">Gallery Images (Comma separated URLs)</span>
                <textarea 
                  value={gallery.join(', ')}
                  onChange={(e) => onFieldChange('gallery', e.target.value.split(',').map(u => u.trim()))}
                  placeholder="https://url1, https://url2, https://url3"
                  rows="3"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-[13px] focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8 md:mx-0 md:px-0">
                {gallery.map((imgUrl, idx) => (
                  <img key={idx} src={imgUrl} alt={`Gallery preview ${idx}`} className="w-[180px] h-[120px] object-cover rounded-lg flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-400 cursor-pointer" />
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
        <div data-lenis-prevent className="sticky top-0 h-full max-h-[80vh] overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-12">
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
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[13px] focus:outline-none focus:border-primary/50 font-mono"
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
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[13px] focus:outline-none focus:border-primary/50"
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
                    className="bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[13px] focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  )
}
