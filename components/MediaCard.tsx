import React from 'react';
import { MediaItem, Status } from '../types';
import { Check, Clock, Download, AlertCircle, HardDrive } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  compact?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, compact = false }) => {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.DOWNLOADED: return 'bg-emerald-500';
      case Status.MISSING: return 'bg-rose-500';
      case Status.DOWNLOADING: return 'bg-indigo-500';
      case Status.MONITORING: return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case Status.DOWNLOADED: return <Check size={12} />;
      case Status.MISSING: return <AlertCircle size={12} />;
      case Status.DOWNLOADING: return <Download size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className={`relative group overflow-hidden rounded-2xl bg-gray-800 shadow-lg transition-transform hover:scale-105 ${compact ? 'w-36' : 'w-full sm:w-48'}`}>
      {/* Poster Image */}
      <div className={`relative ${compact ? 'h-52' : 'h-72'} w-full`}>
        <img 
          src={item.posterUrl} 
          alt={item.title} 
          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
        
        {/* Top Right Status Badge */}
        <div className={`absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full text-white shadow-md ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
        </div>

        {/* Progress Bar if downloading */}
        {item.status === Status.DOWNLOADING && item.progress !== undefined && (
           <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
              <div className="h-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
           </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-3">
        <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
        <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">{item.year}</span>
            {item.rating > 0 && (
                <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                    ★ {item.rating.toFixed(1)}
                </span>
            )}
        </div>
        {!compact && item.quality && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 border border-gray-700 rounded px-1.5 py-0.5 w-fit bg-gray-900/50 backdrop-blur-sm">
                <HardDrive size={10} />
                {item.quality}
            </div>
        )}
      </div>
    </div>
  );
};