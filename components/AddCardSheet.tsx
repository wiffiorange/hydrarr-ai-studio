
import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { AVAILABLE_WIDGETS } from '../constants';
import { WidgetSource, WidgetDefinition } from '../types';

interface AddCardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widgetDef: WidgetDefinition) => void;
}

export const AddCardSheet: React.FC<AddCardSheetProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedSource, setSelectedSource] = useState<WidgetSource | 'Tout'>('Tout');

  if (!isOpen) return null;

  const sources = ['Tout', ...Object.values(WidgetSource)];
  const filteredWidgets = selectedSource === 'Tout' 
    ? AVAILABLE_WIDGETS 
    : AVAILABLE_WIDGETS.filter(w => w.source === selectedSource);

  const getSourceColor = (source: WidgetSource) => {
    switch(source) {
        case WidgetSource.RADARR: return 'bg-amber-500';
        case WidgetSource.SONARR: return 'bg-blue-500';
        case WidgetSource.LIDARR: return 'bg-emerald-500';
        case WidgetSource.READARR: return 'bg-rose-500';
        case WidgetSource.SERVER: return 'bg-gray-500';
        default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity pointer-events-auto" 
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="bg-[#1F2937] w-full sm:w-[480px] h-[85vh] sm:h-[600px] rounded-t-[32px] sm:rounded-[32px] flex flex-col shadow-2xl pointer-events-auto transform transition-transform duration-300 border border-white/5">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-800 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">Ajouter une Carte</h2>
                <p className="text-xs text-gray-400">Touchez une carte pour l'ajouter</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-300">
                <X size={20} />
            </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-800/50">
            {sources.map(source => (
                <button
                    key={source}
                    onClick={() => setSelectedSource(source as WidgetSource | 'Tout')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedSource === source 
                        ? 'bg-white text-black' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    {source}
                </button>
            ))}
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 gap-4">
            {filteredWidgets.map((widget) => (
                <button
                    key={widget.type}
                    onClick={() => {
                        onAdd(widget);
                        onClose();
                    }}
                    className="flex items-start gap-4 p-4 bg-gray-900/50 hover:bg-gray-800 rounded-2xl border border-white/5 text-left transition-colors group"
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${getSourceColor(widget.source)}`}>
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-white">{widget.title}</h3>
                            <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                                {widget.source}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{widget.description}</p>
                    </div>
                </button>
            ))}
            {filteredWidgets.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">
                    Aucune carte trouvée pour cette catégorie.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
