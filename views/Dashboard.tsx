
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Pencil, X, Menu, Search, ArrowDown, Server } from 'lucide-react';
import { DashboardWidgetComponent } from '../components/DashboardWidgets';
import { HeroVideoCard } from '../components/HeroVideoCard';
import { AddCardSheet } from '../components/AddCardSheet';
import { SearchSheet } from '../components/SearchSheet';
import { SystemHealthCard, ServiceHealthCard, DiskStatsCard, NetworkStatsCard } from '../components/ServerStats';
import { DashboardWidget, WidgetDefinition, DashboardContext, MediaItem, MediaType, ServerStat, DownloadQueueItem, ServiceStatus, LibraryType } from '../types';
import { DEFAULT_LAYOUTS, THEME_COLORS } from '../constants';
import { HydraApi } from '../services/api';

// Helper to map Outlet context for drawer toggling
interface DashboardProps {
    onOpenLeftDrawer: () => void;
    onOpenRightDrawer: () => void;
    leftDrawerOpen?: boolean;
    rightDrawerOpen?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenLeftDrawer, onOpenRightDrawer }) => {
  const location = useLocation();
  
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Real Data State
  const [diskStats, setDiskStats] = useState<ServerStat[]>([]);
  const [queue, setQueue] = useState<DownloadQueueItem[]>([]);
  const [recentMedia, setRecentMedia] = useState<MediaItem[]>([]);
  const [heroItem, setHeroItem] = useState<MediaItem | undefined>(undefined);
  const [servicesStatus, setServicesStatus] = useState<ServiceStatus[]>([]);

  // --- Context Logic ---
  const getContext = (): DashboardContext => {
    if (location.pathname.startsWith('/movies')) return DashboardContext.MOVIES;
    if (location.pathname.startsWith('/tv')) return DashboardContext.TV;
    if (location.pathname.startsWith('/music')) return DashboardContext.MUSIC;
    if (location.pathname.startsWith('/books')) return DashboardContext.BOOKS;
    if (location.pathname.startsWith('/server')) return DashboardContext.SERVER;
    return DashboardContext.MOVIES;
  };
  const context = getContext();
  const storageKey = `hydra360_layout_${context}`;

  // --- Data Fetching ---
  useEffect(() => {
      const loadDashboardData = async () => {
          // Load Disk Space - Safe
          try {
              const disks = await HydraApi.getDiskSpace();
              if (disks.length > 0) setDiskStats(disks);
          } catch (e) { /* Silent Fail */ }

          // Load Queue - Safe
          try {
              const q = await HydraApi.getQueue();
              setQueue(q);
          } catch (e) { /* Silent Fail */ }

          // Load Services Health - Safe
          if (context === DashboardContext.SERVER) {
              try {
                  const statuses = await HydraApi.getServicesStatus();
                  setServicesStatus(statuses);
              } catch (e) { /* Silent Fail */ }
          }

          // Load Recent Items (Hero) - Safe
          let items: MediaItem[] = [];
          try {
             if (context === DashboardContext.MOVIES) {
                 items = await HydraApi.getLibrary(LibraryType.RADARR);
             } else if (context === DashboardContext.TV) {
                 items = await HydraApi.getLibrary(LibraryType.SONARR);
             }
             
             if (items.length > 0) {
                // Sort by added date desc
                const sorted = items.sort((a, b) => (new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime()));
                setRecentMedia(sorted.slice(0, 10));
                setHeroItem(sorted[0]); // Use most recent as hero
             }
          } catch (e) {
              // If Radarr/Sonarr connection fails, just don't show Hero/Recent
              setRecentMedia([]);
              setHeroItem(undefined);
          }
      };
      
      loadDashboardData();
      // Refresh every 30s
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
  }, [context]);

  
  // Determine Accent Color based on Context or Hero
  const getAccentColor = () => {
      switch(context) {
          case DashboardContext.SERVER: return THEME_COLORS.SERVER.primary;
          case DashboardContext.MOVIES: return THEME_COLORS.RADARR.primary;
          case DashboardContext.TV: return THEME_COLORS.SONARR.primary;
          case DashboardContext.MUSIC: return THEME_COLORS.LIDARR.primary;
          case DashboardContext.BOOKS: return THEME_COLORS.READARR.primary;
          default: return heroItem?.dominantColor || THEME_COLORS.RADARR.primary;
      }
  };
  const accentColor = getAccentColor();

  // --- Effects ---
  useEffect(() => {
    setIsEditMode(false); 
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setWidgets(JSON.parse(saved));
    } else {
      const defaults = DEFAULT_LAYOUTS[context] || [];
      setWidgets(defaults.map((w, i) => ({ ...w, id: `default-${context}-${i}` })));
    }
  }, [context]);

  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(widgets));
    }
  }, [widgets, storageKey]);

  // --- Handlers ---
  const handleAddWidget = (def: WidgetDefinition) => {
    setWidgets([...widgets, { id: `widget-${Date.now()}`, type: def.type, source: def.source }]);
  };
  const handleRemoveWidget = (id: string) => setWidgets(widgets.filter(w => w.id !== id));

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

    const newWidgets = [...widgets];
    const [draggedItem] = newWidgets.splice(draggedItemIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedItem);
    
    setWidgets(newWidgets);
    setDraggedItemIndex(null);
  };

  // --- Ambilight Background ---
  const backgroundStyle = {
      background: `radial-gradient(circle at 50% -10%, ${accentColor}66 0%, ${accentColor}22 35%, #0B0F19 70%)`
  };

  // "Recently Downloaded" Carousel (Using Real Data)
  const RecentlyDownloaded = () => {
      if (recentMedia.length === 0) return null;
      return (
          <div className="mt-6">
              <div className="flex items-center gap-2 mb-3 px-2">
                  <div className="w-1 h-4 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }} />
                  <h3 className="text-white font-bold text-lg">Récemment Ajouté</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1">
                  {recentMedia.map(item => (
                      <div key={item.id} className="flex-shrink-0 w-32 group">
                          <div className="aspect-[2/3] rounded-xl overflow-hidden relative mb-2 shadow-lg border border-white/5 group-hover:border-white/20 transition-colors">
                              <img src={item.posterUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-bold border border-white/10">
                                  {item.rating}
                              </div>
                          </div>
                          <div className="text-xs font-medium text-gray-300 truncate group-hover:text-white transition-colors">{item.title}</div>
                      </div>
                  ))}
              </div>
          </div>
      )
  };

  // --- Special Layout for Server Context ---
  const renderServerLayout = () => {
      return (
        <div className="pt-32 px-4 pb-24">
             {/* System Header */}
             <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                     <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Server size={28} />
                        </div>
                        Centre Système
                     </h1>
                     <p className="text-gray-400 text-sm ml-1 mt-1 font-mono opacity-70">Vue d'ensemble</p>
                 </div>
                 <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-3 w-fit">
                     <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50" />
                     </div>
                     <span className="text-sm font-bold text-emerald-400">Système Actif</span>
                 </div>
             </div>

             {/* Bento Grid Layout */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                 
                 {/* Col 1: Disk Usage (Real Data) */}
                 <div className="lg:col-span-1 min-h-[280px]">
                     <DiskStatsCard stats={diskStats} />
                 </div>

                 {/* Col 2: System Health (Compact) */}
                 <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="min-h-[160px] sm:col-span-1 lg:col-span-1">
                        <SystemHealthCard />
                    </div>
                    
                    {/* Network - Spans remaining space or full width on mobile */}
                    <div className="min-h-[200px] sm:col-span-2 lg:col-span-1 lg:row-span-2">
                        <NetworkStatsCard queue={queue} />
                    </div>

                     {/* Services - Full width bottom of this sub-grid */}
                    <div className="sm:col-span-2">
                        <ServiceHealthCard services={servicesStatus} />
                    </div>
                 </div>
             </div>
        </div>
      );
  };

  return (
    <div 
        className="min-h-screen relative pb-24 origin-center bg-[#0B0F19]"
    >
      
      {/* Ambilight Background - Absolute to move with container */}
      <div className="absolute inset-0 z-[-1] transition-all duration-1000 ease-in-out" style={backgroundStyle} />
      <div className="absolute inset-0 z-[-1] bg-noise opacity-30 pointer-events-none" />
      <div className="absolute inset-0 z-[-1] bg-black/20 backdrop-blur-[2px]" />

      {/* Floating Header - Invisible/Transparent */}
      <div className="absolute top-0 left-0 right-0 z-50">
          <div className="h-16 md:h-20 flex items-center px-4 justify-between">
              <button 
                onClick={onOpenLeftDrawer}
                className="p-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
              >
                  <Menu size={24} />
              </button>

              <div className="flex-1 mx-4 max-w-md">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center px-4 gap-2 border border-white/10 text-white/70 hover:bg-white/15 transition-colors group"
                  >
                      <Search size={16} className="group-hover:text-white transition-colors" />
                      <span className="text-sm font-medium truncate">Rechercher Films, Séries...</span>
                  </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                    onClick={onOpenRightDrawer}
                    className="p-2 text-white/90 hover:bg-white/10 rounded-full relative transition-colors"
                >
                    <ArrowDown size={24} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border border-[#0B0F19]" />
                </button>
                {context !== DashboardContext.SERVER && (
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`p-2 rounded-full transition-all duration-300 ${isEditMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-white/90 hover:bg-white/10'}`}
                    >
                        {isEditMode ? <X size={20} /> : <Pencil size={20} />}
                    </button>
                )}
              </div>
          </div>
      </div>

      {/* Main Content Logic */}
      <div className="relative z-10">
          {context === DashboardContext.SERVER ? (
              renderServerLayout()
          ) : (
              <>
                  {/* Hero Section */}
                  {!isEditMode && heroItem && (
                      <div className="relative z-0">
                          <HeroVideoCard item={heroItem} />
                      </div>
                  )}
                  
                  {/* Default Dashboard Grid */}
                  <div className={`px-4 relative z-20 ${heroItem ? 'mt-2' : 'mt-20'}`}>
                      
                      {!isEditMode && (
                          <RecentlyDownloaded />
                      )}

                      {isEditMode && (
                          <div 
                            className={`mb-6 p-6 rounded-[24px] border backdrop-blur-md shadow-lg mt-24`}
                            style={{ 
                              backgroundColor: `${accentColor}15`,
                              borderColor: `${accentColor}30`
                            }}
                          >
                              <h3 className="text-white font-bold text-lg mb-1">Configurer votre Dashboard</h3>
                              <p className="text-gray-300 text-sm">Glissez-déposez les cartes pour réorganiser.</p>
                          </div>
                      )}

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {widgets.map((widget, index) => (
                              <div 
                                  key={widget.id}
                                  draggable={isEditMode}
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragOver={(e) => handleDragOver(e, index)}
                                  onDrop={(e) => handleDrop(e, index)}
                                  className={`
                                      relative rounded-[24px] transition-all duration-300 h-[220px]
                                      ${isEditMode ? 'scale-[0.98] ring-2 cursor-move hover:bg-white/5' : ''}
                                      ${draggedItemIndex === index ? 'opacity-50' : 'opacity-100'}
                                  `}
                                  style={{
                                    borderColor: isEditMode ? accentColor : 'transparent',
                                    '--tw-ring-color': isEditMode ? accentColor : 'transparent'
                                  } as React.CSSProperties}
                              >
                                  <DashboardWidgetComponent type={widget.type} context={context} />
                                  {isEditMode && (
                                      <button 
                                          onClick={() => handleRemoveWidget(widget.id)}
                                          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-md z-10 hover:bg-rose-600 transition-colors"
                                      >
                                          <X size={16} />
                                      </button>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              </>
          )}
      </div>

      {isEditMode && context !== DashboardContext.SERVER && (
        <div className="fixed bottom-28 right-6 z-50 animate-slide-up-fade">
            <button 
                onClick={() => setIsAddSheetOpen(true)}
                className="flex items-center gap-2 px-6 py-4 text-black rounded-2xl shadow-xl transition-transform hover:scale-105 font-bold"
                style={{ backgroundColor: accentColor, boxShadow: `0 10px 25px -5px ${accentColor}66` }}
            >
                <Plus size={24} />
                <span className="text-black">Ajouter Carte</span>
            </button>
        </div>
      )}

      <AddCardSheet 
        isOpen={isAddSheetOpen} 
        onClose={() => setIsAddSheetOpen(false)} 
        onAdd={handleAddWidget} 
      />

      <SearchSheet 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};
