import { ServiceConfig, LibraryType, MediaItem, MediaType, Status, ServerStat, DownloadQueueItem, ServiceStatus } from '../types';
import { MOCK_MEDIA, MOCK_QUEUE, MOCK_SERVER_STATS } from '../constants';

// Helper to get config
const getConfig = (type: string): ServiceConfig | undefined => {
    const saved = localStorage.getItem('hydrarr_services');
    if (!saved) return undefined;
    const services: ServiceConfig[] = JSON.parse(saved);
    return services.find(s => s.type === type && s.enabled);
};

// Helper: Use Query Params for API Key OR Basic Auth headers
const fetchWithAuth = async (baseUrl: string, endpoint: string, apiKey?: string, username?: string, password?: string) => {
    if (!baseUrl) throw new Error("L'URL de base est manquante");
    
    // Auto-fix protocol if missing and normalize slashes
    let cleanBase = baseUrl.trim().replace(/\/$/, '');
    if (!cleanBase.match(/^https?:\/\//)) {
        cleanBase = `http://${cleanBase}`;
    }
    
    // Check for Mixed Content Error (HTTPS app trying to access HTTP server)
    // EXCEPTION: Allow if running on localhost (Capacitor/Android Wrapper uses localhost internally)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    
    if (window.location.protocol === 'https:' && cleanBase.startsWith('http:') && !isLocalhost) {
        throw new Error("Blocage Navigateur : Impossible d'accéder à un serveur HTTP depuis un site HTTPS. Utilisez une URL HTTPS pour votre serveur ou accédez à Hydrarr en HTTP.");
    }
    
    // Ensure endpoint doesn't start with slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Build URL
    let url = `${cleanBase}/${cleanEndpoint}`;
    
    // STRATEGY: Prioritize API Key via Query Param (Least likely to trigger CORS Preflight issues)
    if (apiKey && apiKey.trim() !== '') {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}apikey=${apiKey.trim()}`;
    }

    // Build Headers
    const headers: HeadersInit = {};
    
    // Only add Basic Auth if NO API Key is present OR if specifically requested.
    if ((!apiKey || apiKey.trim() === '') && username && password) {
        headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
    }

    // Add Timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for mobile

    try {
        const response = await fetch(url, { 
            headers,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.status === 401 || response.status === 403) {
            throw new Error("Authentification refusée (401). Vérifiez la Clé API.");
        }
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        // Handle void responses
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error("Délai dépassé (8s). Vérifiez l'IP et que le serveur est allumé.");
        }
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error("Échec connexion (Network/CORS). Sur Android, assurez-vous que le téléphone est sur le même Wi-Fi que le serveur.");
        }
        throw error;
    }
};

// Mappers
const mapRadarrMovie = (m: any): MediaItem => ({
    id: m.id,
    title: m.title,
    year: m.year,
    type: MediaType.MOVIE,
    status: m.hasFile ? Status.DOWNLOADED : (m.monitored ? Status.MISSING : Status.UNMONITORED),
    posterUrl: m.images?.find((i: any) => i.coverType === 'poster')?.remoteUrl || '',
    rating: m.ratings?.tmdb?.value || 0,
    addedDate: new Date(m.added),
    quality: m.movieFile?.quality?.quality?.name,
    size: m.sizeOnDisk ? `${(m.sizeOnDisk / 1073741824).toFixed(1)} GB` : undefined,
    overview: m.overview
});

const mapSonarrSeries = (s: any): MediaItem => ({
    id: s.id,
    title: s.title,
    year: s.year,
    type: MediaType.SERIES,
    status: s.statistics?.percentOfEpisodes === 100 ? Status.ENDED : Status.CONTINUING,
    posterUrl: s.images?.find((i: any) => i.coverType === 'poster')?.remoteUrl || '',
    rating: s.ratings?.value || 0,
    seasonCount: s.seasonCount,
    network: s.network,
    overview: s.overview,
    addedDate: new Date(s.added)
});

const mapQueueItem = (q: any, clientName: 'Radarr' | 'Sonarr'): DownloadQueueItem => ({
    id: q.id,
    title: q.title,
    client: q.protocol === 'torrent' ? 'qBittorrent' : 'SABnzbd',
    speed: `${(q.timeleft === '00:00:00' ? 0 : 0).toFixed(1)} MB/s`, 
    timeLeft: q.timeleft || '?',
    progress: 100 - (q.sizeleft / q.size * 100),
    status: q.status === 'Downloading' ? 'Downloading' : 'Queued',
    size: `${(q.size / 1073741824).toFixed(1)} GB`,
    type: clientName === 'Radarr' ? MediaType.MOVIE : MediaType.SERIES
});

export const HydraApi = {
    testConnection: async (config: ServiceConfig): Promise<{ success: boolean, message?: string }> => {
        try {
            await fetchWithAuth(config.url, 'api/v3/system/status', config.apiKey, config.username, config.password);
            return { success: true };
        } catch (e: any) {
            console.warn("Connection Test Failed:", e.message);
            return { success: false, message: e.message };
        }
    },

    getLibrary: async (type: LibraryType): Promise<MediaItem[]> => {
        const config = getConfig(type);
        
        // DEMO MODE
        if (!config) {
            if (type === LibraryType.RADARR) return MOCK_MEDIA.filter(m => m.type === MediaType.MOVIE);
            if (type === LibraryType.SONARR) return MOCK_MEDIA.filter(m => m.type === MediaType.SERIES);
            if (type === LibraryType.LIDARR) return MOCK_MEDIA.filter(m => m.type === MediaType.MUSIC);
            if (type === LibraryType.READARR) return MOCK_MEDIA.filter(m => m.type === MediaType.BOOK);
            return [];
        }

        // REAL MODE
        try {
            if (type === LibraryType.RADARR) {
                const data = await fetchWithAuth(config.url, 'api/v3/movie', config.apiKey, config.username, config.password);
                return Array.isArray(data) ? data.map(mapRadarrMovie) : [];
            } else if (type === LibraryType.SONARR) {
                const data = await fetchWithAuth(config.url, 'api/v3/series', config.apiKey, config.username, config.password);
                return Array.isArray(data) ? data.map(mapSonarrSeries) : [];
            }
        } catch (e) {
            console.error(`Failed to fetch ${type} library:`, e);
            throw e; 
        }
        
        return [];
    },

    getQueue: async (): Promise<DownloadQueueItem[]> => {
        const radarrConfig = getConfig(LibraryType.RADARR);
        const sonarrConfig = getConfig(LibraryType.SONARR);
        
        if (!radarrConfig && !sonarrConfig) return MOCK_QUEUE;

        let queue: DownloadQueueItem[] = [];

        if (radarrConfig) {
            try {
                const rQueue = await fetchWithAuth(radarrConfig.url, 'api/v3/queue', radarrConfig.apiKey, radarrConfig.username, radarrConfig.password);
                if (rQueue.records) {
                    queue = [...queue, ...rQueue.records.map((q: any) => mapQueueItem(q, 'Radarr'))];
                }
            } catch (e) { /* Ignore partial failure */ }
        }

        if (sonarrConfig) {
            try {
                const sQueue = await fetchWithAuth(sonarrConfig.url, 'api/v3/queue', sonarrConfig.apiKey, sonarrConfig.username, sonarrConfig.password);
                 if (sQueue.records) {
                    queue = [...queue, ...sQueue.records.map((q: any) => mapQueueItem(q, 'Sonarr'))];
                }
            } catch (e) { /* Ignore partial failure */ }
        }

        return queue;
    },

    getDiskSpace: async (): Promise<ServerStat[]> => {
        const configs = [getConfig(LibraryType.RADARR), getConfig(LibraryType.SONARR)].filter(c => c !== undefined) as ServiceConfig[];
        
        if (configs.length === 0) return MOCK_SERVER_STATS;

        for (const config of configs) {
            try {
                const data = await fetchWithAuth(config.url, 'api/v3/diskspace', config.apiKey, config.username, config.password);
                if (Array.isArray(data)) {
                    return data.map((d: any) => ({
                        path: d.path,
                        label: d.label || d.path,
                        free: Math.round(d.freeSpace / 1073741824),
                        total: Math.round(d.totalSpace / 1073741824)
                    }));
                }
            } catch (e) {
                // Continue
            }
        }
        throw new Error("All disk space providers failed");
    },

    getServicesStatus: async (): Promise<ServiceStatus[]> => {
        const saved = localStorage.getItem('hydrarr_services');
        if (!saved) return [];
        
        const services: ServiceConfig[] = JSON.parse(saved);
        const activeServices = services.filter(s => s.enabled);
        
        const statuses: ServiceStatus[] = [];

        for (const s of activeServices) {
            try {
                const sys = await fetchWithAuth(s.url, 'api/v3/system/status', s.apiKey, s.username, s.password);
                statuses.push({
                    id: s.id,
                    name: s.name,
                    status: 'Online',
                    version: sys.version || '?.?.?',
                    uptime: 'Online',
                    port: parseInt(s.url.split(':').pop() || '0'),
                    type: s.type as any
                });
            } catch (e) {
                statuses.push({
                    id: s.id,
                    name: s.name,
                    status: 'Offline',
                    version: '-',
                    uptime: '-',
                    port: parseInt(s.url.split(':').pop() || '0'),
                    type: s.type as any
                });
            }
        }
        
        return statuses;
    }
};