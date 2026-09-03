import React from 'react';

export const ContentCardSkeleton = () => (
  <div className="flex-none w-36 sm:w-48 md:w-56 rounded-xl bg-brand-card overflow-hidden animate-pulse border border-brand-border/40">
    <div className="aspect-[2/3] bg-slate-800/60 w-full"></div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-800 rounded w-1/3"></div>
        <div className="h-3 bg-slate-800 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative w-full h-[70vh] min-h-[480px] max-h-[750px] bg-slate-900 animate-pulse flex items-end p-8 md:p-16">
    <div className="max-w-2xl space-y-4 w-full">
      <div className="h-6 bg-slate-800 rounded w-32"></div>
      <div className="h-10 bg-slate-800 rounded w-3/4"></div>
      <div className="h-4 bg-slate-800 rounded w-full"></div>
      <div className="h-4 bg-slate-800 rounded w-2/3"></div>
      <div className="flex gap-4 pt-4">
        <div className="h-12 bg-slate-800 rounded-lg w-32"></div>
        <div className="h-12 bg-slate-800 rounded-lg w-36"></div>
      </div>
    </div>
  </div>
);
