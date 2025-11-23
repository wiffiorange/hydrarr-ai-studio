
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Key, Check, ShieldCheck, AlertCircle, Loader2, User, Lock, HelpCircle } from 'lucide-react';
import { ServiceConfig, ServerConfig } from '../types';
import { HydraApi } from '../services/api';

interface ServiceConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceConfig | null;
  onSave: (config: ServiceConfig) => void;
}

const DEFAULT_PORTS: Record<string, string> = {
    'radarr': '7878',
    'sonarr': '8989',
    'lidarr': '8686',
    'readarr': '8787',
    'sabnzbd': '8080',
    'qbittorrent': '8080',
    'plex': '32400'
};

export const ServiceConfigSheet: React.FC<ServiceConfigSheetProps> = ({ isOpen, onClose, service, onSave }) => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const defaultPort = service ? DEFAULT_PORTS[service.id] : '';

  // --- State Management: Load Drafts or Current Config ---
  useEffect(() => {
    if (isOpen && service) {
        const draftKey = `hydrarr_draft_${service.id}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
            // Use Draft if available
            const draft = JSON.parse(savedDraft);
            setUrl(draft.url || '');
            setApiKey(draft.apiKey || '');
            setUsername(draft.username || '');
            setPassword(draft.password || '');
        } else {
            // Use Service Config
            setUrl(service.url || '');
            setApiKey(service.apiKey || '');
            setUsername(service.username || '');
            setPassword(service.password || '');

            // Fallback: Smart Pre-fill if URL is empty and no draft
            if (!service.url) {
                const savedServers = localStorage.getItem('hydrarr_servers');
                let smartHost = 'localhost';

                if (savedServers) {
                    try {
                        const servers: ServerConfig[] = JSON.parse(savedServers);
                        if (servers.length > 0) {
                            try {
                                const urlObj = new URL(servers[0].url);
                                smartHost = urlObj.hostname;
                            } catch (e) { /* ignore invalid url */ }
                        }
                    } catch (e) { /* ignore parse error */ }
                }
                
                if (DEFAULT_PORTS[service.id]) {
                    const prefilled = `http://${smartHost}:${DEFAULT_PORTS[service.id]}`;
                    setUrl(prefilled);
                    // Save as draft immediately
                    saveDraft(service.id, { url: prefilled });
                }
            }
        }

        setTestStatus('idle');
        setErrorMessage('');
    }
  }, [isOpen, service]);

  // --- Draft Saving Logic ---
  const saveDraft = (serviceId: string, data: Partial<{ url: string, apiKey: string, username: string, password: string }>) => {
      const draftKey = `hydrarr_draft_${serviceId}`;
      const current = localStorage.getItem(draftKey) ? JSON.parse(localStorage.getItem(draftKey)!) : {};
      const updated = { ...current, ...data };
      localStorage.setItem(draftKey, JSON.stringify(updated));
  };

  // Wrappers for setters that also save draft
  const handleUrlChange = (val: string) => { setUrl(val); saveDraft(service!.id, { url: val }); };
  const handleApiKeyChange = (val: string) => { setApiKey(val); saveDraft(service!.id, { apiKey: val }); };
  const handleUserChange = (val: string) => { setUsername(val); saveDraft(service!.id, { username: val }); };
  const handlePassChange = (val: string) => { setPassword(val); saveDraft(service!.id, { password: val }); };

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const handleTest = async () => {
      if (!url) return;
      
      setIsTesting(true);
      setTestStatus('idle');
      setErrorMessage('');
      
      const tempConfig: ServiceConfig = { 
          ...service, 
          url, 
          apiKey,
          username,
          password 
      };

      const result = await HydraApi.testConnection(tempConfig);
      
      setIsTesting(false);
      setTestStatus(result.success ? 'success' : 'error');
      if (!result.success) {
          setErrorMessage(result.message || 'Échec de connexion inconnu.');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear draft on successful save intent
    localStorage.removeItem(`hydrarr_draft_${service.id}`);
    
    onSave({ 
        ...service, 
        url, 
        apiKey, 
        username, 
        password,
        enabled: true 
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity pointer-events-auto" 
        onClick={onClose}
      />

      <div className="bg-[#1F2937] w-full sm:max-w-lg max-h-[90vh] rounded-t-[32px] shadow-2xl pointer-events-auto transform transition-transform duration-300 animate-slide-up border-t border-white/10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-white/5 bg-[#1F2937]">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Configurer {service.name}
                </h2>
                <p className="text-xs text-gray-400">Connexion API</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-300 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* URL */}
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                            <Globe size={12} /> URL Base
                        </label>
                        {defaultPort && (
                            <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 rounded">Port défaut: {defaultPort}</span>
                        )}
                    </div>
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder={`http://localhost:${defaultPort || '8080'}`}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                        required
                    />
                </div>

                {/* Credentials (Username / Password) */}
                <div className="bg-gray-900/30 p-4 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-[10px] text-gray-400 font-medium">Authentification (Si nécessaire)</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                <User size={12} /> Utilisateur
                            </label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => handleUserChange(e.target.value)}
                                placeholder=""
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                                <Lock size={12} /> Mot de passe
                            </label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => handlePassChange(e.target.value)}
                                placeholder=""
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* API Key (Optional) */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <Key size={12} /> Clé API (Optionnelle)
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={apiKey}
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            placeholder="Laisser vide si auth. désactivée"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl pl-4 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs sm:text-sm"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                             <ShieldCheck size={18} className={apiKey ? "text-emerald-500" : "text-gray-600"} />
                        </div>
                    </div>
                </div>

                {/* Test Result */}
                {testStatus !== 'idle' && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex flex-col gap-1 animate-fade-in ${testStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        <div className="flex items-center gap-2">
                             {testStatus === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                             {testStatus === 'success' ? 'Connexion réussie !' : 'Erreur de connexion'}
                        </div>
                        {testStatus === 'error' && errorMessage && (
                            <div className="pl-6">
                                <span className="block font-medium">{errorMessage}</span>
                                {errorMessage.includes('CORS') && (
                                    <div className="mt-2 p-2 bg-black/20 rounded border border-white/10 text-[10px] font-normal text-gray-300 leading-relaxed">
                                        <strong>Pourquoi ?</strong> Les navigateurs bloquent les connexions externes par sécurité, contrairement à une appli native comme NZB360.<br/>
                                        <strong>Solution :</strong> Dans {service.name} &gt; Settings &gt; General &gt; Security &gt; Activez "Enable CORS" &gt; Save &gt; Restart.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                    <button 
                        type="button"
                        onClick={handleTest}
                        disabled={isTesting || !url}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isTesting ? <Loader2 size={18} className="animate-spin" /> : 'Tester'}
                    </button>
                    <button 
                        type="submit"
                        disabled={isTesting}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Check size={20} strokeWidth={3} />
                        Sauvegarder
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
