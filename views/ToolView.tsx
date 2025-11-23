
import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, CheckCircle, AlertCircle, Clock, History } from 'lucide-react';
import { ToolTab, MediaType, Status } from '../types';
import { MOCK_MEDIA } from '../constants';
import { MediaCard } from '../components/MediaCard';

interface ToolViewProps {
  name: string;
  type: MediaType;
}

export const ToolView: React.FC<ToolViewProps> = ({ name, type }) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('Tout');
  
  const tabs: ToolTab[] = ['Tout', 'Surveillé', 'Manquant', 'À venir', 'Historique', 'Téléchargé'];

  const getFilteredMedia = () => {
      let filtered = MOCK_MEDIA.filter(m => m.type === type);
      
      switch(activeTab) {
          case 'Manquant': return filtered.filter(m => m.status === Status.MISSING);
          case 'Téléchargé': return filtered.filter(m => m.status === Status.DOWNLOADED);
          case 'Surveillé': return filtered.filter(m => m.status === Status.MONITORING || m.status === Status.DOWNLOADING);
          case 'À venir': return filtered.filter(m => m.status === Status.MONITORING); // Approx
          case 'Historique': return filtered; // Mock history
          default: return filtered;
      }
  };

  const media = getFilteredMedia();

  return (
    <div className="min-h-screen pb-24 md:pb-0 pt-16 md:pt-0 px-2 flex flex-col">
        {/* Tool Header */}
        <div className="flex items-center justify-between mb-6">
             <div>
                 <h1 className="text-2xl font-bold text-white">{name}</h1>
                 <p className="text-xs text-gray-400">Library Manager</p>
             </div>
             <div className="flex gap-2">
                 <button className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white"><Search size={20}/></button>
                 <button className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-500/20"><Plus size={20}/></button>
             </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 pb-2 border-b border-gray-800">
            {tabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
            {media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="bg-gray-800 p-4 rounded-full mb-4 opacity-50">
                         {activeTab === 'Manquant' ? <AlertCircle size={32} /> : <Filter size={32} />}
                    </div>
                    <p>No items found in {activeTab}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {media.map(item => (
                        <MediaCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
