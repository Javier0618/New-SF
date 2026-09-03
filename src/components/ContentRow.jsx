import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard } from './ContentCard';
import { ContentCardSkeleton } from './Skeletons';

export const ContentRow = ({ title, items, loading, onPlay }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!loading && (!items || items.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-3 my-6 relative group/row">
      {title && (
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide px-4 sm:px-8 flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 bg-brand-red rounded-full inline-block"></span>
          {title}
        </h2>
      )}

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
          aria-label="Scroll Izquierda"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Content Items Scroll Container */}
        <div
          ref={rowRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-8 py-2"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <ContentCardSkeleton key={index} />)
            : items.map((item) => (
                <ContentCard key={item.id} item={item} onPlay={onPlay} />
              ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
          aria-label="Scroll Derecha"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>
    </div>
  );
};
