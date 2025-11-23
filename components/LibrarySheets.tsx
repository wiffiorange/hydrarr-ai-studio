
import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Clock, ChevronUp, Check, Search, Plus, Rss, Download, Sliders, Minus, Trash2, Settings } from 'lucide-react';
import { LibraryType, DownloadQueueItem, MediaItem } from '../types';
import { MOCK_QUEUE } from '../constants';

// --- Activity Queue Sheet ---

interface ActivityQueueProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

export const ActivityQueueSheet: React.FC<ActivityQueueProps> = ({ isOpen, onClose, accentColor }) => {
  const [expansionState, setExpansionState] = useState<'closed' | 'half' | 'full'>('closed');
  const [queue, setQueue] = useState<DownloadQueueItem[]>(MOCK_QUEUE);

  // Sync external isOpen with internal state
  useEffect(() => {
    if (isOpen && expansionState === 'closed') {
      setExpansionState('half');
    } else if (!isOpen) {
      setExpansionState('closed');
    }
  }, [isOpen]);

  // Drag Logic (Simulated with click areas for PWA as complex touch handling requires more boilerplate)
  const toggleExpansion = () => {
    if (expansionState === 'half') setExpansionState('full');
    else if (expansionState === 'full') setExpansionState('half');
  };

  const handleClose = () => {
    setExpansionState('closed');
    setTimeout(onClose, 300); // Wait for animation
  };

  if (expansionState === 'closed' && !isOpen) return null;

  const heightClass = expansionState === 'half' ? 'h-[50vh]' : expansionState === 'full' ? 'h-[95vh]' : 'h-0';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 bg-[#1E1E1E] rounded-t-[28px] z-50 transition-all duration-300 ease-out flex flex-col border-t border-white/5 shadow-2xl ${heightClass}`}>
        {/* Drag Handle Area */}
        <div 
            className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
            onClick={toggleExpansion}
        >
            <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-lg font-bold text-gray-200">File d'Activité</h2>
            <div className="flex gap-2">
                <button className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white">
                    <RefreshCw size={18} />
                </button>
                <button onClick={handleClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                    <Clock size={48} className="mb-3" />
                    <p className="text-sm font-medium">Aucune activité récente</p>
                </div>
            ) : (
                queue.map(item => (
                    <div key={item.id} className="bg-[#252525] p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                        <div className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                            <Download size={18} style={{ color: accentColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-200 truncate">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
                                </div>
                                <span className="text-xs text-gray-400 font-mono">{item.timeLeft}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </>
  );
};

// --- Smart Filter Sheet ---

interface SmartFilterProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

export const SmartFilterSheet: React.FC<SmartFilterProps> = ({ isOpen, onClose, accentColor }) => {
  const filters = [
    'Titre', 'Surveillé', 'Prochaine Diffusion', 'Date Ajout', 'Réseau', 'Taille Disque', 'Note', 'Statut'
  ];
  const [activeFilter, setActiveFilter] = useState('Titre');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] rounded-t-[28px] z-50 p-6 pb-8 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Activer Filtre Intelligent</h3>
            <div className="w-12 h-7 bg-gray-700 rounded-full p-1 flex items-center transition-colors" style={{ backgroundColor: accentColor }}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transform translate-x-5" />
            </div>
        </div>
        
        <div className="space-y-1">
            {filters.map(filter => (
                <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className="w-full flex items-center justify-between py-3.5 border-b border-white/5 last:border-0"
                >
                    <span className="text-gray-300 font-medium">{filter}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeFilter === filter ? 'border-transparent' : 'border-gray-600'}`} style={{ backgroundColor: activeFilter === filter ? accentColor : 'transparent' }}>
                        {activeFilter === filter && <div className="w-2 h-2 bg-[#121212] rounded-full" />}
                    </div>
                </button>
            ))}
        </div>
      </div>
    </>
  );
};

// --- FAB Action Sheet ---

interface FabActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    type: LibraryType;
    accentColor: string;
}

export const FabActionSheet: React.FC<FabActionSheetProps> = ({ isOpen, onClose, type, accentColor }) => {
    if (!isOpen) return null;

    const actions = [
        { icon: Plus, label: `Ajouter ${type === LibraryType.RADARR ? 'Film' : type === LibraryType.LIDARR ? 'Artiste' : type === LibraryType.READARR ? 'Auteur' : 'Série'}` },
        { icon: Search, label: 'Recherche Manuelle' },
        { icon: Sliders, label: 'Recherche Interactive' },
        { icon: Rss, label: 'Sync RSS' },
    ];

    return (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
          <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 animate-slide-up-fade">
              {actions.map((action, idx) => (
                  <button 
                    key={idx}
                    className="flex items-center gap-3 group"
                    onClick={onClose}
                  >
                      <span className="bg-[#1E1E1E] text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {action.label}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-[#1E1E1E] text-white border border-white/10 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors">
                          <action.icon size={20} style={{ color: accentColor }} />
                      </div>
                  </button>
              ))}
          </div>
        </>
    );
};

// --- Item Options Sheet ---

interface ItemOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem | null;
}

export const ItemOptionsSheet: React.FC<ItemOptionsSheetProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] rounded-t-[28px] z-[70] p-6 animate-slide-up border-t border-white/10">
        <div className="flex items-start gap-4 mb-8">
             <img src={item.posterUrl} alt={item.title} className="w-20 h-28 object-cover rounded-xl bg-gray-800 shadow-lg" />
             <div className="flex-1">
                 <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>
                 <p className="text-sm text-gray-400 mt-1">{item.year} • {item.status}</p>
                 {item.overview && (
                     <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.overview}</p>
                 )}
             </div>
             <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400">
                <X size={20} />
             </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
            <button className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-[20px] bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors text-indigo-400">
                    <Search size={24} />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Rech.</span>
            </button>
             <button className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-[20px] bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors text-emerald-400">
                    <RefreshCw size={24} />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Maj.</span>
            </button>
             <button className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-[20px] bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors text-amber-400">
                    <Settings size={24} />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-white">Modif.</span>
            </button>
             <button className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-[20px] bg-gray-800 group-hover:bg-rose-500/20 flex items-center justify-center transition-colors text-rose-500">
                    <Trash2 size={24} />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-rose-400">Suppr.</span>
            </button>
        </div>
        
        {/* More stats or actions */}
        <div className="space-y-2 border-t border-white/5 pt-4 mb-4">
             <div className="flex justify-between py-2 border-b border-white/5">
                 <span className="text-gray-500 text-sm">Profil</span>
                 <span className="text-white text-sm font-medium">{item.quality || 'Tous'}</span>
             </div>
             <div className="flex justify-between py-2">
                 <span className="text-gray-500 text-sm">Chemin</span>
                 <span className="text-white text-sm font-medium truncate max-w-[200px]">/media/{item.type}/{item.title}</span>
             </div>
        </div>
      </div>
    </>
  );
};
