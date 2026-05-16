'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight } from 'lucide-react';
import type { CompareSelection, FlightResult } from '@/lib/types';

function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString('en-US')}`;
}

function formatTime(isoString: string): string {
  if (!isoString) return '--:--';
  const tIndex = isoString.indexOf('T');
  if (tIndex === -1) return '--:--';
  return isoString.substring(tIndex + 1, tIndex + 6);
}

function formatDuration(minutes: number): string {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export interface CompareBarProps {
  selections: CompareSelection[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

function CompareItem({ flight, label }: { flight: FlightResult; label: string }) {
  return (
    <div className="flex-1 p-3 rounded-xl bg-card/80 border border-border/50 min-w-0">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium truncate">{flight.airline_name_zh}</span>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {flight.airline_code}
        </Badge>
      </div>
      <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
        {formatPrice(flight.price_twd)}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
        <span>🕐 {formatTime(flight.departure_time)} → {formatTime(flight.arrival_time)}</span>
        <span>⏱ {formatDuration(flight.flight_duration_minutes)}</span>
        <span>
          🧳{' '}
          {flight.checked_baggage_pieces
            ? `${flight.checked_baggage_kg ?? ''}KG × ${flight.checked_baggage_pieces}`
            : '無托運'}
        </span>
        <span>
          🌿{' '}
          {flight.carbon_emissions_kg
            ? `${Math.round(flight.carbon_emissions_kg)} kg CO₂`
            : '暫無'}
        </span>
        <span>{flight.stops === 0 ? '✈️ 直飛' : `🔄 ${flight.stops} 次停靠`}</span>
      </div>
    </div>
  );
}

export default function CompareBar({ selections, onRemove, onClear }: CompareBarProps) {
  if (selections.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium">航班比較</span>
            <Badge variant="secondary" className="text-[10px]">
              {selections.length}/2
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={onClear}
          >
            <X className="h-3 w-3 mr-1" />
            清除
          </Button>
        </div>

        <div className="flex gap-4">
          {selections.map((sel, i) => (
            <div key={i} className="relative flex-1">
              <CompareItem
                flight={sel.flight}
                label={`航班 ${i + 1}`}
              />
              <button
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] hover:bg-destructive/80 transition-colors"
                onClick={() => onRemove(i)}
              >
                ×
              </button>
            </div>
          ))}

          {/* 價格差異 */}
          {selections.length === 2 && (
            <div className="flex flex-col items-center justify-center px-4 min-w-[100px]">
              <span className="text-[10px] text-muted-foreground mb-1">價差</span>
              <span className="text-lg font-bold text-amber-400">
                {formatPrice(Math.abs(selections[0].flight.price_twd - selections[1].flight.price_twd))}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                時間差 {Math.abs(selections[0].flight.flight_duration_minutes - selections[1].flight.flight_duration_minutes)} 分鐘
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
