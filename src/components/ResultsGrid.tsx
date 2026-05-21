'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plane, ChevronDown, ChevronUp } from 'lucide-react';
import FlightCard from './FlightCard';
import SkeletonCard from './SkeletonCard';
import type { RouteSearchState, FlightResult, CompareSelection } from '@/lib/types';
import { useState, useEffect } from 'react';

function PriceInsightBanner({ routeState, lowestPrice }: { routeState: RouteSearchState; lowestPrice: number }) {
  const [insight, setInsight] = useState<any>(null);

  useEffect(() => {
    if (routeState.status !== 'success' || routeState.flights.length === 0) return;
    
    const dateStr = routeState.flights[0].departure_time.split('T')[0];
    
    const fetchInsight = async () => {
      try {
        const originCode = routeState.origin.split(' ').pop() || routeState.origin;
        const destinationCode = routeState.destination.split(' ').pop() || routeState.destination;
        
        const res = await fetch(`/api/flights/price-insights?origin=${originCode}&destination=${destinationCode}&date=${dateStr}&currentPrice=${lowestPrice}`);
        const data = await res.json();
        if (data.success && data.insight) {
          setInsight(data.insight);
        }
      } catch (e) {
        console.error('Failed to fetch price insight:', e);
      }
    };
    
    fetchInsight();
  }, [routeState, lowestPrice]);

  if (!insight) return null;

  return (
    <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 text-emerald-600">💡</div>
        <div>
          <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">大數據省錢提示</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            根據過往搜尋紀錄，若改在 <span className="font-semibold text-foreground">{insight.alternativeDate}</span> 出發，預估可省下 <span className="font-semibold text-emerald-600 dark:text-emerald-400">NT$ {insight.savings.toLocaleString()}</span>！
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          alert(`提示：在正式環境中，這會將您的出發日期自動更改為 ${insight.alternativeDate} 並重新搜尋！`);
        }}
        className="shrink-0 text-xs px-3 py-1.5 bg-background text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors shadow-sm"
      >
        套用更便宜日期
      </button>
    </div>
  );
}

export interface ResultsGridProps {
  routeStates: RouteSearchState[];
  compareSelections: CompareSelection[];
  onCompareToggle: (routeIndex: number, flight: FlightResult) => void;
}

function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString('en-US')}`;
}

export default function ResultsGrid({
  routeStates,
  compareSelections,
  onCompareToggle,
}: ResultsGridProps) {
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set());

  const toggleExpand = (routeIndex: number) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(routeIndex)) next.delete(routeIndex);
      else next.add(routeIndex);
      return next;
    });
  };

  if (routeStates.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {routeStates.map((routeState, routeIndex) => {
        const lowestPrice =
          routeState.flights.length > 0
            ? Math.min(...routeState.flights.map((f) => f.price_twd))
            : 0;

        return (
          <div key={routeState.routeId || routeIndex} className="flex flex-col">
            {/* 欄位 Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <Plane className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold truncate">
                  {routeState.origin} → {routeState.destination}
                </span>
                {routeState.cityZh && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {routeState.cityZh}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {routeState.status === 'success' && routeState.flights.length > 0 && (
                  <>
                    <Badge className="bg-emerald-500/90 text-white text-[10px] px-2">
                      {formatPrice(lowestPrice)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {routeState.flights.length} 個航班
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 內容區 */}
            <div className="space-y-3 flex-1">
              {/* Loading 狀態 */}
              {routeState.status === 'loading' && (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              )}

              {/* 錯誤狀態 */}
              {routeState.status === 'error' && (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mb-3" />
                  <p className="text-sm font-medium text-destructive mb-1">查詢失敗</p>
                  <p className="text-xs text-muted-foreground">
                    {routeState.error || '無法取得航班資料，請稍後再試'}
                  </p>
                </div>
              )}

              {/* 成功但無結果 */}
              {routeState.status === 'success' && routeState.flights.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-border/30 bg-muted/20 text-center">
                  <Plane className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">沒有找到航班</p>
                  <p className="text-xs text-muted-foreground">
                    該航線暫無符合條件的航班
                  </p>
                </div>
              )}

              {/* 大數據省錢提示橫幅 */}
              {routeState.status === 'success' && routeState.flights.length > 0 && (
                <PriceInsightBanner routeState={routeState} lowestPrice={lowestPrice} />
              )}

              {/* 航班結果 */}
              {routeState.status === 'success' && (() => {
                const isExpanded = expandedRoutes.has(routeIndex);
                const visibleFlights = isExpanded ? routeState.flights : routeState.flights.slice(0, 3);
                
                return (
                  <>
                    <div className="space-y-3 relative">
                      {visibleFlights.map((flight) => {
                        const isSelected = compareSelections.some(
                          (s) => s.flight.duffel_offer_id === flight.duffel_offer_id
                        );
                        return (
                          <FlightCard
                            key={flight.duffel_offer_id || flight.id}
                            flight={flight}
                            isLowestPrice={flight.price_twd === lowestPrice}
                            isCompareSelected={isSelected}
                            onCompareToggle={() => onCompareToggle(routeIndex, flight)}
                            compareDisabled={compareSelections.length >= 2}
                          />
                        );
                      })}
                      
                      {/* 如果沒有展開且有更多結果，顯示漸層遮罩 */}
                      {!isExpanded && routeState.flights.length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* 展開/收起 按鈕 */}
                    {routeState.flights.length > 3 && (
                      <button
                        onClick={() => toggleExpand(routeIndex)}
                        className="w-full mt-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center gap-1 border border-primary/20"
                      >
                        {isExpanded ? (
                          <>收起 <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>展開看其餘 {routeState.flights.length - 3} 筆結果 <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
