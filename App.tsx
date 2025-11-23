
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LeftDrawerContent, BottomNav } from './components/Navigation';
import { RightDrawerContent } from './components/RightDrawer';
import { Dashboard } from './views/Dashboard';
import { CalendarView } from './views/CalendarView';
import { LibraryManagerScreen } from './views/LibraryManagerScreen';
import { SettingsView } from './views/SettingsView';
import { LibraryType } from './types';

// --- Physics Engine Core ---
const AppContent: React.FC = () => {
  const [drawerState, setDrawerState] = useState<'closed' | 'left' | 'right'>('closed');
  
  // Logic Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  
  // Drawer Refs for visibility management
  const leftDrawerRef = useRef<HTMLDivElement>(null);
  const rightDrawerRef = useRef<HTMLDivElement>(null);

  const touchStartRef = useRef<number | null>(null);
  const currentTranslateRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  
  // Constants for Physics
  const EDGE_ZONE = 60; // px from edge to trigger swipe
  const MAX_DRAWER_WIDTH_PCT = 0.85; // 85% of screen width
  const MAX_DRAWER_WIDTH_PX = 380; // Increased to 380 for better visibility
  
  const getDrawerWidth = () => Math.min(window.innerWidth * MAX_DRAWER_WIDTH_PCT, MAX_DRAWER_WIDTH_PX);

  // --- Animation & Transform Logic ---
  const applyTransform = (translateX: number, animate: boolean = false) => {
     if (!containerRef.current) return;
     
     const drawerWidth = getDrawerWidth();
     const progress = Math.min(Math.abs(translateX) / drawerWidth, 1);
     
     // Physics Specs:
     // Scale: 1.0 -> 0.88 (Shrink more to reveal content)
     // Radius: 0px -> 32px
     // Shadow: grows with progress
     const scale = 1 - (progress * 0.12); 
     const borderRadius = progress * 32;
     const shadowOpacity = progress * 0.5;
     
     // CSS Transition for "Snap" effect
     containerRef.current.style.transition = animate 
        ? 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.5s cubic-bezier(0.32, 0.72, 0, 1)' 
        : 'none';
     
     // 3D Transform
     containerRef.current.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale})`;
     containerRef.current.style.borderRadius = `${borderRadius}px`;
     
     // Dynamic Shadow based on direction
     const shadowX = translateX > 0 ? -30 : 30;
     containerRef.current.style.boxShadow = Math.abs(translateX) > 1 
        ? `${shadowX}px 0 60px -10px rgba(0,0,0,${shadowOpacity})` 
        : 'none';

     // Drawer Visibility & Z-Index Logic to prevent overlaps
     if (leftDrawerRef.current && rightDrawerRef.current) {
         if (translateX > 0) {
             // Opening Left Drawer: Ensure it is on top and visible, hide Right
             leftDrawerRef.current.style.zIndex = '2';
             leftDrawerRef.current.style.visibility = 'visible';
             
             rightDrawerRef.current.style.zIndex = '1';
             rightDrawerRef.current.style.visibility = 'hidden';
         } else if (translateX < 0) {
             // Opening Right Drawer: Ensure it is on top and visible, hide Left
             rightDrawerRef.current.style.zIndex = '2';
             rightDrawerRef.current.style.visibility = 'visible';
             
             leftDrawerRef.current.style.zIndex = '1';
             leftDrawerRef.current.style.visibility = 'hidden';
         }
         // Note: We do NOT toggle visibility at 0. 
         // This prevents the drawer from disappearing instantly (clipping) 
         // while the window is animating back to closed state.
     }

     // Scrim Overlay
     if (scrimRef.current) {
        scrimRef.current.style.transition = animate ? 'opacity 0.5s ease' : 'none';
        scrimRef.current.style.opacity = `${progress * 0.3}`; // Max 30% opacity
        scrimRef.current.style.pointerEvents = progress > 0.01 ? 'auto' : 'none';
     }
  };

  // Sync React State to Visuals
  useEffect(() => {
      const drawerWidth = getDrawerWidth();
      if (drawerState === 'left') {
          currentTranslateRef.current = drawerWidth;
          applyTransform(drawerWidth, true);
      } else if (drawerState === 'right') {
          currentTranslateRef.current = -drawerWidth;
          applyTransform(-drawerWidth, true);
      } else {
          currentTranslateRef.current = 0;
          applyTransform(0, true);
      }
  }, [drawerState]);

  // Handle Resize / Orientation Change
  useEffect(() => {
    const handleResize = () => {
        if (drawerState !== 'closed') {
             const w = getDrawerWidth();
             const target = drawerState === 'left' ? w : -w;
             currentTranslateRef.current = target;
             applyTransform(target, false); // Snap to new width without animation
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerState]);

  const closeAll = () => setDrawerState('closed');

  // --- Gesture Handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
      touchStartRef.current = e.touches[0].clientX;
      isDraggingRef.current = false;
      
      // Edge detection if closed
      if (drawerState === 'closed') {
          const x = touchStartRef.current;
          if (x < EDGE_ZONE || x > window.innerWidth - EDGE_ZONE) {
              isDraggingRef.current = true;
          }
      } else {
          // If open, allow drag anywhere (to close)
          isDraggingRef.current = true;
      }
  };

  const onTouchMove = (e: React.TouchEvent) => {
      if (!isDraggingRef.current || touchStartRef.current === null) return;
      
      const currentX = e.touches[0].clientX;
      const diff = currentX - touchStartRef.current;
      const drawerWidth = getDrawerWidth();
      
      let newTranslate = 0;

      if (drawerState === 'left') {
          // Closing Left (dragging left, negative diff)
          newTranslate = drawerWidth + diff;
          newTranslate = Math.max(0, Math.min(newTranslate, drawerWidth)); // Clamp 0 -> MAX
      } else if (drawerState === 'right') {
          // Closing Right (dragging right, positive diff)
          newTranslate = -drawerWidth + diff;
          newTranslate = Math.max(-drawerWidth, Math.min(newTranslate, 0)); // Clamp -MAX -> 0
      } else {
          // Opening from Closed
          if (touchStartRef.current < EDGE_ZONE) {
              // Opening Left
              newTranslate = Math.max(0, Math.min(diff, drawerWidth));
          } else if (touchStartRef.current > window.innerWidth - EDGE_ZONE) {
              // Opening Right
              newTranslate = Math.max(-drawerWidth, Math.min(diff, 0));
          }
      }
      
      currentTranslateRef.current = newTranslate;
      applyTransform(newTranslate, false); // Raw 1:1 movement
  };

  const onTouchEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      touchStartRef.current = null;

      const current = currentTranslateRef.current;
      const drawerWidth = getDrawerWidth();
      const threshold = drawerWidth * 0.3; // 30% threshold to snap

      if (drawerState === 'left') {
          // If we dragged significantly to the left (reducing translate), close it
          if (current < drawerWidth - threshold) setDrawerState('closed');
          else setDrawerState('left'); // Snap back open
      } else if (drawerState === 'right') {
          // If we dragged significantly to the right (increasing translate from negative), close it
          if (current > -drawerWidth + threshold) setDrawerState('closed');
          else setDrawerState('right');
      } else {
          // Opening
          if (current > threshold) setDrawerState('left');
          else if (current < -threshold) setDrawerState('right');
          else {
              applyTransform(0, true); // Snap back closed
          }
      }
  };

  // Context Props for Views
  const dashboardProps = {
    onOpenLeftDrawer: () => setDrawerState('left'),
    onOpenRightDrawer: () => setDrawerState('right'),
    leftDrawerOpen: drawerState === 'left',
    rightDrawerOpen: drawerState === 'right'
  };

  return (
      <div 
        className="fixed inset-0 bg-black overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* --- LAYER 0: BACKGROUND UNDERLAY (Drawers) --- */}
        
        {/* Left Drawer Underlay */}
        <div 
            ref={leftDrawerRef}
            className="absolute inset-y-0 left-0 bg-[#111827] z-0 shadow-[inset_-20px_0_50px_rgba(0,0,0,0.5)]"
            style={{ 
                width: `${Math.min(85, (MAX_DRAWER_WIDTH_PX / window.innerWidth) * 100)}%`,
                // Initial state doesn't matter as much as dynamic updates, but start safe
            }}
        >
             <LeftDrawerContent closeDrawer={closeAll} />
        </div>

        {/* Right Drawer Underlay */}
        <div 
            ref={rightDrawerRef}
            className="absolute inset-y-0 right-0 bg-[#0B0F19] z-0 shadow-[inset_20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5"
            style={{ 
                width: `${Math.min(85, (MAX_DRAWER_WIDTH_PX / window.innerWidth) * 100)}%`
            }}
        >
             <RightDrawerContent onClose={closeAll} />
        </div>

        {/* --- LAYER 1: MAIN WINDOW (Movable Surface) --- */}
        <div 
            ref={containerRef}
            className="absolute inset-0 z-10 bg-[#0B0F19] overflow-hidden origin-center will-change-transform flex flex-col"
        >
            {/* Scrim Overlay */}
            <div 
                ref={scrimRef}
                className="absolute inset-0 bg-black z-50 opacity-0 pointer-events-none"
                onClick={closeAll}
            />

            {/* Application Routes */}
            <div className="flex-1 relative w-full h-full overflow-y-auto no-scrollbar bg-[#0B0F19]">
                <Routes>
                    <Route path="/" element={<Navigate to="/movies" replace />} />
                    <Route path="/movies" element={<Dashboard {...dashboardProps} />} />
                    <Route path="/tv" element={<Dashboard {...dashboardProps} />} />
                    <Route path="/music" element={<Dashboard {...dashboardProps} />} />
                    <Route path="/books" element={<Dashboard {...dashboardProps} />} />
                    <Route path="/calendar" element={<CalendarView {...dashboardProps} />} />
                    <Route path="/server" element={<Dashboard {...dashboardProps} />} />
                    <Route path="/settings" element={<SettingsView {...dashboardProps} />} />
                    
                    {/* Tools Routes */}
                    <Route path="/tools/radarr" element={<LibraryManagerScreen type={LibraryType.RADARR} {...dashboardProps} />} />
                    <Route path="/tools/sonarr" element={<LibraryManagerScreen type={LibraryType.SONARR} {...dashboardProps} />} />
                    <Route path="/tools/lidarr" element={<LibraryManagerScreen type={LibraryType.LIDARR} {...dashboardProps} />} />
                    <Route path="/tools/readarr" element={<LibraryManagerScreen type={LibraryType.READARR} {...dashboardProps} />} />
                    
                    <Route path="*" element={<Navigate to="/movies" replace />} />
                </Routes>
                
                {/* Bottom Nav (Inside the moving window) */}
                <div className="sticky bottom-0 z-40">
                    <BottomNav />
                </div>
            </div>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
