
import React, { useState, useEffect } from 'react';
import { ServerStat, DownloadQueueItem, ServiceStatus } from '../types';
import { HardDrive, Activity, Zap, AlertTriangle, Cpu, MemoryStick, Server } from 'lucide-react';

// --- Hooks (Modified for mix of real/simulated) ---

// We keep simulated queue for widgets that don't pass data, but export a version that takes initial data
export const useSimulatedQueue = (initialQueue: DownloadQueueItem[]) => {
  const [queue, setQueue] = useState(initialQueue);
  const [totalSpeed, setTotalSpeed] = useState(0);

  // If initialQueue is empty or static, this effect could be removed if using real real-time fetching upstream
  useEffect(() => {
      setQueue(initialQueue);
      // Calculate simple total speed from initial data for immediate display
      const speed = initialQueue.reduce((acc, item) => acc + (parseFloat(item.speed) || 0), 0);
      setTotalSpeed(speed);
  }, [initialQueue]);

  return { queue, totalSpeed };
};

// --- New Hook for CPU/RAM (Still Simulated as browsers can't fetch this natively) ---
export const useSystemLoad = () => {
    const [cpu, setCpu] = useState(15);
    const [ram, setRam] = useState(42);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(prev => {
                const change = Math.floor(Math.random() * 10) - 5;
                return Math.max(5, Math.min(95, prev + change));
            });
            setRam(prev => {
                const change = Math.floor(Math.random() * 4) - 2;
                return Math.max(20, Math.min(90, prev + change));
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return { cpu, ram };
};


// --- Sub Components ---

export const SystemHealthCard: React.FC = () => {
    const { cpu, ram } = useSystemLoad();
    
    const renderGauge = (value: number, label: string, icon: React.ReactNode, color: string) => {
        const radius = 40; // Normalized radius for 0-100 viewBox
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / 100) * circumference;

        return (
            <div className="flex flex-col items-center justify-center gap-2 flex-1 min-w-[100px]">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 xl:w-32 xl:h-32">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={color}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-2xl sm:text-3xl font-black tracking-tighter ${value > 80 ? 'text-rose-500' : 'text-white'}`}>
                            {value}<span className="text-sm opacity-60 align-top ml-0.5">%</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full border border-white/5">
                    {icon} {label}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-[24px] p-6 shadow-xl flex items-center justify-around h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
            {renderGauge(cpu, 'CPU', <Cpu size={14} />, cpu > 80 ? '#ef4444' : '#3b82f6')}
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-50" />
            {renderGauge(ram, 'RAM', <MemoryStick size={14} />, ram > 80 ? '#f59e0b' : '#10b981')}
            
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] text-emerald-400 font-bold font-mono border border-emerald-500/20 bg-emerald-500/10 rounded px-1.5 py-0.5 backdrop-blur-sm">
                <Server size={9} /> 22j UPTIME
            </div>
        </div>
    );
};

export const ServiceHealthCard: React.FC<{ services: ServiceStatus[] }> = ({ services }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-[24px] p-6 shadow-xl h-full flex flex-col">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <Activity size={18} /> 
                </div>
                État des Services
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${service.status === 'Online' ? 'bg-emerald-500 text-emerald-500' : service.status === 'Warning' ? 'bg-amber-500 text-amber-500' : 'bg-rose-500 text-rose-500'}`} />
                             <div>
                                 <div className="text-sm font-bold text-gray-200 leading-none mb-1">{service.name}</div>
                                 <div className="text-[10px] text-gray-500 font-mono">:{service.port}</div>
                             </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-medium text-gray-400 bg-black/30 px-1.5 py-0.5 rounded">{service.version}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DiskStatsCard: React.FC<{ stats: ServerStat[] }> = ({ stats }) => {
  // If stats are empty, show placeholder
  const isEmpty = stats.length === 0;
  
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
  
  // Calculations for SVG Donut
  const totalSystemCapacity = stats.reduce((acc, s) => acc + s.total, 0);
  const totalUsed = stats.reduce((acc, s) => acc + (s.total - s.free), 0);
  const usedPercentage = totalSystemCapacity > 0 ? Math.round((totalUsed / totalSystemCapacity) * 100) : 0;

  // Create segments for the donut
  let cumulativePercent = 0;
  const segments = stats.map((stat, index) => {
      const used = stat.total - stat.free;
      const percent = (used / totalSystemCapacity) * 100;
      const start = cumulativePercent;
      cumulativePercent += percent;
      
      // Determine color based on usage threshold of individual drive
      const driveUsagePct = (used / stat.total) * 100;
      let color = COLORS[index % COLORS.length];
      if (driveUsagePct > 90) color = '#ef4444'; // Red if full

      return { 
          ...stat, 
          percent, 
          start, 
          color
      };
  });

  // Helper for SVG arcs
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-[24px] p-6 shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
            <HardDrive size={18} /> 
        </div>
        Stockage
      </h3>
      
      {isEmpty ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Aucune donnée disque.
          </div>
      ) : (
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
            {/* Background Circle */}
            <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                <circle cx="0" cy="0" r="0.85" fill="transparent" stroke="#1f2937" strokeWidth="0.2" />
                {segments.map((seg, i) => {
                    if (seg.percent === 0) return null;
                    const startAngle = seg.start / 100;
                    const endAngle = (seg.start + seg.percent) / 100;
                    
                    const [startX, startY] = getCoordinatesForPercent(startAngle);
                    const [endX, endY] = getCoordinatesForPercent(endAngle);
                    const largeArcFlag = seg.percent > 50 ? 1 : 0;

                    // Scaled Radius
                    const r = 0.85;

                    return (
                        <path 
                            key={i}
                            d={`M ${startX * r} ${startY * r} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX * r} ${endY * r}`}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="0.2"
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                        />
                    );
                })}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-500 font-medium uppercase">Utilisé</span>
                <span className={`text-xl font-bold ${usedPercentage > 90 ? 'text-rose-500' : 'text-white'}`}>{usedPercentage}%</span>
            </div>
        </div>

        <div className="w-full space-y-2 overflow-y-auto no-scrollbar max-h-[180px] px-1">
            {stats.map((stat, index) => {
                const used = stat.total - stat.free;
                const isCritical = (used / stat.total) > 0.9;
                return (
                <div key={stat.path} className="flex items-center justify-between text-sm group bg-gray-900/30 p-2 rounded-lg border border-transparent hover:border-white/5 transition-colors">
                    <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]`} style={{ backgroundColor: segments[index].color, color: segments[index].color }} />
                    <span className="text-gray-300 group-hover:text-white transition-colors text-xs font-medium">{stat.label}</span>
                    {isCritical && <AlertTriangle size={12} className="text-rose-500 animate-pulse" />}
                    </div>
                    <span className="text-gray-400 font-mono text-[10px]">
                    {used.toFixed(1)}/{stat.total}GB
                    </span>
                </div>
                )
            })}
        </div>
      </div>
      )}
    </div>
  );
};

export const NetworkStatsCard: React.FC<{ queue: DownloadQueueItem[] }> = ({ queue }) => {
  const { queue: liveQueue, totalSpeed } = useSimulatedQueue(queue);

  const getSpeedColor = (speedStr: string) => {
    const val = parseFloat(speedStr) || 0;
    if (val > 50) return 'text-emerald-400';
    if (val > 20) return 'text-indigo-400';
    if (val > 5) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getSpeedBarColor = (speedStr: string) => {
    const val = parseFloat(speedStr) || 0;
    if (val > 50) return 'bg-emerald-500';
    if (val > 20) return 'bg-indigo-500';
    if (val > 5) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
  // Calculate gauge percentage (max 120MB/s)
  const gaugePct = Math.min(100, (totalSpeed / 120) * 100);

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-[24px] p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
           <Activity size={100} />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                <Activity size={18} /> 
            </div>
            Réseau
          </h3>
          
          {/* Speed Visual Indicator (Text Pill) */}
          <div className={`px-3 py-1 rounded-full flex items-center gap-2 border transition-colors ${totalSpeed > 80 ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-black/30 border-white/5'}`}>
               <div className={`w-2 h-2 rounded-full ${totalSpeed > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
               <span className={`text-xs font-mono font-bold ${totalSpeed > 80 ? 'text-emerald-400' : 'text-gray-300'}`}>
                   {totalSpeed.toFixed(1)} MB/s
               </span>
          </div>
      </div>
      
      {/* Speed Threshold Gauge Bar */}
      <div className="w-full h-1.5 bg-gray-700/50 rounded-full mb-6 overflow-hidden relative z-10">
          {/* Threshold Markers */}
          <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-black/20 z-20" />
          <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-black/20 z-20" />
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-black/20 z-20" />
          
          {/* Gradient Bar */}
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-300"
            style={{ width: `${gaugePct}%` }} 
          />
      </div>
      
      {liveQueue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[100px]">
          <Activity size={32} className="opacity-20 mb-2" />
          <p className="text-xs">Réseau Inactif</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-1 relative z-10 min-h-[100px]">
          {liveQueue.slice(0, 4).map(item => (
            <div key={item.id} className="bg-gray-900/50 p-2.5 rounded-xl border border-gray-700/50 transition-all hover:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <div className="min-w-0 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Downloading' ? 'bg-indigo-400 animate-pulse' : 'bg-gray-600'}`} />
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[180px] leading-tight">{item.title}</h4>
                </div>
                <div className={`text-[10px] font-bold font-mono flex items-center gap-1 ${getSpeedColor(item.speed)}`}>
                    <Zap size={10} fill="currentColor" />
                    {item.speed}
                </div>
              </div>
              
              <div className="w-full bg-gray-700/50 h-1 rounded-full overflow-hidden mb-1">
                <div 
                  className={`h-full transition-all duration-700 ease-out rounded-full ${getSpeedBarColor(item.speed)}`} 
                  style={{ width: `${item.progress}%`, boxShadow: '0 0 10px currentColor' }} 
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-500">
                   <span>{item.size}</span>
                   <span>{item.client}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5 relative z-10">
        <div className="text-center flex-1 border-r border-white/5">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Total Desc.</p>
          <p className="text-lg font-black text-emerald-400">{totalSpeed.toFixed(1)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Total Asc.</p>
          <p className="text-lg font-black text-indigo-400">{(totalSpeed * 0.1).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};
