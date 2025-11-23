
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Search, ArrowLeft, Sparkles, Film, Hash, 
    Tv, ChevronDown, Check, Star, Tag
} from 'lucide-react';

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENRES = [
    "Action", "Aventure", "Animation", "Comédie", "Crime", "Documentaire", 
    "Drame", "Famille", "Fantastique", "Histoire", "Horreur", "Musique", 
    "Mystère", "Romance", "Science-Fiction", "Thriller", "Guerre", "Western"
];

const KEYWORDS = [
    "Super-héros", "Tiré d'une histoire vraie", "Dystopie", "Remake", 
    "Voyage temporel", "Zombies", "Aliens", "Lycée", "Vengeance"
];

const STORAGE_KEY = 'hydrarr_search_prefs';

interface SearchState {
    searchQuery: string;
    activeTool: { type: 'movie' | 'tv'; mode: 'custom' | 'genre' | 'keyword' };
    activeTab: 'Populaire' | 'Récents' | 'Notes';
    ratingRange: [number, number];
    selectedGenre: string;
    selectedService: string;
    availableIn: string;
}

const DEFAULT_STATE: SearchState = {
    searchQuery: '',
    activeTool: { type: 'movie', mode: 'custom' },
    activeTab: 'Populaire',
    ratingRange: [5, 10],
    selectedGenre: 'Tout',
    selectedService: 'Tout',
    availableIn: 'France'
};

export const SearchSheet: React.FC<SearchSheetProps> = ({ isOpen, onClose }) => {
  // --- State Initialization with LocalStorage ---
  const [stateLoaded, setStateLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState(DEFAULT_STATE.searchQuery);
  const [activeTool, setActiveTool] = useState<SearchState['activeTool']>(DEFAULT_STATE.activeTool);
  const [activeTab, setActiveTab] = useState<SearchState['activeTab']>(DEFAULT_STATE.activeTab);
  const [ratingRange, setRatingRange] = useState<[number, number]>(DEFAULT_STATE.ratingRange);
  const [selectedGenre, setSelectedGenre] = useState(DEFAULT_STATE.selectedGenre);
  const [selectedService, setSelectedService] = useState(DEFAULT_STATE.selectedService);
  
  // Load preferences on mount
  useEffect(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
              const parsed = JSON.parse(saved);
              setSearchQuery(parsed.searchQuery ?? DEFAULT_STATE.searchQuery);
              setActiveTool(parsed.activeTool ?? DEFAULT_STATE.activeTool);
              setActiveTab(parsed.activeTab ?? DEFAULT_STATE.activeTab);
              setRatingRange(parsed.ratingRange ?? DEFAULT_STATE.ratingRange);
              setSelectedGenre(parsed.selectedGenre ?? DEFAULT_STATE.selectedGenre);
              setSelectedService(parsed.selectedService ?? DEFAULT_STATE.selectedService);
          }
      } catch (e) {
          console.warn('Failed to load search preferences', e);
      } finally {
          setStateLoaded(true);
      }
  }, []);

  // Save preferences on change
  useEffect(() => {
      if (!stateLoaded) return;
      const stateToSave: SearchState = {
          searchQuery,
          activeTool,
          activeTab,
          ratingRange,
          selectedGenre,
          selectedService,
          availableIn: 'France'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [searchQuery, activeTool, activeTab, ratingRange, selectedGenre, selectedService, stateLoaded]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Helper Components ---

  const FilterDropdown = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) => (
      <div className="relative group">
          <div className="flex items-center justify-between bg-[#1F2937] px-4 py-3.5 rounded-xl border border-white/5 active:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-medium text-white">{value}</span>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
          </div>
          <select 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
              {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
              ))}
          </select>
      </div>
  );

  const DiscoverCard = ({ icon: Icon, title, subtitle, type, mode }: { icon: any, title: string, subtitle: string, type: 'movie' | 'tv', mode: 'custom' | 'genre' | 'keyword' }) => {
      const isActive = activeTool.type === type && activeTool.mode === mode;
      return (
        <button 
            onClick={() => setActiveTool({ type, mode })}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 aspect-square shadow-lg active:scale-95 transition-all ${isActive ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50' : 'bg-[#1F2937] border-white/5 hover:bg-gray-800'}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-gray-300'}`}>
                <Icon size={20} />
            </div>
            <div>
                <div className={`text-xs font-bold transition-colors ${isActive ? 'text-emerald-400' : 'text-white'}`}>{title}</div>
                <div className="text-[10px] text-gray-500">{subtitle}</div>
            </div>
        </button>
      );
  };

  // --- Render Content Sections ---

  const renderCustomForm = () => (
      <div className="space-y-4 animate-fade-in">
          <h2 className="text-center text-xl font-bold text-white mb-6">
              Recherche {activeTool.type === 'movie' ? 'Film' : 'Série'} Personnalisée
          </h2>

          {/* Tabs */}
          <div className="bg-[#1F2937] p-1 rounded-xl flex mb-8 border border-white/5">
              {(['Populaire', 'Récents', 'Notes'] as const).map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                          activeTab === tab 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                  >
                      {tab === 'Populaire' ? 'Populaire' : tab === 'Récents' ? 'Récemment sortis' : 'Mieux notés'}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
              <FilterDropdown 
                label="Genre(s)" 
                value={selectedGenre} 
                options={['Tout', ...GENRES]}
                onChange={setSelectedGenre}
              />
              <FilterDropdown 
                label="Service" 
                value={selectedService} 
                options={['Tout', 'Netflix', 'Disney+', 'Prime', 'HBO Max', 'Canal+', 'Apple TV+']}
                onChange={setSelectedService}
              />
          </div>
          
          <div className="bg-[#1F2937] px-4 py-3.5 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Disponible en</span>
              <span className="text-sm font-bold text-white">France</span>
          </div>

          <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-300">Type de sortie</span>
              <div className="flex bg-[#1F2937] rounded-lg p-1 border border-white/5">
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white">Cinéma</button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-white">Digital</button>
                    <button className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded shadow-md flex items-center gap-1">
                        <Check size={12} /> Tout
                    </button>
              </div>
          </div>

          {/* Rating Slider */}
          <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-300 w-20">Note entre</span>
                  <div className="flex-1 h-12 bg-[#1F2937] rounded-xl border border-white/5 relative flex items-center px-4">
                      {/* Track */}
                      <div className="absolute left-4 right-4 h-1.5 bg-gray-700 rounded-full">
                          <div 
                            className="absolute top-0 bottom-0 bg-emerald-500 rounded-full"
                            style={{ 
                                left: `${(ratingRange[0] / 10) * 100}%`, 
                                right: `${100 - (ratingRange[1] / 10) * 100}%` 
                            }} 
                          />
                      </div>
                      {/* Ticks */}
                      <div className="absolute left-4 right-4 flex justify-between px-1 pointer-events-none">
                            {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
                                <div key={i} className={`w-1 h-1 rounded-full ${i >= ratingRange[0] && i <= ratingRange[1] ? 'bg-emerald-300' : 'bg-gray-600'}`} />
                            ))}
                      </div>
                      {/* Simple Visual Handles (Non-interactive for this demo, normally use radix-slider) */}
                      <div 
                        className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer transform -translate-x-1/2 border-2 border-emerald-500 z-10"
                        style={{ left: `calc(1rem + ${(ratingRange[0] / 10) * 100} * (100% - 2rem) / 100)` }}
                      />
                      <div 
                        className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer transform translate-x-1/2 border-2 border-emerald-500 z-10"
                        style={{ right: `calc(1rem + ${(10 - ratingRange[1]) / 10} * (100% - 2rem))` }} // Simplified visual positioning
                      />
                  </div>
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                  {ratingRange[0]} - {ratingRange[1]} Étoiles
              </div>
          </div>
      </div>
  );

  const renderGenreForm = () => (
      <div className="animate-fade-in">
          <h2 className="text-center text-xl font-bold text-white mb-6">
              Genres {activeTool.type === 'movie' ? 'Films' : 'Séries'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
              {GENRES.map(genre => (
                  <button 
                    key={genre}
                    onClick={() => {
                        setSelectedGenre(genre);
                        setActiveTool(prev => ({ ...prev, mode: 'custom' })); // Switch to custom view with this genre selected
                    }}
                    className="py-3 bg-[#1F2937] hover:bg-gray-800 border border-white/5 hover:border-emerald-500/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all active:scale-95"
                  >
                      {genre}
                  </button>
              ))}
          </div>
      </div>
  );

  const renderKeywordForm = () => (
      <div className="animate-fade-in space-y-6">
           <h2 className="text-center text-xl font-bold text-white mb-6">
              Recherche par Mots-clés
          </h2>
          
          <div className="bg-[#1F2937] p-2 rounded-2xl border border-white/5 flex items-center gap-3">
              <Search size={20} className="text-gray-500 ml-2" />
              <input 
                type="text" 
                placeholder="Entrez un tag (ex: 'Espace', 'Survie')..."
                className="bg-transparent border-none outline-none text-white flex-1 h-10"
                autoFocus
              />
          </div>

          <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tags Populaires</h3>
              <div className="flex flex-wrap gap-2">
                  {KEYWORDS.map(keyword => (
                      <button 
                        key={keyword} 
                        onClick={() => setSearchQuery(keyword)}
                        className="px-4 py-2 bg-[#1F2937] hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30 border border-white/5 rounded-full text-xs font-medium text-gray-300 transition-colors flex items-center gap-2"
                      >
                          <Tag size={12} />
                          {keyword}
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        />
        
        {/* Bottom Sheet Container */}
        <div className="bg-[#0B0F19] w-full h-[92vh] rounded-t-[32px] flex flex-col animate-slide-up overflow-hidden relative shadow-2xl border-t border-white/10">
            
            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5 bg-[#0B0F19]/90 backdrop-blur-xl z-20 shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                        type="text"
                        placeholder="Recherche rapide..."
                        className="w-full bg-[#1F2937] text-white text-sm rounded-full py-3 pl-10 pr-4 border border-transparent focus:border-emerald-500 focus:outline-none placeholder-gray-600 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                
                {/* Section: Discover Movies */}
                <div className="px-6 pt-6 pb-2">
                    <h2 className="text-xl font-bold text-white mb-4">Découvrir Films</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <DiscoverCard icon={Sparkles} title="Perso" subtitle="Pour Vous" type="movie" mode="custom" />
                        <DiscoverCard icon={Film} title="Par Genre" subtitle="Catégories" type="movie" mode="genre" />
                        <DiscoverCard icon={Hash} title="Par Tag" subtitle="Mots-clés" type="movie" mode="keyword" />
                    </div>
                </div>

                {/* Section: Discover TV Shows */}
                <div className="px-6 pt-6 pb-8 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">Découvrir Séries</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <DiscoverCard icon={Sparkles} title="Perso" subtitle="Pour Vous" type="tv" mode="custom" />
                        <DiscoverCard icon={Tv} title="Par Genre" subtitle="Catégories" type="tv" mode="genre" />
                        <DiscoverCard icon={Hash} title="Par Tag" subtitle="Mots-clés" type="tv" mode="keyword" />
                    </div>
                </div>

                {/* Section: Dynamic Form */}
                <div className="px-6 pt-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-1 bg-gray-700 rounded-full opacity-50" />
                    </div>

                    {activeTool.mode === 'custom' && renderCustomForm()}
                    {activeTool.mode === 'genre' && renderGenreForm()}
                    {activeTool.mode === 'keyword' && renderKeywordForm()}
                </div>
            </div>

            {/* Bottom Action Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent z-30">
                <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]">
                    {activeTool.mode === 'genre' ? 'Voir Résultats' : 'Rechercher'}
                </button>
            </div>

        </div>
    </div>,
    document.body
  );
};
