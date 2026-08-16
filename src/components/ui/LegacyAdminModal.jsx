import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BaseModal from './BaseModal'
import { uploadToStorage } from '../../utils/supabaseClient'

// Removed: compressAndGetBase64 — images now go to Supabase Storage via uploadToStorage()
// Bucket: 'legacy-images', Prefix: 'legacy-events'
const BUCKET = 'legacy-images';
const PREFIX = 'legacy-events';



export default function LegacyAdminModal({ isOpen, onClose, item, onSave }) {
  if (typeof document === 'undefined') return null;

  const [editItem, setEditItem] = useState(item || {});
  const [cardDragActive, setCardDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (item) {
      setEditItem({
        ...item,
      });
    }
  }, [item, isOpen]);

  const handleFieldChange = (field, value) => {
    setEditItem(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    setUploadError(null);
    try {
      const publicUrl = await uploadToStorage(file, BUCKET, PREFIX);
      handleFieldChange('img', publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCardDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCardDragActive(false);
    if (e.dataTransfer.files?.[0]) await handleImageUpload(e.dataTransfer.files[0]);
  };

  const handleCardFileSelect = async (e) => {
    if (e.target.files?.[0]) await handleImageUpload(e.target.files[0]);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editItem);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        id="card-image-file"
        type="file"
        accept="image/*"
        onChange={handleCardFileSelect}
        className="hidden"
      />
      <BaseModal 
        isOpen={isOpen} 
        onClose={onClose} 
        item={editItem}
        isAdminEdit={true}
        onImageDrag={handleCardDrag}
        onImageDrop={handleCardDrop}
        isImageDragging={cardDragActive}
        onImageClick={() => document.getElementById('card-image-file')?.click()}
      >
        <LegacyAdminModalContent
          item={editItem}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
        />
      </BaseModal>
    </>
  )
}

function LegacyAdminModalContent({ item, onFieldChange, onSave, scrollRef }) {
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto md:overflow-hidden bg-[#141414]">
      <div
        ref={scrollRef}
        data-lenis-prevent
        className="w-full h-auto md:h-full overflow-visible md:overflow-y-auto hide-scrollbar flex flex-col p-8 md:p-16"
      >
        <div className="max-w-2xl w-full mx-auto pb-16 flex flex-col gap-10">
          
          <h2 className="font-display-xl text-[2rem] text-white uppercase tracking-tighter mb-4 border-b border-white/10 pb-4">
            Edit Legacy Event
          </h2>

          <div className="flex flex-col gap-8">
            {/* Student Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-label-caps text-white/50 uppercase tracking-widest">Student Name</label>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => onFieldChange('title', e.target.value)}
                placeholder="e.g. Aria Thorne"
                className="bg-transparent border-b border-white/20 rounded-none px-2 py-3 text-white text-[1.2rem] focus:outline-none focus:border-primary placeholder:text-white/20"
                required
              />
            </div>

            {/* Event Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-label-caps text-white/50 uppercase tracking-widest">Event Name (Location)</label>
              <input
                type="text"
                value={item.location || ''}
                onChange={(e) => onFieldChange('location', e.target.value)}
                placeholder="e.g. World Universities Debating Championship"
                className="bg-transparent border-b border-white/20 rounded-none px-2 py-3 text-white text-[1.2rem] focus:outline-none focus:border-primary placeholder:text-white/20"
                required
              />
            </div>

            {/* Rank / Achievement */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-label-caps text-white/50 uppercase tracking-widest">Rank / Achievement</label>
              <input
                type="text"
                value={item.winner || ''}
                onChange={(e) => onFieldChange('winner', e.target.value)}
                placeholder="e.g. Best Open Speaker"
                className="bg-transparent border-b border-white/20 rounded-none px-2 py-3 text-white text-[1.2rem] focus:outline-none focus:border-primary placeholder:text-white/20"
                required
              />
            </div>

            {/* Event Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-label-caps text-white/50 uppercase tracking-widest">Description</label>
              <textarea
                value={item.bio || ''}
                onChange={(e) => onFieldChange('bio', e.target.value)}
                placeholder="Description of the student's representation at the event..."
                rows="5"
                className="bg-transparent border border-white/20 rounded-lg p-4 mt-2 text-white/80 text-[14px] leading-relaxed resize-none focus:outline-none focus:border-primary placeholder:text-white/20"
                required
              />
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-8 border-t border-white/10 flex gap-4">
            <button
              type="button"
              onClick={onSave}
              className="w-full bg-primary text-black font-label-caps uppercase text-[11px] font-bold py-4 rounded-xl hover:bg-white transition-colors tracking-widest shadow-lg shadow-primary/10"
            >
              Save Legacy Event
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
