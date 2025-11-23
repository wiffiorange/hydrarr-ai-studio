import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Key, Check, HardDrive, User, Lock, ShieldCheck } from 'lucide-react';
import { ServerConfig } from '../types';

interface AddServerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (server: ServerConfig) => void;
}

const DRAFT_KEY = 'hydrarr_new_server_draft';

export const AddServerSheet: React.FC<AddServerSheetProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('http://');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [type, setType] = useState<'Unraid' | 'Synology' | 'Windows' | 'Docker'>('Unraid');

  // Load draft on open
  useEffect(() => {
      if (isOpen) {
          const draft = localStorage.getItem(DRAFT_KEY);
          if (draft) {
              const parsed = JSON.parse(draft);
              setName(parsed.name || '');
              setUrl(parsed.url || 'http://');
              setUsername(parsed.username || '');
              setPassword(parsed.password || '');
              setApiKey(parsed.apiKey || '');
          }
      }
  }, [isOpen]);

  // Save draft on change
  const updateField = (field: string, value: string) => {
      const current = { name, url, username, password, apiKey };
      const updated = { ...current, [field]: value };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  };

  const handleNameChange = (val: string) => { setName(val); updateField('name', val); };
  const handleUrlChange = (val: string) => { setUrl(val); updateField('url', val); };
  const handleUserChange = (val: string) => { setUsername(val); updateField('username', val); };
  const handlePassChange = (val: string) => { setPassword(val); updateField('password', val); };
  const handleKeyChange = (val: string) => { setApiKey(val); updateField('apiKey', val); };


  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    const newServer: ServerConfig = {
        id: Date.now().toString(),
        name,
        url,
        type,
        username,
        password
    };
    onAdd(newServer);
    
    // Reset form and clear draft
    localStorage.removeItem(DRAFT_KEY);
    setName('');
    setUrl('http://');
    setUsername('');
    setPassword('');
    setApiKey('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity pointer-events-auto" 
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="bg-[#1F2937] w-full sm:max-w-md max-h-[60vh] rounded-t-[32px] shadow-2xl pointer-events-auto transform transition-transform duration-300 animate-slide-up border-t border-white/10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-center border-b border-white/5 shrink-0">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HardDrive size={20} className="text-emerald-400" />
                    Ajouter Serveur
                </h2>
                <p className="text-xs text-gray-400">Connecter une nouvelle instance</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-300 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-6 pt-4 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Server Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nom du Serveur</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="ex: Média Maison"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                        required
                    />
                </div>

                {/* URL */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                        <Globe size={12} /> URL / Adresse IP
                    </label>
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                        required
                    />
                </div>

                {/* Credentials Group */}
                <div className="bg-gray-900/30 p-4 rounded-2xl border border-white/5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                            <User size={12} /> Utilisateur
                        </label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => handleUserChange(e.target.value)}
                            placeholder=""
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
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
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                </div>

                {/* API Key (Optional) */}
                <div className="pt-2">
                    <button 
                        type="button"
                        onClick={() => handleKeyChange(apiKey ? '' : ' ')} // Toggle dummy logic
                        className="text-xs font-bold text-indigo-400 flex items-center gap-1 mb-2"
                    >
                        <ShieldCheck size={12} /> Avancé: Clé API
                    </button>
                    {apiKey !== '' && (
                         <div className="space-y-1.5 animate-fade-in">
                            <div className="relative">
                                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={apiKey}
                                    onChange={(e) => handleKeyChange(e.target.value)}
                                    placeholder="X-API-Key"
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 pb-6">
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Check size={20} strokeWidth={3} />
                        Connecter
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>,
    document.body
  );
};