
import React, { useState, useEffect } from 'react';
import { Menu, ArrowDown, Film, Tv, Music, BookOpen, Server, Download, Settings as SettingsIcon, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { THEME_COLORS } from '../constants';
import { LibraryType, ServiceConfig } from '../types';
import { ServiceConfigSheet } from '../components/ServiceConfigSheet';

interface SettingsViewProps {
    onOpenLeftDrawer: () => void;
    onOpenRightDrawer: () => void;
}

const DEFAULT_SERVICES: ServiceConfig[] = [
    { id: 'radarr', name: 'Radarr', type: LibraryType.RADARR, url: '', enabled: false, icon: Film, color: THEME_COLORS.RADARR.primary },
    { id: 'sonarr', name: 'Sonarr', type: LibraryType.SONARR, url: '', enabled: false, icon: Tv, color: THEME_COLORS.SONARR.primary },
    { id: 'lidarr', name: 'Lidarr', type: LibraryType.LIDARR, url: '', enabled: false, icon: Music, color: THEME_COLORS.LIDARR.primary },
    { id: 'readarr', name: 'Readarr', type: LibraryType.READARR, url: '', enabled: false, icon: BookOpen, color: THEME_COLORS.READARR.primary },
    { id: 'sabnzbd', name: 'SABnzbd', type: 'SABnzbd', url: '', enabled: false, icon: Download, color: '#F59E0B' }, // Amber
    { id: 'qbittorrent', name: 'qBittorrent', type: 'qBittorrent', url: '', enabled: false, icon: Server, color: '#3B82F6' }, // Blue
];

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenLeftDrawer, onOpenRightDrawer }) => {
    const [services, setServices] = useState<ServiceConfig[]>(DEFAULT_SERVICES);
    const [editingService, setEditingService] = useState<ServiceConfig | null>(null);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('hydrarr_services');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge saved config with default structure to ensure icons/colors persist correctly
                // CRITICAL: Explicitly restore the 'icon' from DEFAULT_SERVICES to avoid React Error #130
                const merged = DEFAULT_SERVICES.map(def => {
                    const existing = parsed.find((p: any) => p.id === def.id);
                    if (existing) {
                        return {
                            ...existing,
                            icon: def.icon, // Always use the component from code
                            color: def.color // Always use the color from code (optional)
                        };
                    }
                    return def;
                });
                setServices(merged);
            } catch (e) {
                console.error("Failed to parse services config", e);
            }
        }
    }, []);

    const handleSaveService = (config: ServiceConfig) => {
        const updated = services.map(s => s.id === config.id ? config : s);
        setServices(updated);
        
        // Strip icon/complex objects before saving to avoid circular structure issues or bloat
        const toSave = updated.map(({ icon, ...rest }) => rest);
        localStorage.setItem('hydrarr_services', JSON.stringify(toSave));
        
        setEditingService(null);
    };

    return (
        <div className="min-h-screen relative pb-24 overflow-hidden bg-[#0B0F19]">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] pointer-events-none" />
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-16">
                    <button onClick={onOpenLeftDrawer} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-white">Paramètres</h1>
                    <button onClick={onOpenRightDrawer} className="p-2 rounded-full hover:bg-white/10 text-white relative">
                        <ArrowDown size={24} />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 border border-[#0B0F19]" />
                    </button>
                </div>
            </div>

            <div className="p-6 max-w-3xl mx-auto">
                
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                        <SettingsIcon className="text-gray-400" /> Configuration
                    </h2>
                    <p className="text-gray-400 text-sm">Gérez les connexions à vos services médias.</p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {services.map(service => {
                        const Icon = service.icon;
                        return (
                            <button
                                key={service.id}
                                onClick={() => setEditingService(service)}
                                className="group flex items-center justify-between p-4 rounded-2xl bg-[#1F2937]/50 border border-white/5 hover:bg-[#1F2937] hover:border-white/10 transition-all active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                                        style={{ backgroundColor: `${service.color}20`, color: service.color }}
                                    >
                                        <Icon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-white font-bold text-base">{service.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {service.enabled ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    <CheckCircle size={10} /> Connecté
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                                    <XCircle size={10} /> Non Configuré
                                                </span>
                                            )}
                                            {service.url && <span className="text-[10px] text-gray-600 font-mono truncate max-w-[150px]">{service.url}</span>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-2 text-gray-500 group-hover:text-white transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Info Section */}
                <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5">
                    <h3 className="text-white font-bold mb-2">À propos de Hydrarr</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Version 1.0.5-beta <br/>
                        Hydrarr unifie vos applications de serveur média en une interface unique. 
                        Les données sont stockées localement dans votre navigateur.
                    </p>
                </div>

            </div>

            <ServiceConfigSheet 
                isOpen={!!editingService}
                service={editingService}
                onClose={() => setEditingService(null)}
                onSave={handleSaveService}
            />
        </div>
    );
};
