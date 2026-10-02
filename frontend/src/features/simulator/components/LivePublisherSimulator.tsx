'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, ExternalLink, Zap, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SlotState {
  creativeId?: string;
  html?: string;
  clickUrl?: string;
  impressionUrl?: string;
  loading: boolean;
  status: 'empty' | 'loaded' | 'no-content' | 'error';
  impressionFired: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'REQUEST' | 'RESPONSE' | 'IMPRESSION' | 'CLICK' | 'FREQ_CAP' | 'INFO';
  message: string;
}

export function LivePublisherSimulator() {
  const [slot300, setSlot300] = useState<SlotState>({
    loading: false,
    status: 'empty',
    impressionFired: false,
  });

  const [slot728, setSlot728] = useState<SlotState>({
    loading: false,
    status: 'empty',
    impressionFired: false,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback(
    (
      type: LogEntry['type'],
      message: string
    ) => {
      const now = new Date().toTimeString().split(' ')[0];
      setLogs((prev) => [
        ...prev.slice(-40),
        {
          id: Math.random().toString(36).substring(7),
          timestamp: now,
          type,
          message,
        },
      ]);
    },
    []
  );

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadSlot = useCallback(
    async (size: '300x250' | '728x90', setSlot: React.Dispatch<React.SetStateAction<SlotState>>) => {
      setSlot((prev) => ({ ...prev, loading: true, impressionFired: false }));
      addLog('REQUEST', `GET /ad?size=${size}`);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/ad?size=${size}`, { cache: 'no-store' });

        if (res.status === 204) {
          addLog('RESPONSE', `[204 No Content] No available active creative matching ${size} (or frequency cap / daily limit active)`);
          setSlot({
            loading: false,
            status: 'no-content',
            impressionFired: false,
          });
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        addLog('RESPONSE', `[200 OK] Received creative: ${data.creative_id} for ${size}`);

        setSlot({
          creativeId: data.creative_id,
          html: data.html,
          clickUrl: `${apiUrl}${data.click_url}`,
          impressionUrl: `${apiUrl}${data.impression_url}`,
          loading: false,
          status: 'loaded',
          impressionFired: false,
        });
      } catch (err: any) {
        addLog('INFO', `Slot ${size} error: ${err.message}`);
        setSlot({
          loading: false,
          status: 'error',
          impressionFired: false,
        });
      }
    },
    [addLog]
  );

  const triggerImpression = (
    size: string,
    impressionUrl: string,
    setSlot: React.Dispatch<React.SetStateAction<SlotState>>
  ) => {
    setSlot((prev) => {
      if (prev.impressionFired) return prev;
      // Fire pixel
      const img = new Image();
      img.src = impressionUrl;
      addLog('IMPRESSION', `Impression pixel fired for slot ${size}: ${impressionUrl}`);
      return { ...prev, impressionFired: true };
    });
  };

  const handleReloadAll = () => {
    loadSlot('300x250', setSlot300);
    loadSlot('728x90', setSlot728);
  };

  useEffect(() => {
    addLog('INFO', 'Simulator initialized. Connected to Mini Ad Server engine.');
    handleReloadAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Live Ad Simulator & Publisher Playground
          </h2>
          <p className="text-sm text-slate-500">
            Simulate real publisher ad slots, test click redirects, and inspect Redis frequency capping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReloadAll}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reload Both Slots
          </Button>
          <a
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-medium rounded-lg px-3 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Standalone Publisher Page
          </a>
        </div>
      </div>

      {/* Top 728x90 Leaderboard Slot */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Slot: 728×90 Leaderboard
            </span>
            <Badge variant={slot728.status === 'loaded' ? 'active' : 'neutral'}>
              {slot728.status.toUpperCase()}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadSlot('728x90', setSlot728)}
            disabled={slot728.loading}
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1 ${slot728.loading ? 'animate-spin' : ''}`} />
            Request 728x90
          </Button>
        </div>

        <div className="mx-auto flex h-[90px] w-full max-w-[728px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50/50">
          {slot728.loading ? (
            <span className="text-xs text-slate-500 animate-pulse">Requesting ad decision...</span>
          ) : slot728.status === 'loaded' ? (
            <a
              href={slot728.clickUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => addLog('CLICK', `User clicked 728x90 ad! Tracking redirect: ${slot728.clickUrl}`)}
              className="block h-full w-full relative group cursor-pointer"
            >
              <div
                dangerouslySetInnerHTML={{ __html: slot728.html || '' }}
                onLoad={() => triggerImpression('728x90', slot728.impressionUrl!, setSlot728)}
              />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white">
                Click to Test 302 Redirect
              </div>
            </a>
          ) : slot728.status === 'no-content' ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              204 No Content: No active creative or frequency cap reached
            </div>
          ) : (
            <span className="text-xs text-slate-400">Slot Empty</span>
          )}
        </div>
      </div>

      {/* Grid: 300x250 Slot + Real-Time Telemetry Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 300x250 Rectangle */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Slot: 300×250 Medium Rectangle
                </span>
                <Badge variant={slot300.status === 'loaded' ? 'active' : 'neutral'}>
                  {slot300.status.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadSlot('300x250', setSlot300)}
                disabled={slot300.loading}
              >
                <RotateCcw className={`h-3.5 w-3.5 mr-1 ${slot300.loading ? 'animate-spin' : ''}`} />
                Request 300x250
              </Button>
            </div>

            <div className="mx-auto flex h-[250px] w-[300px] items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50/50">
              {slot300.loading ? (
                <span className="text-xs text-slate-500 animate-pulse">Requesting ad decision...</span>
              ) : slot300.status === 'loaded' ? (
                <a
                  href={slot300.clickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => addLog('CLICK', `User clicked 300x250 ad! Tracking redirect: ${slot300.clickUrl}`)}
                  className="block h-full w-full relative group cursor-pointer"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: slot300.html || '' }}
                    onLoad={() => triggerImpression('300x250', slot300.impressionUrl!, setSlot300)}
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white">
                    Click to Test 302 Redirect
                  </div>
                </a>
              ) : slot300.status === 'no-content' ? (
                <div className="flex flex-col items-center justify-center p-4 text-center text-xs text-amber-700 bg-amber-50/80 rounded-lg border border-amber-200">
                  <AlertCircle className="h-5 w-5 mb-1.5 text-amber-600" />
                  <span className="font-semibold">204 No Content</span>
                  <span className="text-[11px] text-amber-600/80 mt-0.5">
                    Frequency capped or limit reached
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Slot Empty</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Impression Pixel:</span>
            <span className={slot300.impressionFired ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
              {slot300.impressionFired ? '✓ Fired Once' : 'Pending load'}
            </span>
          </div>
        </div>

        {/* Real-time Telemetry Terminal */}
        <div className="rounded-xl border border-slate-800 bg-[#0b0f17] p-5 flex flex-col justify-between font-mono text-xs shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Terminal className="h-4 w-4 text-slate-400" />
              Live Engine Telemetry
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear Logs
            </button>
          </div>

          <div className="h-[280px] overflow-y-auto space-y-1.5 py-3 pr-2 scrollbar-thin">
            {logs.map((log) => {
              const colors = {
                REQUEST: 'text-sky-400',
                RESPONSE: 'text-indigo-300',
                IMPRESSION: 'text-emerald-400 font-medium',
                CLICK: 'text-amber-400 font-medium',
                FREQ_CAP: 'text-rose-400 font-medium',
                INFO: 'text-slate-400',
              };

              return (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                  <span className={colors[log.type]}>[{log.type}]</span>{' '}
                  <span className="text-slate-300">{log.message}</span>
                </div>
              );
            })}
            <div ref={consoleBottomRef} />
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Bonus Features Active:</span>
            <span className="text-emerald-400 font-medium">✓ Redis Candidate TTL | ✓ IP Frequency Cap | ✓ Daily Limit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
