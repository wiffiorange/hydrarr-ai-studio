
export enum MediaType {
  MOVIE = 'movie',
  SERIES = 'series',
  MUSIC = 'music',
  BOOK = 'book'
}

export enum LibraryType {
  RADARR = 'Radarr',
  SONARR = 'Sonarr',
  LIDARR = 'Lidarr',
  READARR = 'Readarr'
}

export enum Status {
  DOWNLOADED = 'Téléchargé',
  MISSING = 'Manquant',
  MONITORING = 'Surveillé',
  DOWNLOADING = 'Téléchargement',
  UNMONITORED = 'Non Surveillé',
  ENDED = 'Terminé',
  CONTINUING = 'En Cours'
}

export interface MediaItem {
  id: number;
  title: string;
  year: number;
  type: MediaType;
  status: Status;
  posterUrl: string;
  rating: number;
  quality?: string;
  size?: string;
  overview?: string;
  progress?: number; // 0-100 for downloads
  addedDate?: Date;
  seasonCount?: number; // For TV
  network?: string;     // For TV
  artist?: string;      // For Music
  author?: string;      // For Books
  genres?: string[];
  dominantColor?: string; // Simulated dynamic color extraction
  trailerUrl?: string; // URL for Hero Video Card preview
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date; // JS Date object
  type: MediaType;
  status: Status;
}

export interface ServerStat {
  path: string;
  free: number; // GB
  total: number; // GB
  label: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'Warning';
  version: string;
  uptime: string;
  port: number;
  type: LibraryType | 'Plex' | 'System';
}

export interface DownloadQueueItem {
  id: number;
  title: string;
  client: 'SABnzbd' | 'qBittorrent';
  speed: string;
  timeLeft: string;
  progress: number;
  status: 'Downloading' | 'Paused' | 'Queued';
  size?: string;
  type: MediaType; // Added for context filtering
}

// --- New Types for Dashboard Customization ---

export enum WidgetType {
  // Generic
  QUEUE_MINI = 'queue_mini',
  SERVER_DISK = 'server_disk',
  
  // Movies
  RADARR_RECENT = 'radarr_recent',
  RADARR_CINEMA = 'radarr_cinema',
  RADARR_WANTED = 'radarr_wanted',
  
  // TV
  SONARR_UPCOMING = 'sonarr_upcoming',
  SONARR_CALENDAR = 'sonarr_calendar',
  SONARR_ON_AIR = 'sonarr_on_air',
  
  // Music/Books
  LIDARR_RECENT = 'lidarr_recent',
  READARR_MISSING = 'readarr_missing',
  
  // External
  TRAKT_TRENDING = 'trakt_trending'
}

export enum WidgetSource {
  RADARR = 'Radarr',
  SONARR = 'Sonarr',
  LIDARR = 'Lidarr',
  READARR = 'Readarr',
  SERVER = 'Système',
  TRAKT = 'Trakt'
}

export interface DashboardWidget {
  id: string; // Unique instance ID
  type: WidgetType;
  source: WidgetSource;
}

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  source: WidgetSource;
  description: string;
  defaultSize: 'small' | 'medium' | 'large';
  supportedContexts: DashboardContext[]; // Which tabs can show this widget
}

export enum DashboardContext {
  MOVIES = 'movies',
  TV = 'tv',
  MUSIC = 'music',
  BOOKS = 'books',
  CALENDAR = 'calendar',
  SERVER = 'server'
}

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  type: 'Unraid' | 'Synology' | 'Windows' | 'Docker';
  username?: string;
  password?: string;
}

export interface ServiceConfig {
    id: string;
    name: string;
    type: LibraryType | 'Plex' | 'SABnzbd' | 'qBittorrent';
    url: string;
    apiKey?: string;
    username?: string;
    password?: string;
    enabled: boolean;
    icon?: any; // For UI rendering
    color?: string;
}

export type ToolTab = 'Tout' | 'Surveillé' | 'Manquant' | 'À venir' | 'Historique' | 'Téléchargé';
