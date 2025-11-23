
import React from 'react';
import { X, Pause, Play, Trash2, Download, Wifi, Activity, Zap, Menu, Search, ArrowDown, Pencil } from 'lucide-react';
import { MOCK_QUEUE } from '../constants';

interface RightDrawerContentProps {
  onClose: () => void;
}

export const RightDrawerContent: React.FC<RightDrawerContentProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full w-full pt-14 pb-8 pl-14 pr-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-emerald-900/10 blur-[60px] pointer-events-none" />

        {/* Header - Styled to match screenshot */}
        <div className="mb-8 flex items-center justify-between relative z-10">
           <button className="p-2 text-white/50 cursor-default hover:text-white transition-colors">
             <Menu size={24} />
           </button>

           <div className="flex-1 mx-4">
               <div className="w-full h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center px-4 gap-2 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
                   <Search size={16} className="text-gray-500 shrink-0" />
                   <span className="text-sm font-medium text-gray-400 truncate flex-1">Téléchargements Films, Séries...</span>
                   
                   {/* Speed Indicator inside search pill */}
                   <div className="flex items-center gap-1.5 pl-3 border-l border-white/10 h-5">
                        <Zap size={12} className="text-emerald-400 fill-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400 font-mono whitespace-nowrap">45 MB/s</span>
                   </div>
               </div>
           </div>

           <div className="flex items-center gap-1">
             <button onClick={onClose} className="p-2 text-white/90 hover:bg-white/10 rounded-full relative transition-colors">
               <ArrowDown size={24} />
               <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border border-[#0B0F19]" />
             </button>
             <button className="p-2 text-white/90 hover:bg-white/10 rounded-full transition-colors">
               <Pencil size={20} />
             </button>
           </div>
        </div>

        {/* List Header */}
        <div className="px-1 mb-4 flex items-center justify-between relative z-10">
             <h2 className="text-2xl font-bold text-white">En Cours</h2>
             <div className="flex items-center gap-2 text-gray-400 text-xs font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5">
                 <Activity size={14} className="text-emerald-500" />
                 {MOCK_QUEUE.length} Actifs
             </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-1 space-y-4 no-scrollbar relative z-10">
           
           {MOCK_QUEUE.map(item => (
             <div key={item.id} className="bg-[#131313] rounded-2xl p-4 border border-white/5 relative overflow-hidden shadow-lg group">
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="min-w-0 flex-1 mr-3">
                        <div className="flex items-center gap-2 mb-1.5">
                             <span className={`text-[9px] px-1.5 py-0.5 rounded text-black font-black uppercase tracking-wider ${item.client === 'SABnzbd' ? 'bg-amber-400' : 'bg-blue-400'}`}>
                                {item.client}
                             </span>
                             <span className="text-[10px] text-gray-500 font-mono">{item.size}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate leading-tight">{item.title}</h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                         <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mb-1">{item.timeLeft}</div>
                         <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Zap size={10} /> {item.speed}
                         </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800/50 h-1.5 rounded-full overflow-hidden mt-2 mb-4">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full relative overflow-hidden" 
                        style={{ width: `${item.progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-4 gap-2">
                    <button className="col-span-3 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition-colors border border-white/5">
                        {item.status === 'Downloading' ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                        {item.status === 'Downloading' ? 'PAUSE' : 'REPRENDRE'}
                    </button>
                    <button className="col-span-1 flex items-center justify-center py-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors border border-rose-500/10">
                        <Trash2 size={14} />
                    </button>
                </div>
             </div>
           ))}
           
           {MOCK_QUEUE.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                <Download size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">File d'attente vide</p>
             </div>
           )}
        </div>
    </div>
  );
};
