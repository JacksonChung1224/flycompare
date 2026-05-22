'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Clock,
  Plane,
  Luggage,
  Leaf,
  ChevronDown,
  ChevronUp,
  Circle,
  Star,
} from 'lucide-react';
import type { FlightResult } from '@/lib/types';
import { FlightDetailsModal } from '@/components/FlightDetailsModal';

// ============================================================
// Helper functions
// ============================================================

/**
 * 格式化時間 HH:MM
 * 支援多種格式：
 *  - ISO 不含時區: "2026-05-30T21:00:00"
 *  - ISO 含時區:   "2026-05-30T21:00:00+09:00"
 *  - Supabase timestamptz: "2026-05-30 21:00:00+00"
 *  - 純日期 (已損壞): "2026-05-30" → 回傳 '--:--'
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return '--:--';

  // 方法 1: 嘗試找 'T' 分隔符 (標準 ISO)
  const tIndex = timeStr.indexOf('T');
  if (tIndex !== -1 && timeStr.length >= tIndex + 6) {
    return timeStr.substring(tIndex + 1, tIndex + 6); // "HH:MM"
  }

  // 方法 2: 嘗試找空格分隔符 (Supabase 格式 "2026-05-30 21:00:00+00")
  const spaceIndex = timeStr.indexOf(' ');
  if (spaceIndex !== -1 && timeStr.length >= spaceIndex + 6) {
    const timePart = timeStr.substring(spaceIndex + 1, spaceIndex + 6);
    if (/^\d{2}:\d{2}$/.test(timePart)) return timePart;
  }

  // 方法 3: 如果字串本身就是 "HH:MM" 格式
  if (/^\d{2}:\d{2}/.test(timeStr)) {
    return timeStr.substring(0, 5);
  }

  return '--:--';
}

/**
 * 計算是否跨日（基於日期字串比較，不依賴 Date 物件的時區轉換）
 */
export function getDayDiff(departure: string, arrival: string): number {
  if (!departure || !arrival) return 0;
  // 提取日期部分 "YYYY-MM-DD"
  const depDate = departure.substring(0, 10);
  const arrDate = arrival.substring(0, 10);
  if (depDate === arrDate) return 0;
  // 用 Date 計算天數差（只用日期部分，不涉及時區）
  const dep = new Date(depDate + 'T00:00:00');
  const arr = new Date(arrDate + 'T00:00:00');
  return Math.round((arr.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24));
}

/** 格式化飛行時長 */
export function formatDuration(minutes: number): string {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

/** 格式化票價 */
export function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString('en-US')}`;
}

/** 航空公司 logo URL */
export function getAirlineLogoUrl(code: string): string {
  return `https://pics.avs.io/60/60/${code}.png`;
}

// ============================================================
// FlightCard 元件
// ============================================================
export interface FlightCardProps {
  flight: FlightResult;
  isLowestPrice?: boolean;
  isCompareSelected?: boolean;
  onCompareToggle?: (flight: FlightResult) => void;
  compareDisabled?: boolean;
}

export default function FlightCard({
  flight,
  isLowestPrice = false,
  isCompareSelected = false,
  onCompareToggle,
  compareDisabled = false,
}: FlightCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const dayDiff = getDayDiff(flight.departure_time, flight.arrival_time);

  const flightId = `${flight.flight_number}_${flight.departure_time}`;

  // TODO: Ideally, we should fetch user favorites in a higher level component and pass down `initialIsFavorited`, but for simplicity here we just maintain local state after toggle.

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriteLoading) return;
    
    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Remove favorite
        await fetch(`/api/favorites?flight_id=${encodeURIComponent(flightId)}`, { method: 'DELETE' });
        setIsFavorited(false);
      } else {
        // Add favorite
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flight_id: flightId, flight_data: flight })
        });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg border-border/50 ${
        isCompareSelected ? 'ring-2 ring-indigo-500/50 border-indigo-500/30' : ''
      }`}
    >
      <CardContent className="p-4">
        {/* 最低價標籤與收藏按鈕 */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isLowestPrice && (
            <Badge className="bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 pointer-events-none">
              最低價
            </Badge>
          )}
          <button 
            onClick={toggleFavorite}
            disabled={isFavoriteLoading}
            className="text-muted-foreground hover:text-amber-500 transition-colors bg-background/80 p-1 rounded-full shadow-sm disabled:opacity-50"
          >
            <Star className={`w-4 h-4 ${isFavorited ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* 上半部：航空公司 + 起降時間 + 飛行時長 */}
        <div className="flex items-center gap-3 mb-3">
          {/* 航空公司 logo + 名稱 */}
          <div className="flex items-center gap-2 min-w-[100px]">
            {!logoError ? (
              <img
                src={getAirlineLogoUrl(flight.airline_code)}
                alt={flight.airline_code}
                className="w-8 h-8 rounded object-contain bg-white/10"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-[10px] font-bold">
                {flight.airline_code}
              </div>
            )}
            <div className="flex flex-col min-w-0 gap-0.5">
              <span className="text-sm font-medium truncate leading-none">{flight.airline_name_zh}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-foreground font-mono leading-none">
                  {flight.flight_number}
                </span>
                {flight.source === 'serpapi' ? (
                  <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 text-emerald-500 border-emerald-500/30">Google</Badge>
                ) : (
                  <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 text-blue-500 border-blue-500/30">Duffel</Badge>
                )}
              </div>
            </div>
          </div>

          {/* 起降時間 */}
          <div className="flex items-center gap-1.5 flex-1 justify-center">
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold font-mono">
                {formatTime(flight.departure_time)}
              </span>
              <span className="text-[9px] text-muted-foreground/70">當地</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-[10px] text-muted-foreground">
                {formatDuration(flight.flight_duration_minutes)}
              </span>
              <div className="flex items-center gap-0.5">
                <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
                <div className="w-12 h-px bg-muted-foreground/50" />
                {flight.stops > 0 &&
                  Array.from({ length: flight.stops }).map((_, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                      <Circle className="w-1.5 h-1.5 fill-amber-500 text-amber-500" />
                      <div className="w-4 h-px bg-muted-foreground/50" />
                    </div>
                  ))}
                <Plane className="w-3 h-3 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {flight.stops === 0 ? '直飛' : `${flight.stops} 次停靠`}
              </span>
            </div>
            <div className="relative flex flex-col items-center">
              <span className="text-lg font-semibold font-mono">
                {formatTime(flight.arrival_time)}
              </span>
              <span className="text-[9px] text-muted-foreground/70">當地</span>
              {dayDiff > 0 && (
                <span className="absolute -top-1 -right-4 text-[10px] text-amber-500 font-semibold">
                  +{dayDiff}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 票價行 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {formatPrice(flight.price_twd)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {flight.price_currency_original} {flight.price_original.toLocaleString()}
          </span>
        </div>

        {/* 下半部：行李 + 碳排放 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {/* 托運行李 */}
          <div className="flex items-center gap-1">
            <Luggage className="h-3.5 w-3.5" />
            <span>
              {flight.checked_baggage_pieces != null && flight.checked_baggage_pieces > 0
                ? `${flight.checked_baggage_kg ? `${flight.checked_baggage_kg}KG` : ''} × ${flight.checked_baggage_pieces} 件`
                : '無托運行李'}
            </span>
          </div>

          {/* 手提行李 */}
          <div className="flex items-center gap-1">
            <Luggage className="h-3 w-3" />
            <span>
              {flight.carry_on_pieces != null && flight.carry_on_pieces > 0
                ? `手提 ${flight.carry_on_kg ? `${flight.carry_on_kg}KG` : ''} × ${flight.carry_on_pieces} 件`
                : '無手提行李'}
            </span>
          </div>

          {/* 碳排放 */}
          <div className="flex items-center gap-1">
            <Leaf className="h-3 w-3 text-emerald-500" />
            <span>
              {flight.carbon_emissions_kg
                ? `${Math.round(flight.carbon_emissions_kg)} kg CO₂`
                : '碳排放資料暫無'}
            </span>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          {/* 比較 checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Checkbox
              checked={isCompareSelected}
              onCheckedChange={() => onCompareToggle?.(flight)}
              disabled={compareDisabled && !isCompareSelected}
            />
            比較
          </label>

          {/* 展開詳情 */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => setModalOpen(true)}
          >
            查看詳情 <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>

      </CardContent>
      
      {/* 航班詳情彈窗 */}
      <FlightDetailsModal 
        flight={flight} 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </Card>
  );
}
