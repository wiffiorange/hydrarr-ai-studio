
import React, { useEffect, useRef, useState } from 'react';
import { MediaItem, MediaType } from '../types';
import { Play, Star, Eye } from 'lucide-react';

interface HeroVideoCardProps {
  item: MediaItem;
}

export const HeroVideoCard: React.FC<HeroVideoCardProps> = ({ item }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dashboard 2 Shrink Effect
  // Max height 65vh, shrinking to 40vh
  // Opacity fade on metadata
  const scale = Math.max(0.9, 1 - scrollY / 1000);
  const opacity = Math.max(0, 1 - scrollY / 300);
  const blur = Math.min(10, scrollY / 20);

  if (!item) return null;

  return (
    <div 
        className="relative w-full h-[65vh] rounded-b-[32px] overflow-hidden shadow-2xl z-0 transform-gpu origin-top"
        style={{ 
            transform: `scale(${scale})`,
            transition: 'transform 0.1s linear'
        }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {item.trailerUrl ? (
            <video
                src={item.trailerUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                poster={item.posterUrl}
                style={{ filter: `blur(${blur}px)` }}
            />
        ) : (
            <img 
                src={item.posterUrl} 
                alt={item.title} 
                className="w-full h-full object-cover"
                style={{ filter: `blur(${blur}px)` }}
            />
        )}
        
        {/* Top Gradient for Header Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/80 via-transparent to-transparent h-32 pointer-events-none" />

        {/* Advanced Gradient Overlay (Black to Transparent) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Overlay */}
      <div 
        className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col items-start justify-end z-10 pb-20 pointer-events-none"
        style={{ opacity }}
      >
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight drop-shadow-2xl tracking-tight">
            {item.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex items-center gap-4 text-gray-200 text-sm font-medium mb-2">
            <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-md px-2 py-0.5 rounded border border-yellow-500/30 text-yellow-400 font-bold">
                <Star size={12} fill="currentColor" /> {item.rating}
            </div>
            <span>{item.year}</span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1.5 text-gray-300">
                <Eye size={14} />
                <span>755 watching now</span>
            </div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-16 right-6 flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
