export const transitions = {
  fadeIn: { opacity: 0, y: 24 },
  cardHover: { scale: 1.02, y: -3 },
  spring: { type: 'spring', stiffness: 220, damping: 20 },
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  easeOutFast: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  easeOutSlow: { duration: 0.85, ease: 'easeOut' }
};

export const colors = {
  primary: '#C5A872',
  secondary: '#23426D',
  accent: '#A83A4F',
  dark: '#1A2A40',
  light: '#F7F5F0',
  bgNavy: '#23426d',
  bgSlate: '#E2E8F0',
};

export const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.85, ease: 'easeOut', staggerChildren: 0.2 }
  }
};
