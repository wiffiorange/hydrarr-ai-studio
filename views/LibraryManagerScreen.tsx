
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Menu, Search, Clock, Plus, Filter, MoreVertical, Star, HardDrive, ArrowDown, Music, Book, User, WifiOff, RefreshCw } from 'lucide-react';
import { LibraryType, MediaType, Status, ToolTab, MediaItem } from '../types';
import { THEME_COLORS } from '../constants';
import { ActivityQueueSheet, SmartFilterSheet, FabActionSheet, ItemOptionsSheet } from '../components/LibrarySheets';
import { HydraApi } from '../services/api';

// --- Themes Configuration (Linked to Constants) ---
const THEMES = {
    [LibraryType.RADARR]: {
        primary: THEME_COLORS.RADARR.primary,
        secondary: THEME_COLORS.RADARR.secondary,
        gradient: `radial-gradient(circle at 50% -20%, ${THEME_COLORS.RADARR.primary}26 0%, ${THEME_COLORS.RADARR.secondary}1A 40%, #0B0F19 80%)`,
        accentClass: THEME_COLORS.RADARR.accentClass,
    },
    [LibraryType.SONARR]: {
        primary: THEME_COLORS.SONARR.primary,
        secondary: THEME_COLORS.SONARR.secondary,
        gradient: `radial-gradient(circle at 50% -20%, ${THEME_COLORS.SONARR.primary}26 0%, ${THEME_COLORS.SONARR.secondary}1A 40%, #0B0F19 80%)`,
        accentClass: THEME_COLORS.SONARR.accentClass,
    },
    [LibraryType.LIDARR]: {
        primary: THEME_COLORS.LIDARR.primary,
        secondary: THEME_COLORS.LIDARR.secondary,
        gradient: `radial-gradient(circle at 50% -20%, ${THEME_COLORS.LIDARR.primary}26 0%, ${THEME_COLORS.LIDARR.secondary}1A 40%, #0B0F19 80%)`,
        accentClass: THEME_COLORS.LIDARR.accentClass,
    },
    [LibraryType.READARR]: {
        primary: THEME_COLORS.READARR.primary,
        secondary: THEME_COLORS.READARR.secondary,
        gradient: `radial-gradient(circle at 50% -20%, ${THEME_COLORS.READARR.primary}26 0%, ${THEME_COLORS.READARR.secondary}1A 40%, #0B0F19 80%)`,
        accentClass: THEME_COLORS.READARR.accentClass,
    }
};

// --- Memoized List Item Component for Performance ---
const LibraryListItem = React.memo(({ 
  item, 
  getStatusColor, 
  onSelect,
  theme
}: { 
  item: MediaItem, 
  getStatusColor: (s: Status) => string, 
  onSelect: (i: MediaItem) => void,
  theme: any
}) => {
  const isMusic = item.type === MediaType.MUSIC;
  
  const imageContainerClass = isMusic 
    ? "w-[100px] h-[100px]" // Square for music
    : "w-[100px] h-[140px]"; // Portrait for others
  
  const renderSubtitle = () => {
      if (item.type === MediaType.MUSIC && item.artist) {
          return <span className="flex items-center gap-1"><User size={10} /> {item.artist}</span>;
      }
      if (item.type === MediaType.BOOK && item.author) {
          return <span className="flex items-center gap-1"><User size={10} /> {item.author}</span>;
      }
      return <span>{item.year}</span>;
  };

  const renderDetail = () => {
    if (item.type === MediaType.SERIES) {
        return (
            <span className="bg-[#252525] px-1.5 py-0.5 rounded text-[10px] border border-white/5">
                {item.seasonCount || 1} Saisons
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 bg-[#252525] px-1.5 py-0.5 rounded text-[10px] border border-white/5">
            <HardDrive size={10} /> {item.quality || 'Inconnu'}
        </span>
    );
  };

  return (
    <div 
        className={`bg-[#1A1A1A]/80 backdrop-blur-md rounded-[16px] p-0 flex overflow-hidden shadow-lg relative group border border-white/5 active:scale-[0.98] transition-all duration-200 hover:border-opacity-50 hover:bg-[#202020]`}
        style={{ 
            contentVisibility: 'auto', 
            containIntrinsicSize: isMusic ? '100px' : '140px',
            borderColor: 'rgba(255,255,255,0.05)'
        }}
    >
        {/* Subtle hover glow based on theme */}
        <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: `linear-gradient(90deg, ${theme.primary}08 0%, transparent 100%)` }}
        />

        <div className={`${imageContainerClass} flex-shrink-0 relative bg-gray-800 overflow-hidden`}>
            {item.posterUrl ? (
                 <img 
                    src={item.posterUrl} 
                    alt={item.title} 
                    loading="lazy" 
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600">
                    <Filter size={24} />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="flex-1 p-3 flex flex-col justify-center min-w-0 relative z-10">
            <div className="flex justify-between items-start">
                <h3 className="text-white font-bold text-[15px] leading-tight truncate pr-8 drop-shadow-sm group-hover:text-white transition-colors">{item.title}</h3>
            </div>
            
            <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                }}
            >
                <MoreVertical size={18} />
            </button>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-medium">
                {renderSubtitle()}
                <span>•</span>
                <span className={`flex items-center gap-1 ${item.rating > 8 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    <Star size={10} fill={item.rating > 8 ? "currentColor" : "none"} /> {item.rating.toFixed(1)}
                </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/30 ${getStatusColor(item.status)}`}>
                    {item.status}
                    </span>
            </div>

            <div className="mt-auto flex items-end justify-between">
                <div className="text-xs text-gray-500 font-medium flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                   {renderDetail()}
                </div>
                {item.size && (
                    <span className="text-[10px] text-gray-600 font-mono bg-black/20 px-1 rounded">{item.size}</span>
                )}
            </div>
        </div>
    </div>
  );
});

interface LibraryManagerScreenProps {
  type: LibraryType;
  onOpenLeftDrawer: () => void;
  onOpenRightDrawer: () => void;
  leftDrawerOpen?: boolean;
  rightDrawerOpen?: boolean;
}

export const LibraryManagerScreen: React.FC<LibraryManagerScreenProps> = ({ 
  type, 
  onOpenLeftDrawer, 
  onOpenRightDrawer,
}) => {
  const theme = useMemo(() => THEMES[type] || THEMES[LibraryType.SONARR], [type]);

  // --- State ---
  const tabs: ToolTab[] = ['Tout', 'À venir', 'Manquant', 'Historique'];
  const [activeTab, setActiveTab] = useState<ToolTab>('Tout');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real Data State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showActivityQueue, setShowActivityQueue] = useState(false);
  const [showSmartFilter, setShowSmartFilter] = useState(false);
  const [showFabActions, setShowFabActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [visibleLimit, setVisibleLimit] = useState(20);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRAF = useRef<number | null>(null);

  // --- Load Data from API ---
  const loadLibrary = async () => {
      setIsLoading(true);
      setError(false);
      try {
          const items = await HydraApi.getLibrary(type);
          setMediaItems(items);
      } catch (e) {
          // console.error(e); // Suppressed to avoid noise on expected connection failures
          setError(true); // Connection failure
          setMediaItems([]);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      loadLibrary();
  }, [type]);

  // --- Filter Logic ---
  const filteredMedia = useMemo(() => {
      let items = mediaItems;
      
      switch(activeTab) {
          case 'Manquant': items = items.filter(m => m.status === Status.MISSING); break;
          case 'À venir': items = items.filter(m => m.status === Status.MONITORING); break; 
          case 'Téléchargé': items = items.filter(m => m.status === Status.DOWNLOADED); break;
          default: break;
      }

      if (searchQuery) {
          items = items.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return items;
  }, [mediaItems, searchQuery, activeTab]);

  const getStatusColor = useCallback((status: Status) => {
    switch (status) {
      case Status.DOWNLOADED: return 'text-emerald-400 bg-emerald-500/10';
      case Status.MISSING: return 'text-rose-400 bg-rose-500/10';
      case Status.DOWNLOADING: return 'text-indigo-400 bg-indigo-500/10';
      case Status.MONITORING: return 'text-amber-400 bg-amber-500/10';
      case Status.ENDED: return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  }, []);

  // --- Scroll Handler for Infinite Scroll/Performance ---
  useEffect(() => {
      const handleScroll = () => {
          if (!containerRef.current) return;
          
          if (scrollRAF.current) return;
          
          scrollRAF.current = requestAnimationFrame(() => {
              const { scrollTop, scrollHeight, clientHeight } = containerRef.current!;
              if (scrollTop + clientHeight > scrollHeight - 500) {
                   setVisibleLimit(prev => Math.min(prev + 20, filteredMedia.length));
              }
              scrollRAF.current = null;
          });
      };

      const ref = containerRef.current;
      if (ref) ref.addEventListener('scroll', handleScroll);
      return () => {
          if (ref) ref.removeEventListener('scroll', handleScroll);
          if (scrollRAF.current) cancelAnimationFrame(scrollRAF.current);
      };
  }, [filteredMedia]);

  // --- Gesture Logic (Horizontal Tabs) ---
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(diff) > 50) {
          const currentIndex = tabs.indexOf(activeTab);
          if (diff > 0 && currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
          if (diff < 0 && currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
      }
      touchStartX.current = null;
  };

  return (
    <div 
        className="h-screen flex flex-col relative bg-[#0B0F19] overflow-hidden"
        style={{ background: theme.gradient }}
    >
        {/* Ambience */}
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        
        {/* --- HEADER --- */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2 flex items-center justify-between relative z-20">
             <div className="flex items-center gap-3">
                 <button onClick={onOpenLeftDrawer} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/5">
                     <Menu size={22} />
                 </button>
                 <div>
                     <h1 className={`text-2xl font-black text-white tracking-tight leading-none flex items-center gap-2 ${theme.accentClass}`}>
                        {type} 
                        <div className={`w-2 h-2 rounded-full animate-pulse bg-current`} />
                     </h1>
                     <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5 opacity-70">Media Manager</p>
                 </div>
             </div>

             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setShowActivityQueue(true)}
                    className="p-2.5 bg-[#1F1F1F] rounded-full text-gray-400 hover:text-white border border-white/5 transition-colors relative"
                 >
                     <Clock size={20} />
                     <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-[#1F1F1F]" />
                 </button>
                 <button onClick={onOpenRightDrawer} className="p-2.5 bg-[#1F1F1F] rounded-full text-gray-400 hover:text-white border border-white/5 transition-colors">
                     <ArrowDown size={20} />
                 </button>
             </div>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="flex-shrink-0 px-4 py-3 relative z-20 space-y-3">
             <div className="flex gap-2">
                 <div className={`flex-1 h-12 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl border ${isSearchFocused ? 'border-white/20 shadow-lg' : 'border-white/5'} flex items-center px-4 transition-all duration-300`}>
                     <Search size={18} className={`${isSearchFocused ? 'text-white' : 'text-gray-500'} transition-colors`} />
                     <input 
                        type="text"
                        placeholder="Rechercher..."
                        className="bg-transparent border-none outline-none text-white text-sm ml-3 w-full placeholder-gray-600"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                 </div>
                 <button 
                    onClick={() => setShowSmartFilter(true)}
                    className="w-12 h-12 rounded-2xl bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-95"
                 >
                     <Filter size={20} />
                 </button>
             </div>

             {/* Tabs */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                 {tabs.map(tab => {
                     const isActive = activeTab === tab;
                     return (
                         <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                                isActive 
                                ? `bg-white text-black border-white shadow-lg shadow-white/10` 
                                : 'bg-[#1A1A1A]/50 text-gray-400 border-white/5 hover:bg-[#1A1A1A]'
                            }`}
                         >
                             {tab}
                         </button>
                     )
                 })}
             </div>
        </div>

        {/* --- CONTENT LIST --- */}
        <div 
            className="flex-1 overflow-y-auto px-4 pb-28 space-y-3 relative z-10 no-scrollbar"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-800/30 rounded-2xl animate-pulse" />
                ))
            ) : error ? (
                // Connection Error State
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <WifiOff size={40} className="text-rose-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Connexion Impossible</h2>
                    <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                        Impossible de joindre {type}. Vérifiez l'URL, la clé API et les réglages CORS dans les Paramètres.
                    </p>
                    <button 
                        onClick={loadLibrary}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={16} /> Réessayer
                    </button>
                </div>
            ) : filteredMedia.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                    <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                         <Filter size={32} className="opacity-50" />
                    </div>
                    <p className="font-medium text-sm">Bibliothèque Vide</p>
                    <p className="text-xs text-gray-600 mt-1">Aucun élément trouvé pour "{activeTab}"</p>
                </div>
            ) : (
                // List
                filteredMedia.slice(0, visibleLimit).map((item) => (
                    <LibraryListItem 
                        key={item.id} 
                        item={item} 
                        getStatusColor={getStatusColor}
                        onSelect={setSelectedItem}
                        theme={theme}
                    />
                ))
            )}
        </div>

        {/* --- FAB --- */}
        <div className="absolute bottom-24 right-4 z-30">
            <button 
                onClick={() => setShowFabActions(true)}
                className="w-14 h-14 rounded-full shadow-2xl shadow-black/50 flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-90"
                style={{ backgroundColor: theme.primary }}
            >
                <Plus size={28} />
            </button>
        </div>

        {/* --- SHEETS --- */}
        <ActivityQueueSheet 
            isOpen={showActivityQueue} 
            onClose={() => setShowActivityQueue(false)} 
            accentColor={theme.primary}
        />
        <SmartFilterSheet 
            isOpen={showSmartFilter} 
            onClose={() => setShowSmartFilter(false)} 
            accentColor={theme.primary}
        />
        <FabActionSheet 
            isOpen={showFabActions}
            onClose={() => setShowFabActions(false)}
            type={type}
            accentColor={theme.primary}
        />
        <ItemOptionsSheet 
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            item={selectedItem}
        />
    </div>
  );
};
