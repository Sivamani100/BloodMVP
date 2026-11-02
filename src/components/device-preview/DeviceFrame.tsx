'use client';

import React, { useState, useEffect } from 'react';
import { DevicePreset, ChassisColor, CHASSIS_COLORS } from './types';
import { Wifi, BatteryMedium, Signal, Sparkles } from 'lucide-react';

export interface DeviceFrameProps {
  device: DevicePreset;
  isLandscape?: boolean;
  scale?: number;
  showFrame?: boolean;
  showStatusBar?: boolean;
  chassisColor?: ChassisColor;
  src?: string;
  children?: React.ReactNode;
  onIframeLoad?: () => void;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
}

export function DeviceFrame({
  device,
  isLandscape = false,
  scale = 1.0,
  showFrame = true,
  showStatusBar = true,
  chassisColor = CHASSIS_COLORS['titanium-natural'],
  src,
  children,
  onIframeLoad,
  iframeRef,
  className = '',
}: DeviceFrameProps) {
  // Live simulated system time
  const [timeStr, setTimeStr] = useState('9:41');
  const [islandExpanded, setIslandExpanded] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute active dimensions (swapping width and height on landscape rotation)
  const screenWidth = isLandscape ? device.height : device.width;
  const screenHeight = isLandscape ? device.width : device.height;

  const bezel = showFrame ? device.bezelWidth : 0;
  const cornerRadius = showFrame ? (isLandscape ? Math.max(device.cornerRadius - 8, 20) : device.cornerRadius) : 0;

  // Total hardware enclosure dimensions
  const outerWidth = screenWidth + bezel * 2;
  const outerHeight = screenHeight + bezel * 2;

  // Scaled dimensions to prevent overflow and align correctly inside the canvas
  const scaledContainerWidth = outerWidth * scale;
  const scaledContainerHeight = outerHeight * scale;

  return (
    <div
      className={`relative inline-block transition-all duration-300 ease-out select-none ${className}`}
      style={{
        width: `${scaledContainerWidth}px`,
        height: `${scaledContainerHeight}px`,
      }}
    >
      {/* Scaled Hardware Chassis */}
      <div
        className="relative origin-top-left transition-transform duration-300 ease-out"
        style={{
          width: `${outerWidth}px`,
          height: `${outerHeight}px`,
          transform: `scale(${scale})`,
        }}
      >
        {/* =========================================================================
            Physical Hardware Extrusions (Side Buttons)
            ========================================================================= */}
        {showFrame && device.hasHardwareButtons && (
          <>
            {/* Left Side Buttons: Action Button & Volume Keys */}
            {!isLandscape ? (
              <div className="absolute -left-[3px] top-[100px] flex flex-col gap-3 z-0 pointer-events-none">
                {/* Action Button */}
                <div
                  className={`w-[4px] h-[26px] rounded-l-xs ${chassisColor.buttonColor} shadow-xs`}
                />
                {/* Volume Up */}
                <div
                  className={`w-[4px] h-[52px] rounded-l-xs ${chassisColor.buttonColor} shadow-xs`}
                />
                {/* Volume Down */}
                <div
                  className={`w-[4px] h-[52px] rounded-l-xs ${chassisColor.buttonColor} shadow-xs`}
                />
              </div>
            ) : (
              <div className="absolute -top-[3px] left-[120px] flex flex-row gap-3 z-0 pointer-events-none">
                <div
                  className={`h-[4px] w-[26px] rounded-t-xs ${chassisColor.buttonColor} shadow-xs`}
                />
                <div
                  className={`h-[4px] w-[52px] rounded-t-xs ${chassisColor.buttonColor} shadow-xs`}
                />
                <div
                  className={`h-[4px] w-[52px] rounded-t-xs ${chassisColor.buttonColor} shadow-xs`}
                />
              </div>
            )}

            {/* Right Side Button: Power / Siri Key */}
            {!isLandscape ? (
              <div className="absolute -right-[3px] top-[140px] z-0 pointer-events-none">
                <div
                  className={`w-[4px] h-[78px] rounded-r-xs ${chassisColor.buttonColor} shadow-xs`}
                />
              </div>
            ) : (
              <div className="absolute -bottom-[3px] right-[160px] z-0 pointer-events-none">
                <div
                  className={`h-[4px] w-[78px] rounded-b-xs ${chassisColor.buttonColor} shadow-xs`}
                />
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            Outer Metallic Rim + Inner Black Bezel
            ========================================================================= */}
        <div
          className={`relative w-full h-full p-[2px] transition-all duration-300 ${
            showFrame
              ? `${chassisColor.outerRing} ring-1 ring-black/20 shadow-2xl shadow-black/40`
              : 'shadow-xl'
          }`}
          style={{
            borderRadius: `${cornerRadius + 2}px`,
          }}
        >
          {/* Inner Display Border Shell */}
          <div
            className={`w-full h-full relative overflow-hidden transition-all duration-300 ${
              showFrame ? `${chassisColor.innerBezel}` : 'bg-transparent'
            }`}
            style={{
              padding: `${bezel}px`,
              borderRadius: `${cornerRadius}px`,
            }}
          >
            {/* Screen Glass & Viewport Wrapper */}
            <div
              className="relative w-full h-full bg-white dark:bg-zinc-950 overflow-hidden shadow-inner"
              style={{
                borderRadius: `${Math.max(cornerRadius - bezel, 4)}px`,
              }}
            >
              {/* ===================================================================
                  Hardware Status Bar & Sensor Cutouts (Notch / Dynamic Island)
                  =================================================================== */}
              {showFrame && showStatusBar && (
                <header
                  className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 pointer-events-auto transition-all ${
                    isLandscape ? 'h-7 pt-0.5' : 'h-11 pt-1.5'
                  }`}
                >
                  {/* Left: Clock */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 select-none">
                      {timeStr}
                    </span>
                  </div>

                  {/* Center: Dynamic Island or Notch Cutout */}
                  {device.notchType === 'dynamic_island' && !isLandscape && (
                    <div
                      onClick={() => setIslandExpanded(!islandExpanded)}
                      className={`absolute left-1/2 -translate-x-1/2 top-2.5 bg-black text-white rounded-full flex items-center justify-between px-2.5 cursor-pointer shadow-lg transition-all duration-300 ease-spring ${
                        islandExpanded
                          ? 'w-64 h-10 px-3.5 ring-2 ring-red-500/40'
                          : 'w-28 h-7.5 hover:w-32'
                      }`}
                    >
                      {/* Compact Mode */}
                      {!islandExpanded ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                            <span className="text-[10px] font-medium text-gray-200 truncate">
                              RaktKhoj
                            </span>
                          </div>
                          <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700/60" />
                        </>
                      ) : (
                        /* Expanded Interactive Pill */
                        <div className="flex items-center justify-between w-full text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="flex flex-col">
                              <span className="font-bold text-[11px] leading-tight text-white">
                                Live Request
                              </span>
                              <span className="text-[9px] text-gray-400">
                                4 Donors Alerted
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-red-500/20 text-red-300 font-mono px-1.5 py-0.5 rounded-md">
                            O+
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Classic Ear Notch */}
                  {device.notchType === 'notch' && !isLandscape && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-36 h-6 bg-black rounded-b-2xl flex items-center justify-center">
                      <div className="w-12 h-1 bg-zinc-700 rounded-full" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 ml-2" />
                    </div>
                  )}

                  {/* Android Center Punch-Hole Camera */}
                  {device.notchType === 'punch_hole' && !isLandscape && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full border border-zinc-800/80 shadow-xs flex items-center justify-center">
                      <div className="w-1 h-1 bg-blue-900/40 rounded-full" />
                    </div>
                  )}

                  {/* Right: Signal, 5G, Wi-Fi & Battery */}
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Signal className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold tracking-tighter">5G</span>
                    <Wifi className="w-3.5 h-3.5" />
                    <div className="flex items-center gap-0.5">
                      <div className="w-5 h-2.5 border border-current rounded-xs p-0.5 flex items-center">
                        <div className="w-3 h-full bg-current rounded-xs" />
                      </div>
                      <div className="w-0.5 h-1 bg-current rounded-r-xs" />
                    </div>
                  </div>
                </header>
              )}

              {/* ===================================================================
                  Interactive Viewport Canvas (Iframe or React Children)
                  =================================================================== */}
              <div
                className={`w-full h-full relative overflow-y-auto overflow-x-hidden ${
                  showFrame && showStatusBar && !isLandscape ? 'pt-10' : ''
                } ${showFrame && device.hasHomeIndicator && !isLandscape ? 'pb-6' : ''}`}
              >
                {src ? (
                  <iframe
                    ref={iframeRef as any}
                    src={src}
                    onLoad={onIframeLoad}
                    title={`${device.name} Preview Canvas`}
                    className="w-full h-full border-none block"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                  />
                ) : (
                  children
                )}
              </div>

              {/* ===================================================================
                  Bottom Hardware Gesture Indicator (iOS Home Bar)
                  =================================================================== */}
              {showFrame && device.hasHomeIndicator && (
                <div
                  className={`absolute inset-x-0 bottom-0 pointer-events-none flex justify-center ${
                    isLandscape ? 'pb-1' : 'pb-2'
                  }`}
                >
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isLandscape ? 'w-44 bg-black/40 dark:bg-white/40' : 'w-32 bg-black/40 dark:bg-white/40'
                    }`}
                  />
                </div>
              )}

              {/* Subtle Screen Glass Corner Reflection */}
              {showFrame && (
                <div
                  className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/0 to-white/5"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
