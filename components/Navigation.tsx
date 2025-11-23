
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Film, Tv, Music, Calendar, Server, Settings, 
  BookOpen, Plus, HardDrive, LayoutDashboard, ChevronUp, Trash2
} from 'lucide-react';
import { SERVERS, THEME_COLORS } from '../constants';
import { ServerConfig } from '../types';
import { AddServerSheet } from './AddServerSheet';

interface NavigationProps {
  mobile?: boolean;
  onOpenRightDrawer: () => void;
  leftDrawerOpen?: boolean;
  setLeftDrawerOpen?: (open: boolean) => void;
  accentColor?: string; 
}

const BOTTOM_NAV_ITEMS = [
  { path: '/movies', icon: Film, label: 'Films', color: THEME_COLORS.RADARR.primary },
  { path: '/tv', icon: Tv, label: 'Séries', color: THEME_COLORS.SONARR.primary },
  { path: '/music', icon: Music, label: 'Musique', color: THEME_COLORS.LIDARR.primary },
  { path: '/books', icon: BookOpen, label: 'Livres', color: THEME_COLORS.READARR.primary },
  { path: '/calendar', icon: Calendar, label: 'Calendrier', color: THEME_COLORS.CALENDAR.primary },
  { path: '/server', icon: Server, label: 'Serveur', color: THEME_COLORS.SERVER.primary },
];

const TOOL_LINKS = [
    { path: '/tools/radarr', icon: Film, label: 'Radarr', sub: 'Films', color: THEME_COLORS.RADARR.primary, bg: THEME_COLORS.RADARR.bgClass, text: THEME_COLORS.RADARR.accentClass },
    { path: '/tools/sonarr', icon: Tv, label: 'Sonarr', sub: 'Séries TV', color: THEME_COLORS.SONARR.primary, bg: THEME_COLORS.SONARR.bgClass, text: THEME_COLORS.SONARR.accentClass },
    { path: '/tools/lidarr', icon: Music, label: 'Lidarr', sub: 'Musique', color: THEME_COLORS.LIDARR.primary, bg: THEME_COLORS.LIDARR.bgClass, text: THEME_COLORS.LIDARR.accentClass },
    { path: '/tools/readarr', icon: BookOpen, label: 'Readarr', sub: 'Livres', color: THEME_COLORS.READARR.primary, bg: THEME_COLORS.READARR.bgClass, text: THEME_COLORS.READARR.accentClass },
];

// --- Left Drawer Content (Background Layer) ---
export const LeftDrawerContent: React.FC<{ closeDrawer: () => void }> = ({ closeDrawer }) => {
    // Load servers from local storage or fall back to constants
    const [serverList, setServerList] = useState<ServerConfig[]>(() => {
        const saved = localStorage.getItem('hydrarr_servers');
        return saved ? JSON.parse(saved) : SERVERS;
    });
    
    const [activeServer, setActiveServer] = useState<ServerConfig>(serverList[0] || SERVERS[0]);
    const [serverDropdownOpen, setServerDropdownOpen] = useState(false);
    const [isAddServerOpen, setIsAddServerOpen] = useState(false);

    // Persist server list changes
    useEffect(() => {
        localStorage.setItem('hydrarr_servers', JSON.stringify(serverList));
    }, [serverList]);

    const handleAddServer = (newServer: ServerConfig) => {
        const newList = [...serverList, newServer];
        setServerList(newList);
        setActiveServer(newServer);
        setServerDropdownOpen(false);
    };

    const handleDeleteServer = (e: React.MouseEvent, serverId: string) => {
        e.stopPropagation(); // Prevent triggering selection
        const newList = serverList.filter(s => s.id !== serverId);
        setServerList(newList);
        
        // If we deleted the active server, switch to another one if available
        if (activeServer.id === serverId) {
            setActiveServer(newList.length > 0 ? newList[0] : SERVERS[0]);
        }
    };

    return (
        <div className="flex flex-col h-full w-full pt-16 pb-6 pl-6 pr-14 relative"> 
          {/* Decorative Background Blur for Depth - Pushed to back */}
          <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-cyan-900/20 blur-[100px]" />
          </div>

          <div className="px-2 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                       <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center overflow-hidden relative">
                           <img 
                               src="/logo.png" 
                               alt="HYDRARR" 
                               className="w-full h-full object-contain p-1.5"
                           />
                       </div>
                  </div>
                  <div>
                      <h1 className="text-2xl font-black text-cyan-400 tracking-tight">HYDRARR</h1>
                  </div>
              </div>
          </div>
    
          <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar relative z-0 pr-2">
              <NavLink 
                to="/movies" 
                onClick={closeDrawer}
                className={({ isActive }) => `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {({ isActive }) => (
                  <>
                      <LayoutDashboard size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={`font-medium text-base ${isActive ? 'tracking-wide' : ''}`}>Tableau de bord</span>
                  </>
                )}
              </NavLink>
    
              <div className="mt-6 mb-3 px-4 flex items-center gap-2 opacity-50">
                 <div className="h-[1px] bg-gray-700 flex-1" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestionnaires</span>
                 <div className="h-[1px] bg-gray-700 flex-1" />
              </div>

              {TOOL_LINKS.map(link => (
                  <NavLink 
                    key={link.path} 
                    to={link.path} 
                    onClick={closeDrawer}
                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? `bg-gradient-to-r from-gray-800/80 to-gray-900/80 text-white shadow-lg border border-white/10` : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                    style={({ isActive }) => isActive ? { borderColor: `${link.color}33` } : {}}
                  >
                    {({ isActive }) => (
                      <>
                          <div className={`p-2 rounded-xl transition-colors ${isActive ? `${link.bg} ${link.text}` : 'bg-gray-800/50 group-hover:bg-gray-800'}`}>
                             <link.icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className={`font-bold text-sm leading-none mb-1 ${isActive ? link.text : 'text-gray-300'}`}>{link.label}</div>
                            <div className={`text-[10px] font-medium truncate ${isActive ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-500'}`}>{link.sub}</div>
                          </div>
                      </>
                    )}
                  </NavLink>
              ))}
          </div>
    
          <div className="mt-auto pt-4 relative z-20 space-y-3">
              <div className="relative">
                  {serverDropdownOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-3 bg-[#1F2937] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-slide-up-fade">
                          <div className="max-h-48 overflow-y-auto no-scrollbar">
                            {serverList.map(server => (
                                <div 
                                    key={server.id}
                                    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-700 group transition-colors cursor-pointer"
                                    onClick={() => {
                                        setActiveServer(server);
                                        setServerDropdownOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${activeServer.id === server.id ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                                        <span className="truncate text-sm text-gray-300 group-hover:text-white">{server.name}</span>
                                    </div>
                                    
                                    {/* Delete Button (only if more than 1 server or specific logic, but let's allow deleting any custom added) */}
                                    <button 
                                        onClick={(e) => handleDeleteServer(e, server.id)}
                                        className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        title="Supprimer le serveur"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => setIsAddServerOpen(true)}
                            className="w-full text-left px-4 py-3.5 text-sm text-indigo-400 hover:bg-gray-700 flex items-center gap-2 font-bold border-t border-gray-700/50"
                          >
                              <Plus size={14} /> Ajouter Serveur
                          </button>
                      </div>
                  )}
                  
                  <button 
                    onClick={() => setServerDropdownOpen(!serverDropdownOpen)}
                    className="w-full flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 p-3.5 rounded-2xl transition-all border border-white/5 active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 bg-gray-900 rounded-lg text-cyan-400 flex-shrink-0">
                              <HardDrive size={16} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">Connecté à</div>
                              <div className="text-sm font-bold text-white leading-none truncate">{activeServer?.name || 'Aucun Serveur'}</div>
                          </div>
                      </div>
                      <ChevronUp size={16} className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${serverDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
              </div>
    
              <NavLink 
                to="/settings" 
                onClick={closeDrawer} 
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border border-transparent hover:border-white/5"
              >
                  <Settings size={20} />
                  <span className="font-bold text-sm">Paramètres</span>
              </NavLink>
          </div>
          
          <AddServerSheet 
            isOpen={isAddServerOpen}
            onClose={() => setIsAddServerOpen(false)}
            onAdd={handleAddServer}
          />
        </div>
      );
};

// --- Bottom Navigation (Window Content) ---
export const BottomNav: React.FC = () => {
    const location = useLocation();
    // Only hide bottom nav inside specific heavy tool pages if desired, but generally keep it accessible
    // Hiding it on Settings or deeper detail pages is common.
    if (location.pathname.startsWith('/tools/')) return null; 
    if (location.pathname.startsWith('/settings')) return null;

    return (
        <nav className="bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/5 px-2 pb-6 pt-2 w-full">
            <div className="flex justify-between items-end">
                {BOTTOM_NAV_ITEMS.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className="flex-1 flex flex-col items-center justify-center gap-1 h-14 rounded-2xl transition-all duration-300 group relative"
                    >
                    {({ isActive }) => (
                        <>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full transition-all duration-500" 
                             style={{ backgroundColor: isActive ? item.color : 'transparent', opacity: isActive ? 1 : 0 }} 
                        />
                        
                        <item.icon 
                            size={isActive ? 26 : 22} 
                            style={{ color: isActive ? item.color : '#64748b', filter: isActive ? `drop-shadow(0 0 8px ${item.color}66)` : 'none' }}
                            strokeWidth={isActive ? 2.5 : 2}
                            className="transition-all duration-300"
                        />
                        
                        <span 
                            className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'}`}
                            style={{ color: isActive ? item.color : '#64748b' }}
                        >
                            {item.label}
                        </span>
                        </>
                    )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

// Dummy export to satisfy legacy imports if any (though App.tsx doesn't use it anymore)
export const Navigation: React.FC<NavigationProps> = () => null;
