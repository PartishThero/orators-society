import React from 'react';

export const MasonrySkeleton = () => {
  // Column spans out of 5: 3, 2 | 2, 3 | 5
  const rows = [
    [
      { span: 3, height: 'h-[420px]' },
      { span: 2, height: 'h-[420px]' },
    ],
    [
      { span: 2, height: 'h-[380px]' },
      { span: 3, height: 'h-[380px]' },
    ],
    [
      { span: 5, height: 'h-[300px]' },
    ],
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="w-full grid grid-cols-5 gap-3">
          {row.map((card, cardIdx) => (
            <div
              key={cardIdx}
              className={`${card.height} bg-white/[0.03] rounded-2xl animate-pulse border border-white/[0.05] shadow-[0px_18px_80px_-32px_rgba(0,0,0,0.25)]`}
              style={{ gridColumn: `span ${card.span}` }}
            />
          ))}
        </div>
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
