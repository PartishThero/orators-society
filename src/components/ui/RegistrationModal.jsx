import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'

export default function RegistrationModal({ isOpen, onClose, eventItem }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { addRegistration } = useData()

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  const constructGoogleFormUrl = (baseLink, userName, userEmail) => {
    if (!baseLink) return '';
    try {
      const url = new URL(baseLink);
      const entryKeys = Array.from(url.searchParams.keys()).filter(key => key.startsWith('entry.'));
      
      if (entryKeys.length >= 1) {
        url.searchParams.set(entryKeys[0], userName);
      }
      if (entryKeys.length >= 2) {
        url.searchParams.set(entryKeys[1], userEmail);
      }
      return url.toString();
    } catch (err) {
      console.error("Invalid Google Form URL", err);
      // Fallback if parsing fails or fallback to string replacement if user manually put placeholders
      return baseLink.replace('NAME', encodeURIComponent(userName)).replace('EMAIL', encodeURIComponent(userEmail));
    }
  };

  if (typeof document === 'undefined') return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email) return
    
    setIsSubmitting(true)
    try {
      if (eventItem.save_to_database !== false) {
        await addRegistration(eventItem.id, name, email)
      }
      setIsSuccess(true)
      
      // If no Google Form link, auto-close after 2 seconds
      if (!eventItem.google_form_link) {
        setTimeout(() => {
          onClose()
          setTimeout(() => {
            setIsSuccess(false)
            setName('')
            setEmail('')
          }, 300)
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      if (err.message === 'ALREADY_REGISTERED') {
        setIsSuccess(true)
      } else {
        alert('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && eventItem && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="relative w-full h-[100dvh] sm:h-[550px] sm:max-w-md bg-[#090909] border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 z-10 overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  setIsSuccess(false);
                  setName('');
                  setEmail('');
                }, 300);
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors duration-400 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-500">close</span>
            </button>

            {isSuccess ? (
              eventItem.google_form_link ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  className="flex flex-col h-full w-full mt-2"
                >
                  <h3 className="font-display-xl text-[1.5rem] text-white uppercase tracking-tight mb-2 text-center">Complete Registration</h3>
                  <p className="text-white/60 font-body-md text-[13px] mb-4 text-center px-4">Please fill out this form to complete your registration for {eventItem.title}.</p>
                  <div className="w-full flex-grow bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden relative">
                    <iframe
                      src={constructGoogleFormUrl(eventItem.google_form_link, name, email)}
                      className="w-full h-full border-0 absolute inset-0"
                      title="Google Form Registration"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-6 text-green-500">
                    <span className="material-symbols-outlined text-4xl">check</span>
                  </div>
                  <h3 className="font-display-xl text-[2rem] text-white uppercase tracking-tight mb-2">Registered</h3>
                  <p className="text-white/60 font-body-md">We look forward to seeing you at<br/> <span className="text-primary">{eventItem.title}</span>.</p>
                </motion.div>
              )
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-display-xl text-[1.5rem] text-white uppercase tracking-tight">Register</h3>
                    <p className="text-[12px] text-white/50 font-label-caps tracking-wider uppercase mt-1">
                      {eventItem.title}
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-grow">
                  <div className="relative group">
                    <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2 group-focus-within:text-primary/80 transition-colors">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="relative z-10 w-full bg-white/[0.02] border-b border-white/10 rounded-t-xl px-5 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/40 hover:bg-white/[0.03]"
                      required
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                  </div>
                  <div className="relative group">
                    <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2 group-focus-within:text-primary/80 transition-colors">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="relative z-10 w-full bg-white/[0.02] border-b border-white/10 rounded-t-xl px-5 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/40 hover:bg-white/[0.03]"
                      required
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                  </div>

                  <div className="mt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      style={{ borderRadius: '9999px' }}
                      className="group relative w-full font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03]"
                    >
                      <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                      {isSubmitting ? 'Registering...' : (eventItem.google_form_link ? 'Continue' : 'Secure Seat')}
                      {!isSubmitting && (
                        <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
