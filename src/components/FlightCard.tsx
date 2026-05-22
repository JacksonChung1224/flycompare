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
} from 'lucide-react';
import type { FlightResult } from '@/lib/types';

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
function formatTime(timeStr: string): string {
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
function getDayDiff(departure: string, arrival: string): number {
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
function formatDuration(minutes: number): string {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

/** 格式化票價 */
function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString('en-US')}`;
}

/** 航空公司 logo URL */
function getAirlineLogoUrl(code: string): string {
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
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const dayDiff = getDayDiff(flight.departure_time, flight.arrival_time);

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg border-border/50 ${
        isCompareSelected ? 'ring-2 ring-indigo-500/50 border-indigo-500/30' : ''
      }`}
    >
      <CardContent className="p-4">
        {/* 最低價標籤 */}
        {isLowestPrice && (
          <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5">
            最低價
          </Badge>
        )}

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
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                收合 <ChevronUp className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                查看詳情 <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* 展開的詳細資訊 */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/30 space-y-2 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">航班號碼：</span>
                <span className="font-mono">{flight.flight_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">航空公司：</span>
                <span>{flight.airline_name_zh} ({flight.airline_code})</span>
              </div>
              <div>
                <span className="text-muted-foreground">飛行時間：</span>
                <span>{formatDuration(flight.flight_duration_minutes)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">停靠次數：</span>
                <span>{flight.stops === 0 ? '直飛' : `${flight.stops} 次`}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Offer ID：</span>
                <span className="font-mono text-[10px] truncate block">{flight.duffel_offer_id}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
