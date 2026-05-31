import { motion } from 'framer-motion'

export default function TimelineSection({ items }) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-12 cursor-grab active:cursor-grabbing">
      <div className="flex gap-16 min-w-max px-[clamp(1.5rem,7vw,10rem)] pt-8 relative">
        {/* Exact-length Timeline Track Line */}
        <div 
          className="absolute top-0 h-[2px] bg-white/20"
          style={{
            left: `calc(clamp(1.5rem,7vw,10rem) + 6px)`,
            width: `${(items.length - 1) * 464}px`
          }}
        />

        {items.map(({ year, title, body, badge, entries, active }, i) => {
          // If badge is undefined, fallback to active logic for coloring
          const isPrimary = badge === 'primary' || active;
          const isSecondary = badge === 'secondary';
          const isOutline = badge === 'outline' || (!active && badge === undefined);

          const dotColorClass = isPrimary
            ? 'bg-primary shadow-[0_0_15px_rgba(243,205,147,0.8)]'
            : isOutline
            ? 'bg-outline-variant'
            : 'bg-secondary';

          return (
            <motion.div
              key={year}
              className="w-[400px] flex flex-col gap-6 relative group"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10 }}
            >
              <motion.div 
                className={`absolute -top-[37px] left-0 w-3 h-3 rounded-full ${dotColorClass}`}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: i * 0.15 + 0.3 }}
              />
              <h4 className="font-display-xl-mobile text-[64px] text-on-surface-variant font-bold leading-none -mt-4 tracking-tighter group-hover:text-primary transition-colors duration-500">
                {year}
              </h4>
              <p className="font-quote-serif text-on-surface-variant group-hover:text-white transition-colors duration-500">"{title}"</p>
              
              {body && (
                <p className="font-body-md text-on-surface-variant mt-4 group-hover:translate-x-2 transition-transform duration-300">
                  {body}
                </p>
              )}
              
              {entries && (
                <ul className="flex flex-col gap-3 font-label-caps text-on-surface mt-4">
                  {entries.map(({ icon, label }) => (
                    <li key={label} className="flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                      <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
