import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'

const INTERESTS = ['Debate', 'Public Speaking', 'Spoken Word', 'Operations']
const EXPERIENCE_LEVELS = ['Novice', 'Intermediate', 'Advanced', 'Professional']

export default function RecruitmentModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1)
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [interestArea, setInterestArea] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [motivationText, setMotivationText] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [struck, setStruck] = useState(false)

  const { addRecruitment } = useData()

  if (typeof document === 'undefined') return null

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 1 && (!name || !email)) return
    if (step === 2 && (!interestArea || !experienceLevel)) return
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!motivationText) return

    setIsSubmitting(true)
    setStruck(true)
    try {
      await addRecruitment({
        name,
        email,
        phone,
        interestArea,
        experienceLevel,
        motivationText
      })
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        setTimeout(() => {
          setIsSuccess(false)
          setStruck(false)
          setStep(1)
          setName('')
          setEmail('')
          setPhone('')
          setInterestArea('')
          setExperienceLevel('')
          setMotivationText('')
        }, 500)
      }, 3000)
    } catch (err) {
      console.error(err)
      alert('Petition submission failed. Please try again.')
      setStruck(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants for step transitions
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 30 : -30,
      opacity: 0
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="relative w-full h-[100dvh] sm:h-auto sm:max-w-xl bg-[#090909] border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl p-7 sm:p-10 z-10 overflow-hidden flex flex-col justify-center sm:block"
          >
            {/* Progress Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5">
              <motion.div 
                className="h-full bg-primary" 
                initial={{ width: '33%' }}
                animate={{ width: isSuccess ? '100%' : `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            {/* faint podium watermark */}
            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[12rem] text-white/[0.02] pointer-events-none select-none">
              podium
            </span>

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 sm:top-6 sm:right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-6 text-primary"
                >
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                </motion.div>
                <p className="text-[10px] font-label-caps tracking-[0.25em] uppercase text-primary/70 mb-2">
                  Petition Received
                </p>
                <h3 className="font-display-xl text-[2rem] text-white uppercase tracking-tight mb-2 leading-tight">
                  The floor has your case
                </h3>
                <p className="text-white/50 font-body-md text-[14px] max-w-[26rem] mx-auto mt-4">
                  We review every petition thoroughly. Expect to hear from the core within the week.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-8 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-[1px] bg-primary/50" />
                    <p className="text-[10px] font-label-caps tracking-[0.25em] uppercase text-primary/70">
                      Step 0{step} &middot; {step === 1 ? 'The Identity' : step === 2 ? 'The Discipline' : 'The Case'}
                    </p>
                  </div>
                  <h3 className="font-display-xl text-[2rem] leading-[1.05] text-white uppercase tracking-tight">
                    Make your case
                  </h3>
                  <p className="text-[13px] text-white/45 font-body-md mt-2 max-w-[26rem]">
                    {step === 1 && "Enter your identity. We must know who approaches the podium."}
                    {step === 2 && "Declare your focus. What discipline drives your voice?"}
                    {step === 3 && "Submit your opening statement. Why take the floor?"}
                  </p>
                </div>

                <div className="relative min-h-[300px] z-10">
                  <AnimatePresence mode="wait" custom={1}>
                    {step === 1 && (
                      <motion.form 
                        key="step1"
                        custom={1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                        onSubmit={handleNext} 
                        className="flex flex-col gap-4 absolute inset-0"
                      >
                        <div className="relative group">
                          <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2 group-focus-within:text-primary/80 transition-colors">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="relative z-10 w-full bg-white/[0.02] border-b border-white/10 rounded-t-xl px-4 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/20 hover:bg-white/[0.03]"
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
                            className="relative z-10 w-full bg-white/[0.02] border-b border-white/10 rounded-t-xl px-4 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/20 hover:bg-white/[0.03]"
                            required
                          />
                          <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                        </div>
                        <div className="relative group">
                          <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2 group-focus-within:text-primary/80 transition-colors">
                            Phone Number <span className="lowercase normal-case text-white/30">(optional)</span>
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="relative z-10 w-full bg-white/[0.02] border-b border-white/10 rounded-t-xl px-4 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/20 hover:bg-white/[0.03]"
                          />
                          <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                        </div>

                        <div className="mt-4">
                          <button
                            type="submit"
                            style={{ borderRadius: '9999px' }}
                            className="group relative w-full font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08]"
                          >
                            <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                            Proceed to Discipline
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {step === 2 && (
                      <motion.form 
                        key="step2"
                        custom={1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                        onSubmit={handleNext} 
                        className="flex flex-col gap-6 absolute inset-0 w-full"
                      >
                        <div>
                          <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-3">
                            Primary Interest
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {INTERESTS.map(interest => (
                              <button
                                key={interest}
                                type="button"
                                onClick={() => setInterestArea(interest)}
                                className={`px-4 py-2.5 rounded-full text-[12px] font-label-caps tracking-wider transition-all duration-300 border ${
                                  interestArea === interest 
                                    ? 'bg-primary/10 border-primary text-primary' 
                                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white hover:border-white/30'
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-3">
                            Experience Level
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {EXPERIENCE_LEVELS.map(level => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setExperienceLevel(level)}
                                className={`px-4 py-2.5 rounded-full text-[12px] font-label-caps tracking-wider transition-all duration-300 border ${
                                  experienceLevel === level 
                                    ? 'bg-primary/10 border-primary text-primary' 
                                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white hover:border-white/30'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 mt-auto pt-4">
                          <button
                            type="button"
                            onClick={handleBack}
                            style={{ borderRadius: '9999px' }}
                            className="flex-[0.4] border border-white/10 bg-white/[0.02] text-white/70 font-label-caps uppercase text-[10px] tracking-wider py-4 hover:bg-white/[0.05] transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={!interestArea || !experienceLevel}
                            style={{ borderRadius: '9999px' }}
                            className="group relative flex-1 font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                            Finalize Case
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {step === 3 && (
                      <motion.form 
                        key="step3"
                        custom={1}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                        onSubmit={handleSubmit} 
                        className="flex flex-col gap-4 absolute inset-0 w-full"
                      >
                        <div className="relative group flex-1">
                          <label className="block text-[10px] font-label-caps uppercase tracking-wider text-white/50 mb-2 group-focus-within:text-primary/80 transition-colors">
                            Opening Statement
                          </label>
                          <textarea
                            value={motivationText}
                            onChange={(e) => setMotivationText(e.target.value)}
                            placeholder="Why do you seek the podium? What ideas drive your voice?"
                            className="relative z-10 w-full h-[180px] resize-none bg-white/[0.02] border-b border-white/10 rounded-t-xl px-4 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/20 hover:bg-white/[0.03]"
                            required
                          />
                          <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                        </div>

                        <div className="flex gap-3 mt-auto pt-4">
                          <button
                            type="button"
                            onClick={handleBack}
                            style={{ borderRadius: '9999px' }}
                            className="flex-[0.4] border border-white/10 bg-white/[0.02] text-white/70 font-label-caps uppercase text-[10px] tracking-wider py-4 hover:bg-white/[0.05] transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !motivationText}
                            style={{ borderRadius: '9999px' }}
                            className="group relative flex-1 font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-4 hover:bg-white/[0.08] disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                            <motion.span
                              animate={struck ? { rotate: [0, -28, 0] } : { rotate: 0 }}
                              transition={{ duration: 0.45, ease: 'easeInOut' }}
                              className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors origin-bottom-left"
                            >
                              gavel
                            </motion.span>
                            {isSubmitting ? 'Calling to order...' : 'Submit Petition'}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}