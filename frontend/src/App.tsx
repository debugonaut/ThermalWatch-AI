import './index.css';
import { MapCanvas } from './components/MapCanvas';
import { LeftDock } from './components/LeftDock';
import { RightDock } from './components/RightDock';
import { LayersPopover } from './components/LayersPopover';
import { MetricSelectorPopover } from './components/MetricSelectorPopover';
import { LocationSearchPopover } from './components/LocationSearchPopover';
import { CalendarPopover } from './components/CalendarPopover';
import { HotspotTooltip } from './components/HotspotTooltip';
import { ThermalLegend } from './components/ThermalLegend';
import { ModePill } from './components/ModePill';
import { InspectorDrawer } from './components/InspectorDrawer';
import { AnomalyAlertModal } from './components/AnomalyAlertModal';
import { EmergencySimulationModal } from './components/EmergencySimulationModal';
import { DiurnalPlaybackController } from './components/prompt7/DiurnalPlaybackController';
import { SplitWipeView } from './components/prompt6/SplitWipeView';
import { ExportModal } from './components/ExportModal';
import { LoadingScreen } from './components/LoadingScreen';
import { SimulationTimelineFAB } from './components/SimulationTimelineFAB';
import { SimulationTopBanner } from './components/SimulationTopBanner';
import { ModeSelectorOverlay } from './components/ModeSelectorOverlay';
import { useAppStore } from './store/useAppStore';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { trackVisit } from './utils/visitorTracker';

export default function App() {
  const { theme, mapMode, isLayersOpen, isMetricSelectorOpen, isLocationSearchOpen, isCalendarOpen, setMode } = useAppStore();

  // Mode selection & circular loading state
  const [isOverlayOpen, setIsOverlayOpen] = useState(true);
  const [hasSelectedMode, setHasSelectedMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModeLabel, setActiveModeLabel] = useState('2024 Full Year Coverage');

  const handleSelectMode = (selected: 'demo' | 'live', label: string) => {
    setMode(selected);
    setActiveModeLabel(label);
    setIsOverlayOpen(false);
    setIsLoading(true);
    setHasSelectedMode(true);
  };

  // Silent visitor tracking for judge/team telemetry
  useEffect(() => {
    trackVisit();
  }, []);

  // Sync theme to data attribute for potential CSS-level theming
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* ── Layer 0: Full-bleed map ── */}
      {mapMode === 'optical' ? (
        <SplitWipeView />
      ) : (
        <MapCanvas />
      )}

      {/* ── Layer 1: Floating UI chrome ── */}
      <LeftDock />
      <RightDock />

      {/* ── Layer 1: Map overlays ── */}
      <ModePill />
      {mapMode !== 'optical' && <ThermalLegend />}

      {/* ── Active Mode Switcher Pill (Top Header) ── */}
      {hasSelectedMode && (
        <button
          onClick={() => setIsOverlayOpen(true)}
          style={{
            position: 'fixed',
            top: 24,
            right: 250,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 999,
            background: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#ffffff',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            outline: 'none',
          }}
          className="hover:border-white hover:bg-zinc-900 active:scale-95"
          title="Switch Telemetry Mode"
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 6px #ffffff' }} />
          <span>{activeModeLabel.toUpperCase()}</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', marginLeft: 2, letterSpacing: '0.5px' }}>SWITCH</span>
        </button>
      )}

      {/* ── Layer 2: Popovers / Modals ── */}
      <AnimatePresence>
        {isLocationSearchOpen && <LocationSearchPopover key="location-search-popover" />}
        {isLayersOpen && <LayersPopover key="layers-popover" />}
        {isMetricSelectorOpen && <MetricSelectorPopover key="metric-popover" />}
        {isCalendarOpen && <CalendarPopover key="calendar-popover" />}
      </AnimatePresence>

      {/* ── Layer 3: 40% Telemetry & Diurnal Heat Inspector Drawer ── */}
      {/* Always render the drawer */}
      <InspectorDrawer />

      {/* ── Layer 4: Hover tooltip (pointer-events: none) ── */}
      {mapMode !== 'optical' && <HotspotTooltip />}

      {/* ── Layer 5: 24-Hour Diurnal Playback Controller (Prompt 7) ── */}
      <DiurnalPlaybackController />

      {/* ── Layer 5.5: Simulation-Exclusive Controls (Bottom-Left FAB & Top Exit Banner) ── */}
      <SimulationTimelineFAB />
      <SimulationTopBanner />

      {/* ── Layer 6: Anomaly Override Alert Modal ── */}
      <AnomalyAlertModal />

      {/* ── Layer 7: Emergency Simulation Prompt Modal ── */}
      <EmergencySimulationModal />

      {/* ── Layer 8: Tactical Dossier & Data Export Modal ── */}
      <ExportModal />

      {/* ── Layer 9: Mode Selection Toggler Overlay (Black & White MotionButton) ── */}
      <ModeSelectorOverlay
        isOpen={isOverlayOpen}
        onSelectMode={handleSelectMode}
      />

      {/* ── Layer 10: Circular Progress Loading Screen ── */}
      {isLoading && (
        <LoadingScreen
          modeName={activeModeLabel}
          onFinish={() => setIsLoading(false)}
        />
      )}

    </div>
  );
}




