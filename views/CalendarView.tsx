
import React, { useState } from 'react';
import { MOCK_MEDIA } from '../constants';
import { MediaType, Status } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, Play, Clock, Menu, Search, ArrowDown, Pencil } from 'lucide-react';

interface CalendarViewProps {
    onOpenLeftDrawer?: () => void;
    onOpenRightDrawer?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenLeftDrawer, onOpenRightDrawer }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentDate);
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  const monthColors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', 
    '#22c55e', '#06b6d4', '#6366f1', '#d946ef', '#f43f5e', '#0ea5e9'
  ];
  const accentColor = monthColors[month % 12];

  const getEventsForDay = (day: number) => {
     const events = [];
     const dayHash = (day * 13) % 10;
     if (dayHash < 3) {
         const mediaIdx = (day * 7) % Math.max(1, MOCK_MEDIA.length);
         const item = MOCK_MEDIA[mediaIdx];
         if (item) events.push({ ...item, time: '20:00' });
     }
     if (day % 7 === 2) {
        events.push({ 
            id: 999 + day, title: "Severance", type: MediaType.SERIES, 
            status: Status.MONITORING, posterUrl: "https://image.tmdb.org/t/p/w500/p7f.jpg",
            time: '09:00', episode: 'S02E05'
        });
     }
     return events;
  };

  return (
    <div className="min-h-screen relative pb-24 overflow-hidden">
        
        {/* Ambilight Background - Absolute */}
        <div 
            className="absolute inset-0 z-0 transition-colors duration-1000"
            style={{
                background: `radial-gradient(circle at 20% 20%, ${accentColor}66 0%, #0B0F19 60%)`
            }}
        />
        <div className="absolute inset-0 z-0 bg-black/20 backdrop-blur-[2px]" />

        {/* Unified Header - Invisible */}
        <div className="relative z-30">
             <div className="h-16 md:h-20 flex items-center px-4 justify-between">
                 <button onClick={onOpenLeftDrawer} className="p-2 text-white/90 hover:bg-white/10 rounded-full">
                     <Menu size={24} />
                 </button>

                 <div className="flex-1 mx-4 max-w-md">
                     <div className="h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center px-4 gap-2 border border-white/10 text-white/70">
                         <Search size={16} />
                         <span className="text-sm font-medium">Rechercher Calendrier...</span>
                     </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <button onClick={onOpenRightDrawer} className="p-2 text-white/90 hover:bg-white/10 rounded-full relative">
                        <ArrowDown size={24} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border border-[#0B0F19]" />
                    </button>
                    <button className="p-2 text-white/90 hover:bg-white/10 rounded-full">
                        <Pencil size={20} />
                    </button>
                 </div>
             </div>
        </div>

        {/* Month Nav & Title */}
        <div className="relative z-10 px-6 py-6 flex items-center justify-between">
             <div>
                 <h1 className="text-3xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
                    {monthNames[month]} <span className="text-gray-500 text-2xl font-medium">{year}</span>
                 </h1>
                 <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <CalendarIcon size={14} style={{ color: accentColor }} />
                    Calendrier des sorties
                 </p>
             </div>
             
             <div className="flex gap-2">
                <button 
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/5 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/5 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
             </div>
        </div>

        {/* Calendar Grid */}
        <div className="relative z-10 px-4">
            <div className="bg-[#1A1A1A]/60 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                
                <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((d, i) => (
                        <div key={d} className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[100px] sm:auto-rows-[120px]">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-r border-b border-white/5 bg-black/10" />
                    ))}

                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const events = getEventsForDay(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === month;
                        const isSelected = selectedDay?.getDate() === day;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(new Date(year, month, day))}
                                className={`
                                    relative border-r border-b border-white/5 p-2 text-left transition-all duration-200 group
                                    ${isSelected ? 'bg-white/5' : 'hover:bg-white/5'}
                                    ${isToday ? 'bg-indigo-500/10' : ''}
                                `}
                            >
                                <span 
                                    className={`
                                        text-sm font-medium inline-block w-7 h-7 text-center leading-7 rounded-full mb-2
                                        ${isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 group-hover:text-white'}
                                    `}
                                >
                                    {day}
                                </span>

                                <div className="space-y-1.5">
                                    {events.slice(0, 3).map((e: any, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 overflow-hidden">
                                            <div 
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                                                style={{ backgroundColor: e.type === MediaType.MOVIE ? '#facc15' : '#60a5fa' }} 
                                            />
                                            <span className="text-[10px] text-gray-300 truncate leading-none opacity-80 group-hover:opacity-100">
                                                {e.title}
                                            </span>
                                        </div>
                                    ))}
                                    {events.length > 3 && (
                                        <span className="text-[9px] text-gray-500 pl-2">+ {events.length - 3} plus</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Detailed Day View */}
        {selectedDay && (
             <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedDay(null)} />
                
                <div className="bg-[#1F1F1F] w-full sm:w-[480px] h-[60vh] sm:h-[600px] rounded-t-[32px] sm:rounded-[32px] border border-white/10 shadow-2xl pointer-events-auto transform transition-transform animate-slide-up flex flex-col relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />

                    <div className="p-6 pb-2 relative z-10 flex items-start justify-between">
                        <div>
                            <div className="text-sm font-bold text-indigo-400 uppercase tracking-wide mb-1">
                                {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric' })}
                            </div>
                            <div className="text-4xl font-black text-white">
                                {selectedDay.getDate()} {monthNames[month]}
                            </div>
                        </div>
                        <button onClick={() => setSelectedDay(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
                        {getEventsForDay(selectedDay.getDate()).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <CalendarIcon size={40} className="mb-3 opacity-50" />
                                <p>Aucune sortie prévue ce jour</p>
                            </div>
                        ) : (
                            getEventsForDay(selectedDay.getDate()).map((e: any, idx) => (
                                <div key={idx} className="bg-[#2A2A2A] rounded-2xl p-4 flex gap-4 border border-white/5 shadow-lg group hover:border-white/20 transition-colors">
                                    <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black shadow-md">
                                        <img src={e.posterUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-base font-bold text-white truncate pr-2">{e.title}</h3>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${e.type === MediaType.MOVIE ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                {e.type === MediaType.MOVIE ? 'FILM' : 'TV'}
                                            </span>
                                        </div>
                                        {e.episode && (
                                            <p className="text-xs text-indigo-300 font-medium mt-0.5">{e.episode}</p>
                                        )}
                                        <div className="mt-auto flex items-center gap-3 text-xs text-gray-400 pt-3">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} /> {e.time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Play size={12} className="text-emerald-500" /> Disponible
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};
