'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  DevicePreset,
  DEVICE_PRESETS,
  DEFAULT_DEVICE,
  CHASSIS_COLORS,
  SCALE_PRESETS,
  PREVIEW_ROUTES,
  DeviceType,
} from './types';
import { DeviceFrame } from './DeviceFrame';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  ExternalLink,
  Sliders,
  Sparkles,
  Layers,
  ChevronDown,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export interface DevicePreviewLayoutProps {
  initialLocale?: string;
  defaultRoute?: string;
  className?: string;
}

export function DevicePreviewLayout({
  initialLocale = 'en',
  defaultRoute = '/',
  className = '',
}: DevicePreviewLayoutProps) {
  // Device selection state
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEFAULT_DEVICE);
  const [deviceFilter, setDeviceFilter] = useState<'all' | DeviceType>('all');
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);

  // Orientation and Hardware options
  const [isLandscape, setIsLandscape] = useState(false);
  const [showFrame, setShowFrame] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [chassisKey, setChassisKey] = useState<string>('titanium-natural');

  // Zoom & Scale State
  const [scale, setScale] = useState<number>(0.85);
  const [isAutoFit, setIsAutoFit] = useState(false);

  // Routing State for iframe
  const [currentPath, setCurrentPath] = useState(defaultRoute);
  const [inputUrl, setInputUrl] = useState(`/${initialLocale}${defaultRoute === '/' ? '' : defaultRoute}`);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoadingIframe, setIsLoadingIframe] = useState(false);

  // Container ref for Auto-fit calculation
  const canvasRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Filter presets
  const filteredPresets = DEVICE_PRESETS.filter((p) =>
    deviceFilter === 'all' ? true : p.type === deviceFilter
  );

  // Compute Auto-Fit Scale dynamically
  const calculateAutoFitScale = () => {
    if (!canvasRef.current) return;
    const padding = 80; // margins around frame
    const canvasWidth = canvasRef.current.clientWidth - padding;
    const canvasHeight = canvasRef.current.clientHeight - padding;

    const targetWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
    const targetHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

    const outerTargetWidth = targetWidth + selectedDevice.bezelWidth * 2;
    const outerTargetHeight = targetHeight + selectedDevice.bezelWidth * 2;

    const scaleX = canvasWidth / outerTargetWidth;
    const scaleY = canvasHeight / outerTargetHeight;
    const fitScale = Math.min(scaleX, scaleY, 1.0); // Don't upscale past 100%

    setScale(Math.max(Number(fitScale.toFixed(2)), 0.3));
    setIsAutoFit(true);
  };

  // Re-run auto fit on device change or orientation swap if auto-fit was enabled
  useEffect(() => {
    if (isAutoFit) {
      calculateAutoFitScale();
    }
  }, [selectedDevice, isLandscape, isAutoFit]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit) calculateAutoFitScale();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoFit]);

  // Keyboard Shortcuts: 'R' to rotate, 'F' for auto-fit, '0' for 100%
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'r' || e.key === 'R') {
        setIsLandscape((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        calculateAutoFitScale();
      } else if (e.key === '0') {
        setScale(1.0);
        setIsAutoFit(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDevice, isLandscape]);

  // Navigate to path
  const navigateTo = (path: string) => {
    const full = `/${initialLocale}${path === '/' ? '' : path}`;
    setCurrentPath(path);
    setInputUrl(full);
    setIsLoadingIframe(true);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = inputUrl.trim();
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    setCurrentPath(url.replace(new RegExp(`^/${initialLocale}`), '') || '/');
    setInputUrl(url);
    setIsLoadingIframe(true);
  };

  const reloadIframe = () => {
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`w-full h-screen flex flex-col bg-zinc-900 text-zinc-100 overflow-hidden select-none font-sans ${className}`}>
      {/* =========================================================================
          Top Studio Control Bar
          ========================================================================= */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between gap-4 shrink-0 z-40">
        {/* Brand & Device Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              Device Preview
              <span className="text-[10px] bg-red-950/80 text-red-400 font-mono font-medium px-1.5 py-0.5 rounded border border-red-800/60">
                PRO
              </span>
            </span>
          </div>

          {/* Device Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
              className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-100 transition shadow-xs"
            >
              {selectedDevice.type === 'mobile' && <Smartphone className="w-4 h-4 text-red-400" />}
              {selectedDevice.type === 'tablet' && <Tablet className="w-4 h-4 text-blue-400" />}
              {selectedDevice.type === 'desktop' && <Monitor className="w-4 h-4 text-emerald-400" />}
              <span>{selectedDevice.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {isLandscape
                  ? `${selectedDevice.height}×${selectedDevice.width}`
                  : `${selectedDevice.width}×${selectedDevice.height}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Device Menu Dropdown */}
            {isDeviceMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDeviceMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 space-y-2">
                  {/* Category Filter Pills */}
                  <div className="flex p-1 bg-zinc-900 rounded-lg text-[11px] font-medium">
                    {(['all', 'mobile', 'tablet', 'desktop'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDeviceFilter(cat)}
                        className={`flex-1 py-1 rounded-md capitalize transition ${
                          deviceFilter === cat
                            ? 'bg-zinc-800 text-white font-bold shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Device List */}
                  <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredPresets.map((preset) => {
                      const isSelected = preset.id === selectedDevice.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedDevice(preset);
                            if (preset.defaultChassisColor) {
                              setChassisKey(preset.defaultChassisColor);
                            }
                            setIsDeviceMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition ${
                            isSelected
                              ? 'bg-red-950/60 border border-red-800/80 text-white'
                              : 'hover:bg-zinc-900 text-zinc-300'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                              {preset.name}
                              {preset.brand === 'Apple' && (
                                <span className="text-[9px] text-zinc-400 font-normal">iOS</span>
                              )}
                              {preset.brand === 'Samsung' && (
                                <span className="text-[9px] text-blue-400 font-normal">OneUI</span>
                              )}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {preset.width} × {preset.height} px · {preset.dpr}x DPR
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-red-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Interactive Route URL Navigator */}
        <div className="flex-1 max-w-lg">
          <form
            onSubmit={handleUrlSubmit}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2.5 py-1 transition"
          >
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. /en/need-blood"
              className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              title="Navigate route"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={reloadIframe}
              title="Reload preview"
              className={`p-1 text-zinc-400 hover:text-white rounded ${
                isLoadingIframe ? 'animate-spin text-red-400' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <a
              href={inputUrl}
              target="_blank"
              rel="noreferrer"
              title="Open full page in new tab"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </form>
        </div>

        {/* Right Tools: Rotation, Zoom, Chassis & Auto-Fit */}
        <div className="flex items-center gap-2">
          {/* Orientation Toggle */}
          <button
            onClick={() => {
              setIsLandscape(!isLandscape);
            }}
            title="Rotate Device (R)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isLandscape
                ? 'bg-red-950/80 border-red-700 text-red-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isLandscape ? 'rotate-90' : ''}`} />
            <span className="hidden sm:inline">
              {isLandscape ? 'Landscape' : 'Portrait'}
            </span>
          </button>

          {/* Zoom Multipliers */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => {
                setScale((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.3));
                setIsAutoFit(false);
              }}
              title="Zoom Out"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] text-zinc-200">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => {
                setScale((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.5));
                setIsAutoFit(false);
              }}
              title="Zoom In"
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={calculateAutoFitScale}
              title="Fit to Screen (F)"
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                isAutoFit
                  ? 'bg-red-950 text-red-400 border border-red-800/80'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fit
            </button>
          </div>

          {/* Frame & Hardware Settings Menu */}
          <div className="relative group">
            <button
              title="Hardware Settings"
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Popover on hover/focus */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-3 space-y-3 hidden group-hover:block z-50">
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider block border-b border-zinc-800 pb-1.5">
                Hardware Enclosure
              </span>

              {/* Show Frame Toggle */}
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Hardware Bezel</span>
                <input
                  type="checkbox"
                  checked={showFrame}
                  onChange={(e) => setShowFrame(e.target.checked)}
                  className="rounded accent-red-600 cursor-pointer"
                />
              </label>

              {/* Show Status Bar */}
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span>Mock Status Bar</span>
                <input
                  type="checkbox"
                  checked={showStatusBar}
                  onChange={(e) => setShowStatusBar(e.target.checked)}
                  className="rounded accent-red-600 cursor-pointer"
                />
              </label>

              {/* Chassis Finish Colors */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 font-medium block">
                  Chassis Finish:
                </span>
                <div className="flex gap-2">
                  {Object.values(CHASSIS_COLORS).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setChassisKey(c.id)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        chassisKey === c.id
                          ? 'border-red-500 scale-110 shadow-md'
                          : 'border-zinc-700 opacity-60 hover:opacity-100'
                      } ${c.buttonColor}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Quick Route Shortcuts Bar
          ========================================================================= */}
      <div className="h-9 bg-zinc-950/70 border-b border-zinc-800/80 px-4 flex items-center gap-2 overflow-x-auto shrink-0 z-30">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pr-1">
          Pages:
        </span>
        {PREVIEW_ROUTES.map((route) => {
          const isActive = currentPath === route.path;
          return (
            <button
              key={route.path}
              onClick={() => navigateTo(route.path)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition shrink-0 ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {route.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          Main Workbench Stage (Interactive Infinite Canvas)
          ========================================================================= */}
      <main
        ref={canvasRef}
        className="flex-1 w-full relative overflow-auto flex items-center justify-center p-8 bg-zinc-950"
        style={{
          backgroundImage: `radial-gradient(circle, #27272a 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <div className="flex items-center justify-center my-auto transition-all duration-300">
          <DeviceFrame
            device={selectedDevice}
            isLandscape={isLandscape}
            scale={scale}
            showFrame={showFrame}
            showStatusBar={showStatusBar}
            chassisColor={CHASSIS_COLORS[chassisKey] || CHASSIS_COLORS['titanium-natural']}
            src={inputUrl}
            key={iframeKey}
            iframeRef={iframeRef}
            onIframeLoad={() => setIsLoadingIframe(false)}
          />
        </div>
      </main>

      {/* =========================================================================
          Footer Specs Status Bar
          ========================================================================= */}
      <footer className="h-8 bg-zinc-950 border-t border-zinc-800/80 px-4 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {selectedDevice.name} ({selectedDevice.os.toUpperCase()})
          </span>
          <span className="hidden sm:inline font-mono">
            Viewport:{' '}
            <strong className="text-zinc-200">
              {isLandscape ? selectedDevice.height : selectedDevice.width} ×{' '}
              {isLandscape ? selectedDevice.width : selectedDevice.height} px
            </strong>
          </span>
          <span className="hidden md:inline font-mono">
            DPR: <strong className="text-zinc-200">{selectedDevice.dpr}x</strong>
          </span>
          <span className="hidden lg:inline text-zinc-400">
            {selectedDevice.description}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
            Shortcuts: <kbd className="text-red-400 font-bold">R</kbd> (Rotate), <kbd className="text-red-400 font-bold">F</kbd> (Fit), <kbd className="text-red-400 font-bold">0</kbd> (100%)
          </span>
        </div>
      </footer>
    </div>
  );
}
