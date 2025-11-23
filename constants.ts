
import { MediaItem, MediaType, Status, ServerStat, DownloadQueueItem, CalendarEvent, WidgetDefinition, WidgetType, WidgetSource, ServerConfig, DashboardContext, ServiceStatus, LibraryType } from './types';

// Helper to generate dates
const today = new Date();

export const SERVERS: ServerConfig[] = [
  { id: '1', name: 'Serveur Principal', type: 'Unraid', url: 'http://192.168.1.10' }
];

// Centralized Theme Configuration
export const THEME_COLORS = {
  RADARR: {
    primary: '#fbbf24', // Amber 400
    secondary: '#92400e', // Amber 800
    accentClass: 'text-amber-400',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500'
  },
  SONARR: {
    primary: '#38bdf8', // Sky 400
    secondary: '#075985', // Sky 800
    accentClass: 'text-sky-400',
    bgClass: 'bg-sky-500',
    borderClass: 'border-sky-500'
  },
  LIDARR: {
    primary: '#34d399', // Emerald 400
    secondary: '#065f46', // Emerald 800
    accentClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500'
  },
  READARR: {
    primary: '#a78bfa', // Violet 400
    secondary: '#5b21b6', // Violet 800
    accentClass: 'text-violet-400',
    bgClass: 'bg-violet-500',
    borderClass: 'border-violet-500'
  },
  SERVER: {
    primary: '#22d3ee', // Cyan 400 (Brand)
    secondary: '#0e7490', // Cyan 700
    accentClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500'
  },
  CALENDAR: {
    primary: '#818cf8', // Indigo 400
    secondary: '#4338ca', // Indigo 700
    accentClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500',
    borderClass: 'border-indigo-500'
  }
};

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  // Movies
  { 
    type: WidgetType.RADARR_RECENT, 
    title: 'Récemment Ajoutés', 
    source: WidgetSource.RADARR, 
    description: 'Films ajoutés les 30 derniers jours', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.MOVIES]
  },
  { 
    type: WidgetType.RADARR_CINEMA, 
    title: 'Au Cinéma', 
    source: WidgetSource.RADARR, 
    description: 'Films actuellement en salle', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.MOVIES]
  },
  
  // TV
  { 
    type: WidgetType.SONARR_UPCOMING, 
    title: 'Calendrier Diffusions', 
    source: WidgetSource.SONARR, 
    description: 'Épisodes prévus dans les 7 jours', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.TV]
  },
  { 
    type: WidgetType.SONARR_ON_AIR, 
    title: 'Diffusé Aujourd\'hui', 
    source: WidgetSource.SONARR, 
    description: 'Épisodes diffusés ce jour', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.TV]
  },

  // Music
  { 
    type: WidgetType.LIDARR_RECENT, 
    title: 'Albums Récents', 
    source: WidgetSource.LIDARR, 
    description: 'Albums ajoutés récemment', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.MUSIC]
  },

  // System / Generic
  { 
    type: WidgetType.SERVER_DISK, 
    title: 'Espace Disque', 
    source: WidgetSource.SERVER, 
    description: 'État du stockage', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.SERVER, DashboardContext.MOVIES, DashboardContext.TV]
  },
  { 
    type: WidgetType.QUEUE_MINI, 
    title: 'Téléchargements Actifs', 
    source: WidgetSource.SERVER, 
    description: 'Vitesse et progression en temps réel', 
    defaultSize: 'small',
    supportedContexts: [DashboardContext.MOVIES, DashboardContext.TV, DashboardContext.MUSIC, DashboardContext.BOOKS, DashboardContext.SERVER]
  },
  
  // Trakt
  { 
    type: WidgetType.TRAKT_TRENDING, 
    title: 'Tendances Actuelles', 
    source: WidgetSource.TRAKT, 
    description: 'Ce qui est populaire mondialement', 
    defaultSize: 'medium',
    supportedContexts: [DashboardContext.MOVIES, DashboardContext.TV]
  },
];

// Default Layouts per Tab
export const DEFAULT_LAYOUTS: Record<DashboardContext, {type: WidgetType, source: WidgetSource}[]> = {
  [DashboardContext.MOVIES]: [
    { type: WidgetType.QUEUE_MINI, source: WidgetSource.SERVER },
    { type: WidgetType.RADARR_RECENT, source: WidgetSource.RADARR },
    { type: WidgetType.RADARR_CINEMA, source: WidgetSource.RADARR },
  ],
  [DashboardContext.TV]: [
    { type: WidgetType.SONARR_UPCOMING, source: WidgetSource.SONARR },
    { type: WidgetType.SONARR_ON_AIR, source: WidgetSource.SONARR },
    { type: WidgetType.QUEUE_MINI, source: WidgetSource.SERVER },
  ],
  [DashboardContext.MUSIC]: [
    { type: WidgetType.QUEUE_MINI, source: WidgetSource.SERVER },
    { type: WidgetType.LIDARR_RECENT, source: WidgetSource.LIDARR },
  ],
  [DashboardContext.BOOKS]: [
    { type: WidgetType.QUEUE_MINI, source: WidgetSource.SERVER },
  ],
  [DashboardContext.CALENDAR]: [],
  [DashboardContext.SERVER]: [
    { type: WidgetType.SERVER_DISK, source: WidgetSource.SERVER },
    { type: WidgetType.QUEUE_MINI, source: WidgetSource.SERVER },
  ],
};

// --- MOCK DATA ---

export const MOCK_MEDIA: MediaItem[] = [
  // Movies
  {
    id: 1,
    title: "Roofman",
    year: 2025,
    type: MediaType.MOVIE,
    status: Status.DOWNLOADING,
    posterUrl: "https://image.tmdb.org/t/p/original/9mJ9dxp682Z79E2b2r9g6x8.jpg",
    rating: 7.2,
    dominantColor: "#EAB308", // Yellow
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    quality: "WEBDL-2160p",
    size: "14.2 GB",
    progress: 45
  },
  {
    id: 2,
    title: "Now You See Me 3",
    year: 2025,
    type: MediaType.MOVIE,
    status: Status.MISSING,
    posterUrl: "https://image.tmdb.org/t/p/original/2wR7fH6c9z6d8.jpg",
    rating: 8.4,
    dominantColor: "#1E3A8A", // Blue
    quality: "Bluray-1080p",
  },
  {
    id: 3,
    title: "Mickey 17",
    year: 2025,
    type: MediaType.MOVIE,
    status: Status.DOWNLOADED,
    posterUrl: "https://image.tmdb.org/t/p/w500/5y8.jpg",
    rating: 6.9,
    dominantColor: "#10B981", // Greenish
    quality: "Bluray-2160p",
    size: "45.1 GB"
  },
  // Series
  {
    id: 4,
    title: "Severance",
    year: 2022,
    type: MediaType.SERIES,
    status: Status.CONTINUING,
    posterUrl: "https://image.tmdb.org/t/p/w500/p7f.jpg",
    rating: 8.8,
    seasonCount: 2,
    dominantColor: "#064E3B", // Dark Green
    trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: 5,
    title: "The Last of Us",
    year: 2023,
    type: MediaType.SERIES,
    status: Status.ENDED,
    posterUrl: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T6.jpg",
    rating: 9.2,
    seasonCount: 1,
    dominantColor: "#B91C1C", // Red
  },
  // Music
  {
    id: 10,
    title: "Random Access Memories",
    artist: "Daft Punk",
    year: 2013,
    type: MediaType.MUSIC,
    status: Status.DOWNLOADED,
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg",
    rating: 9.0,
    dominantColor: "#111827", // Black/Gold
    quality: "FLAC",
  },
  {
    id: 11,
    title: "After Hours",
    artist: "The Weeknd",
    year: 2020,
    type: MediaType.MUSIC,
    status: Status.MISSING,
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png",
    rating: 8.5,
    dominantColor: "#991B1B", // Red
  },
  // Books
  {
    id: 20,
    title: "Project Hail Mary",
    author: "Andy Weir",
    year: 2021,
    type: MediaType.BOOK,
    status: Status.DOWNLOADED,
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/40/Project_Hail_Mary_cover.jpg",
    rating: 4.8,
    dominantColor: "#F59E0B", // Gold
  }
];

export const MOCK_QUEUE: DownloadQueueItem[] = [
  {
    id: 1,
    title: "Roofman (2025) 2160p HDR",
    client: "SABnzbd",
    speed: "45 MB/s",
    timeLeft: "12m",
    progress: 45,
    status: "Downloading",
    size: "14.2 GB",
    type: MediaType.MOVIE
  },
  {
    id: 2,
    title: "Severance S02E04 2160p",
    client: "qBittorrent",
    speed: "12 MB/s",
    timeLeft: "5m",
    progress: 78,
    status: "Downloading",
    size: "4.1 GB",
    type: MediaType.SERIES
  }
];

export const MOCK_SERVER_STATS: ServerStat[] = [
  { path: "/movies", free: 4500, total: 12000, label: "Films" },
  { path: "/tv", free: 2100, total: 8000, label: "Séries TV" },
];

export const MOCK_SERVICES: ServiceStatus[] = [
    { id: '1', name: 'Radarr', status: 'Online', version: '5.3.0.8489', uptime: '14j 2h', port: 7878, type: LibraryType.RADARR },
    { id: '2', name: 'Sonarr', status: 'Online', version: '4.0.1.929', uptime: '4j 12h', port: 8989, type: LibraryType.SONARR },
    { id: '3', name: 'Lidarr', status: 'Warning', version: '2.1.2.398', uptime: '1j 5h', port: 8686, type: LibraryType.LIDARR },
    { id: '4', name: 'Plex Media Server', status: 'Online', version: '1.40.0.7998', uptime: '22j 4h', port: 32400, type: 'Plex' },
    { id: '5', name: 'SABnzbd', status: 'Online', version: '4.2.1', uptime: '10j 1h', port: 8080, type: 'System' },
    { id: '6', name: 'qBittorrent', status: 'Online', version: '4.6.3', uptime: '14j 2h', port: 8085, type: 'System' },
];
