
import React from 'react';
import { MOCK_MEDIA, MOCK_QUEUE, MOCK_SERVER_STATS, THEME_COLORS } from '../constants';
import { WidgetType, Status, MediaType, DashboardContext } from '../types';
import { Activity, HardDrive, Film, Tv, Download, TrendingUp, Calendar, Music, BookOpen, Zap } from 'lucide-react';
import { DiskStatsCard, useSimulatedQueue } from './ServerStats';

interface WidgetProps {
  type: WidgetType;
  context?: DashboardContext;
}

export const DashboardWidgetComponent: React.FC<WidgetProps> = ({ type, context }) => {
  switch (type) {
    case WidgetType.RADARR_RECENT:
      return <MediaListWidget title="Récemment Ajoutés" icon={Film} color={THEME_COLORS.RADARR.accentClass} filter={(m: any) => m.type === MediaType.MOVIE && m.status === Status.DOWNLOADED} />;
    case WidgetType.RADARR_CINEMA:
      return <MediaListWidget title="Au Cinéma" icon={Film} color={THEME_COLORS.RADARR.accentClass} filter={(m: any) => m.type === MediaType.MOVIE && m.status === Status.MISSING} vertical />;
    case WidgetType.SONARR_UPCOMING:
      return <UpcomingEpisodesWidget />;
    case WidgetType.SONARR_ON_AIR:
      return <MediaListWidget title="Diffusé Aujourd'hui" icon={Tv} color={THEME_COLORS.SONARR.accentClass} filter={(m: any) => m.type === MediaType.SERIES && m.status === Status.MONITORING} />;
    case WidgetType.LIDARR_RECENT:
      return <MediaListWidget title="Albums Récents" icon={Music} color={THEME_COLORS.LIDARR.accentClass} filter={(m: any) => m.type === MediaType.MUSIC} square />;
    case WidgetType.SERVER_DISK:
      // Use the enhanced component for real-time stats
      return (
          <div className="h-full">
             <DiskStatsCard stats={MOCK_SERVER_STATS} />
          </div>
      );
    case WidgetType.QUEUE_MINI:
      return <QueueMiniWidget context={context} />;
    case WidgetType.TRAKT_TRENDING:
      return <MediaListWidget title="Tendances Trakt" icon={TrendingUp} color="text-rose-400" filter={(m: any) => m.rating > 8.5} />;
    default:
      return <div className="p-4 text-gray-500 text-xs">Widget {type} placeholder</div>;
  }
};

const WidgetContainer: React.FC<{ title: string; icon: React.ElementType; color: string; children: React.ReactNode; headerRight?: React.ReactNode }> = ({ title, icon: Icon, color, children, headerRight }) => (
  <div className="bg-[#1F2937] rounded-[24px] overflow-hidden h-full flex flex-col shadow-lg border border-white/5">
    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
            <Icon size={14} className={color} />
          </div>
          <h3 className="text-sm font-bold text-gray-200">{title}</h3>
      </div>
      {headerRight}
    </div>
    <div className="flex-1 p-4 pt-0 overflow-hidden">
      {children}
    </div>
  </div>
);

// Generic Widget for Horizontal or Vertical Media Lists
const MediaListWidget = ({ title, icon, color, filter, vertical = false, square = false }: any) => {
    const items = MOCK_MEDIA.filter(filter).slice(0, 5);
    
    return (
        <WidgetContainer title={title} icon={icon} color={color}>
            {vertical ? (
                 <div className="flex flex-col gap-3 mt-2">
                 {items.slice(0, 3).map(m => (
                   <div key={m.id} className="flex items-center gap-3">
                      <img src={m.posterUrl} className={`${square ? 'w-12 h-12' : 'w-8 h-12'} rounded object-cover bg-gray-800`} />
                      <div className="min-w-0">
                         <h4 className="text-xs font-medium text-white truncate">{m.title}</h4>
                         <p className="text-[10px] text-gray-400">{m.artist || m.year}</p>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto no-scrollbar mt-2 pb-2">
                    {items.map(m => (
                    <div key={m.id} className={`relative flex-shrink-0 ${square ? 'w-20 aspect-square' : 'w-24 aspect-[2/3]'} rounded-xl overflow-hidden shadow-md group`}>
                        <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] font-medium text-white line-clamp-2 leading-tight">{m.title}</span>
                        </div>
                    </div>
                    ))}
                </div>
            )}
        </WidgetContainer>
    )
}

const UpcomingEpisodesWidget = () => {
  const shows = MOCK_MEDIA.filter(m => m.type === MediaType.SERIES).slice(0, 3);
  return (
    <WidgetContainer title="Calendrier Diffusions" icon={Tv} color={THEME_COLORS.SONARR.accentClass}>
      <div className="space-y-3 mt-2">
        {shows.map(s => (
          <div key={s.id} className="flex items-center justify-between">
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-1 h-8 bg-sky-500 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-200 truncate">{s.title}</h4>
                  <p className="text-[10px] text-gray-400">S02E04 • Demain</p>
                </div>
             </div>
             <span className="text-[10px] font-medium bg-gray-800 px-2 py-1 rounded-md text-blue-200">20:00</span>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};

const QueueMiniWidget = ({ context }: { context?: DashboardContext }) => {
  // 1. Filter initial queue based on Context
  const initialFiltered = React.useMemo(() => {
      if (context === DashboardContext.MOVIES) {
        return MOCK_QUEUE.filter(item => item.type === MediaType.MOVIE);
      } else if (context === DashboardContext.TV) {
        return MOCK_QUEUE.filter(item => item.type === MediaType.SERIES);
      } else if (context === DashboardContext.MUSIC) {
        return MOCK_QUEUE.filter(item => item.type === MediaType.MUSIC);
      } else if (context === DashboardContext.BOOKS) {
        return MOCK_QUEUE.filter(item => item.type === MediaType.BOOK);
      }
      return MOCK_QUEUE;
  }, [context]);

  // 2. Use Simulation Hook for Real-Time Updates
  const { queue: liveQueue, totalSpeed } = useSimulatedQueue(initialFiltered);

  const active = liveQueue.filter(q => q.status === 'Downloading');
  
  // Helper for titles in French
  const getContextTitle = () => {
      switch(context) {
          case DashboardContext.MOVIES: return 'Films';
          case DashboardContext.TV: return 'Séries';
          case DashboardContext.MUSIC: return 'Musique';
          case DashboardContext.BOOKS: return 'Livres';
          case DashboardContext.SERVER: return 'Serveur';
          default: return 'Globaux';
      }
  }

  const title = context ? `Téléchargements ${getContextTitle()}` : "Téléchargements";

  const speedHeader = totalSpeed > 0 ? (
      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
         <Zap size={10} /> {totalSpeed.toFixed(1)} MB/s
      </span>
  ) : null;

  return (
    <WidgetContainer title={title} icon={Download} color="text-indigo-400" headerRight={speedHeader}>
      {liveQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
           <Download size={24} className="opacity-20 mb-1" />
           <p className="text-[10px]">Aucun téléchargement</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-white tracking-tight">
                {active.length > 0 ? "En Cours" : "Inactif"}
            </div>
            <div className="text-[10px] text-gray-400 bg-gray-800 px-2 py-1 rounded-full flex items-center gap-1">
                <Activity size={10} /> {active.length} Actifs
            </div>
          </div>
          {active.slice(0, 1).map(item => (
            <div key={item.id} className="bg-gray-800/50 rounded-xl p-3 border border-white/5">
              <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-medium text-white truncate max-w-[120px]">{item.title}</h4>
                  <span className="text-[10px] text-indigo-300 font-mono">{item.speed}</span>
              </div>
              <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-700 ease-out" style={{ width: `${item.progress}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-500">{item.size}</span>
                  <span className="text-[9px] text-gray-400">{item.timeLeft} restants</span>
              </div>
            </div>
          ))}
           {/* Fallback if items exist but none active */}
           {liveQueue.length > 0 && active.length === 0 && (
               <div className="text-xs text-gray-500 text-center mt-2">
                   {liveQueue.length} éléments en file (pause/attente)
               </div>
           )}
        </>
      )}
    </WidgetContainer>
  );
};
