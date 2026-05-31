export default function ArchitecturalGrid({ showHorizontal = false }) {
  return (
    <>
      {/* Continuous Vertical Line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/[0.08] -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
      
      {/* Crosshair markers on vertical line */}
      <div className="absolute top-1/4 left-1/2 w-4 h-[1px] bg-white/20 -translate-x-1/2 pointer-events-none hidden lg:block z-0" />
      <div className="absolute top-3/4 left-1/2 w-4 h-[1px] bg-white/20 -translate-x-1/2 pointer-events-none hidden lg:block z-0" />

      {showHorizontal && (
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.08] pointer-events-none hidden lg:block z-0" />
      )}
    </>
  )
}
