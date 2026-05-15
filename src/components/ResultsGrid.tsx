'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plane } from 'lucide-react';
import FlightCard from './FlightCard';
import SkeletonCard from './SkeletonCard';
import type { RouteSearchState, FlightResult, CompareSelection } from '@/lib/types';

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

              {/* 航班結果 */}
              {routeState.status === 'success' &&
                routeState.flights.map((flight) => {
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
