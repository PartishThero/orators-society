import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'

export default function RecruitmentModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { addRegistration } = useData()

  if (typeof document === 'undefined') return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email) return
    
    setIsSubmitting(true)
    try {
      await addRegistration('Recruitment', name, email)
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset state after close animation
        setTimeout(() => {
          setIsSuccess(false)
          setName('')
          setEmail('')
        }, 500)
      }, 2000)
    } catch (err) {
      console.error(err)
      // Basic error handling
      alert('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#090909] border border-white/10 rounded-[2rem] shadow-2xl p-8 z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-6 text-green-500">
                  <span className="material-symbols-outlined text-4xl">check</span>
                </div>
                <h3 className="font-display-xl text-[2rem] text-white uppercase tracking-tight mb-2">Application Submitted</h3>
                <p className="text-white/60 font-body-md">We will be in touch with you shortly.</p>
              </motion.div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-display-xl text-[1.5rem] text-white uppercase tracking-tight">Join Us</h3>
                    <p className="text-[12px] text-white/50 font-label-caps tracking-wider uppercase mt-1">
                      Submit your details to join the society
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[16px] focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[16px] focus:outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      style={{ borderRadius: '9999px' }}
                      className="group relative w-full font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/[0.03]"
                    >
                      <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
