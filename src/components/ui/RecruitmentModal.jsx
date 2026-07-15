import { useState, useEffect } from 'react'
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

  const { addRecruitment, globalSettings } = useData()

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
      return baseLink.replace('NAME', encodeURIComponent(userName)).replace('EMAIL', encodeURIComponent(userEmail));
    }
  };

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
      setIsSuccess(true)
      
      if (!globalSettings?.recruitment_form_link) {
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
      }
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
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-6">
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
            className="relative w-full h-[100dvh] md:h-auto md:min-h-[75vh] md:max-h-[90vh] md:max-w-6xl xl:max-w-7xl bg-[#090909] border-t md:border border-white/10 rounded-t-[2rem] md:rounded-[2rem] shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row"
          >
            {/* Progress Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 z-20">
              <motion.div 
                className="h-full bg-primary" 
                initial={{ width: '33%' }}
                animate={{ width: isSuccess ? '100%' : `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            <button
              onClick={() => {
                onClose();
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
                }, 500);
              }}
              aria-label="Close"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition-colors duration-400 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-500">close</span>
            </button>

            {/* Left Content Area (Context Text) - Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-[28%] xl:w-[25%] relative bg-[#050505] border-r border-white/10 overflow-hidden flex-col p-10 justify-center">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="text1"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    className="flex flex-col text-left absolute inset-0 p-10 justify-center"
                  >
                    <h4 className="font-display-xl text-[1.8rem] text-primary uppercase leading-[1.05] tracking-tight mb-6">
                      Dynamic Recruitment &<br />Cohort Orientation (2026-27)
                    </h4>
                    <div className="w-8 h-[2px] bg-primary/40 mb-8" />
                    <div>
                      <h5 className="font-label-caps text-[11px] text-white/90 tracking-[0.25em] uppercase mb-2.5 relative">
                        <span className="absolute -left-5 top-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-primary/80" /> The Window
                      </h5>
                      <p className="font-body-md text-[13.5px] text-white/70 leading-relaxed">
                        Applications remain open for a strict 2–3 day window. Shortlisting results will be finalized within 2–4 days of closure.
                      </p>
                    </div>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div 
                    key="text2"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    className="flex flex-col text-left absolute inset-0 p-10 justify-center"
                  >
                    <h4 className="font-display-xl text-[1.8rem] text-primary uppercase leading-[1.05] tracking-tight mb-6">
                      The Interview<br />Panels
                    </h4>
                    <div className="w-8 h-[2px] bg-primary/40 mb-8" />
                    <div>
                      <h5 className="font-label-caps text-[11px] text-white/90 tracking-[0.25em] uppercase mb-2.5 relative">
                        <span className="absolute -left-5 top-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-primary/80" /> The Panels
                      </h5>
                      <p className="font-body-md text-[13.5px] text-white/70 leading-relaxed">
                        Standard interview evaluations span across Presidential, Core administrative, and General operational rounds.
                      </p>
                    </div>
                  </motion.div>
                )}
                {(step === 3 || isSuccess) && (
                  <motion.div 
                    key="text3"
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    className="flex flex-col text-left absolute inset-0 p-10 justify-center"
                  >
                    <h4 className="font-display-xl text-[1.8rem] text-primary uppercase leading-[1.05] tracking-tight mb-6">
                      The Core Selection<br />Criteria
                    </h4>
                    <div className="w-8 h-[2px] bg-primary/40 mb-8" />
                    <div>
                      <h5 className="font-label-caps text-[11px] text-white/90 tracking-[0.25em] uppercase mb-2.5 relative">
                        <span className="absolute -left-5 top-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-primary/80" /> The Criteria
                      </h5>
                      <p className="font-body-md text-[13.5px] text-white/70 leading-relaxed">
                        Applicants are evaluated on clarity of thought, verbal/visual communication structures, baseline execution capability, and team alignment.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            </div>

            {/* Center Content Area (Form) */}
            <div className="flex-1 p-8 md:p-10 lg:p-12 flex flex-col justify-center relative overflow-y-auto hide-scrollbar">
              
              {/* faint podium watermark */}
              <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[12rem] text-white/[0.015] pointer-events-none select-none">
                podium
              </span>

              {isSuccess ? (
                globalSettings?.recruitment_form_link ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center h-full w-full pt-6"
                  >
                    <h3 className="font-display-xl text-[1.5rem] text-white uppercase tracking-tight mb-2 text-center">Complete Petition</h3>
                    <p className="text-white/60 font-body-md text-[13px] mb-4 text-center px-4">Please fill out this form to complete your petition.</p>
                    <div className="w-full flex-grow bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden relative">
                      <iframe
                        src={constructGoogleFormUrl(globalSettings.recruitment_form_link, name, email)}
                        className="w-full h-full border-0 absolute inset-0"
                        title="Google Form Recruitment"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-8 text-primary"
                    >
                      <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                    </motion.div>
                    <p className="text-[11px] font-label-caps tracking-[0.25em] uppercase text-primary/70 mb-3">
                      Petition Received
                    </p>
                    <h3 className="font-display-xl text-[2.5rem] text-white uppercase tracking-tight mb-4 leading-tight">
                      The floor <br/>has your case
                    </h3>
                    <p className="text-white/70 font-body-md text-[15px] max-w-[22rem] mx-auto leading-relaxed">
                      We review every petition thoroughly. Expect to hear from the core within the week.
                    </p>
                  </motion.div>
                )
              ) : (
                <>
                  <div className="mb-10 relative z-10 text-left">
                    <div className="mb-4 relative">
                      <span className="absolute -left-10 top-[calc(50%-0.5px)] w-6 h-[1px] bg-primary/50" />
                      <p className="text-[11px] font-label-caps tracking-[0.3em] uppercase text-primary/80">
                        Step 0{step} &middot; {step === 1 ? 'The Identity' : step === 2 ? 'The Discipline' : 'The Case'}
                      </p>
                    </div>
                    <h3 className="font-display-xl text-[2.5rem] leading-[1.05] text-white uppercase tracking-tight">
                      Make your case
                    </h3>
                    <p className="text-[14px] text-white/70 font-body-md mt-3 max-w-[22rem] leading-relaxed">
                      {step === 1 && "Enter your identity. We must know who approaches the podium."}
                      {step === 2 && "Declare your focus. What discipline drives your voice?"}
                      {step === 3 && "Submit your opening statement. Why take the floor?"}
                    </p>
                  </div>

                  <div className="relative min-h-[340px] z-10">
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
                          className="flex flex-col gap-5 absolute inset-0 w-full"
                        >
                          <div className="relative group">
                            <label className="block text-[11px] font-label-caps uppercase tracking-wider text-white/60 mb-2 group-focus-within:text-primary/90 transition-colors text-left">
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
                            <label className="block text-[11px] font-label-caps uppercase tracking-wider text-white/60 mb-2 group-focus-within:text-primary/90 transition-colors text-left">
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
                          <div className="relative group">
                            <label className="block text-[11px] font-label-caps uppercase tracking-wider text-white/60 mb-2 group-focus-within:text-primary/90 transition-colors text-left">
                              Phone Number <span className="lowercase normal-case text-white/30">(optional)</span>
                            </label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+1 (555) 000-0000"
                              className="relative z-10 w-full bg-white/[0.02] border-b border-white/10 rounded-t-xl px-5 py-4 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/40 hover:bg-white/[0.03]"
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                          </div>

                          <div className="mt-5">
                            <button
                              type="submit"
                              style={{ borderRadius: '9999px' }}
                              className="group relative w-full font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-5 hover:bg-white/[0.08]"
                            >
                              <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                              <span className="flex items-center gap-2.5">
                                Proceed to Discipline
                                <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
                              </span>
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
                          className="flex flex-col gap-7 absolute inset-0 w-full text-left"
                        >
                          <div>
                            <label className="block text-[11px] font-label-caps uppercase tracking-wider text-white/60 mb-4">
                              Primary Interest
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {INTERESTS.map(interest => (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() => setInterestArea(interest)}
                                  className={`px-5 py-3 rounded-full text-[12px] font-label-caps tracking-wider transition-all duration-300 border ${
                                    interestArea === interest 
                                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
                                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/30'
                                  }`}
                                >
                                  {interest}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-label-caps uppercase tracking-wider text-white/60 mb-4">
                              Experience Level
                            </label>
                            <div className="flex flex-wrap gap-3">
                              {EXPERIENCE_LEVELS.map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setExperienceLevel(level)}
                                  className={`px-5 py-3 rounded-full text-[12px] font-label-caps tracking-wider transition-all duration-300 border ${
                                    experienceLevel === level 
                                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
                                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white hover:border-white/30'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-4 mt-auto pt-4">
                            <button
                              type="button"
                              onClick={handleBack}
                              style={{ borderRadius: '9999px' }}
                              className="flex-[0.4] border border-white/10 bg-white/[0.02] text-white/70 font-label-caps uppercase text-[11px] tracking-wider py-5 hover:bg-white/[0.06] transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={!interestArea || !experienceLevel}
                              style={{ borderRadius: '9999px' }}
                              className="group relative flex-1 font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-5 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                              <span className="flex items-center gap-2.5">
                                Finalize Case
                                <span className="material-symbols-outlined text-[16px] text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
                              </span>
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
                          className="flex flex-col gap-5 absolute inset-0 w-full text-left"
                        >
                          <div className="relative group flex-1">
                            <label className="block text-[11px] font-label-caps uppercase tracking-wider text-white/60 mb-3 group-focus-within:text-primary/90 transition-colors">
                              Opening Statement
                            </label>
                            <textarea
                              value={motivationText}
                              onChange={(e) => setMotivationText(e.target.value)}
                              placeholder="Why do you seek the podium? What ideas drive your voice?"
                              className="relative z-10 w-full h-[220px] resize-none bg-white/[0.02] border-b border-white/10 rounded-t-xl px-5 py-5 text-white text-[15px] font-body-md tracking-wide focus:outline-none focus:bg-white/[0.04] transition-all placeholder:text-white/40 hover:bg-white/[0.03] leading-relaxed"
                              required
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-focus-within:w-full z-20" />
                          </div>

                          <div className="flex gap-4 mt-auto pt-2">
                            <button
                              type="button"
                              onClick={handleBack}
                              style={{ borderRadius: '9999px' }}
                              className="flex-[0.4] border border-white/10 bg-white/[0.02] text-white/70 font-label-caps uppercase text-[11px] tracking-wider py-5 hover:bg-white/[0.06] transition-colors"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting || !motivationText}
                              style={{ borderRadius: '9999px' }}
                              className="group relative flex-1 font-label-caps tracking-[0.2em] text-[11px] uppercase text-white/80 hover:text-white transition-colors duration-400 flex items-center justify-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/5 px-8 py-5 hover:bg-white/[0.08] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <span className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-12 transition-all duration-400" />
                              <span className="flex items-center gap-2.5">
                                <motion.span
                                  animate={struck ? { rotate: [0, -28, 0] } : { rotate: 0 }}
                                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                                  className="material-symbols-outlined text-[18px] text-primary/70 group-hover:text-primary transition-colors origin-bottom-left"
                                >
                                  gavel
                                </motion.span>
                                {isSubmitting ? 'Calling to order...' : 'Submit Petition'}
                              </span>
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Right Content Area (Image) - Hidden on Mobile */}
            <div className="hidden md:block md:w-[35%] lg:w-[28%] xl:w-[25%] relative bg-black border-l border-white/10 overflow-hidden">
              <AnimatePresence mode="crossfade">
                {step === 1 && (
                  <motion.img
                    key="img1"
                    src="/images/step1.png"
                    alt="Identity"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                )}
                {step === 2 && (
                  <motion.img
                    key="img2"
                    src="/images/step2.png"
                    alt="Discipline"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                )}
                {(step === 3 || isSuccess) && (
                  <motion.img
                    key="img3"
                    src="/images/step3.png"
                    alt="The Case"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                )}
              </AnimatePresence>

              {/* Gradient Overlay for seamless blend */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/80 to-transparent w-48" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-[#090909]/20" />
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}