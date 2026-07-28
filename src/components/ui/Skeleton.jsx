import React from 'react';

export const MasonrySkeleton = () => {
  // A few predefined heights to mimic the masonry brick layout
  const skeletonHeights = [
    'h-[300px]', 'h-[400px]', 'h-[350px]', 'h-[450px]', 'h-[320px]',
    'h-[380px]', 'h-[420px]', 'h-[300px]', 'h-[460px]', 'h-[340px]'
  ];

  return (
    <div className="w-full columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {skeletonHeights.map((height, index) => (
        <div 
          key={index} 
          className={`w-full ${height} bg-white/[0.03] rounded-2xl animate-pulse break-inside-avoid shadow-[0px_18px_80px_-32px_rgba(0,0,0,0.25)] border border-white/[0.05]`}
        />
      ))}
    </div>
  );
};

export const TimelineSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto relative py-12 px-4 md:px-0">
      {/* Timeline spine */}
      <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/[0.05] md:-translate-x-1/2" />
      
      {[1, 2, 3].map((_, index) => (
        <div key={index} className={`relative flex items-center justify-between mb-16 md:mb-24 w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          {/* Timeline Node */}
          <div className="absolute left-[15px] md:left-1/2 w-[20px] h-[20px] bg-white/[0.05] rounded-full border-[3px] border-[#0a0a0a] md:-translate-x-1/2 animate-pulse" />
          
          {/* Skeleton Card */}
          <div className="w-[calc(100%-48px)] md:w-[45%] ml-[48px] md:ml-0 bg-white/[0.02] border border-white/[0.05] p-6 md:p-8 rounded-2xl animate-pulse flex flex-col gap-4">
            <div className="h-4 bg-white/[0.08] rounded w-1/3" />
            <div className="h-8 bg-white/[0.08] rounded w-3/4" />
            <div className="h-16 bg-white/[0.08] rounded w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};
