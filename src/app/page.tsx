'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsGrid from '@/components/ResultsGrid';
import CompareBar from '@/components/CompareBar';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import SearchHistory from '@/components/SearchHistory';
import { FavoritesSheet } from '@/components/FavoritesSheet';
import { Plane } from 'lucide-react';
import type {
  CabinClass,
  TripType,
  RouteInput,
  RouteSearchState,
  CompareSelection,
  FlightResult,
  SearchRequest,
} from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [routeStates, setRouteStates] = useState<RouteSearchState[]>([]);
  const [compareSelections, setCompareSelections] = useState<CompareSelection[]>([]);
  
  // 歷史紀錄狀態提升
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/flights/history');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.history) {
            setHistory(data.history);
          }
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // 從歷史紀錄中萃取最近搜過的獨特目的地 (最多 3 個)
  const recentDestinations = useMemo(() => {
    const dests: { code: string; cityZh: string }[] = [];
    for (const session of history) {
      if (session.search_routes) {
        for (const r of session.search_routes) {
          if (!dests.find(d => d.code === r.destination)) {
            dests.push({ code: r.destination, cityZh: r.destination_city_zh || r.destination });
            if (dests.length >= 3) return dests;
          }
        }
      }
    }
    return dests;
  }, [history]);

  // 搜尋處理
  const handleSearch = useCallback(
    async (params: SearchRequest) => {
      setIsLoading(true);
      setCompareSelections([]);

      // 先設置所有航線為 loading 狀態
      const initialStates: RouteSearchState[] = params.routes.map((route, index) => ({
        routeId: `temp-${index}`,
        origin: route.origin,
        destination: route.destination,
        cityZh: route.cityZh,
        status: 'loading' as const,
        flights: [],
      }));
      setRouteStates(initialStates);

      try {
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        const data = await response.json();

        if (data.success && data.results) {
          const newStates: RouteSearchState[] = data.results.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result: any) => ({
              routeId: result.route.id,
              origin: result.route.origin,
              destination: result.route.destination,
              cityZh: result.route.destination_city_zh,
              status: result.error ? ('error' as const) : ('success' as const),
              flights: result.flights || [],
              error: result.error,
            })
          );
          setRouteStates(newStates);
        } else {
          // API 回傳失敗
          setRouteStates(
            initialStates.map((s) => ({
              ...s,
              status: 'error' as const,
              error: data.error || '搜尋失敗',
            }))
          );
        }
      } catch (error) {
        setRouteStates(
          initialStates.map((s) => ({
            ...s,
            status: 'error' as const,
            error: error instanceof Error ? error.message : '網路錯誤',
          }))
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 比較切換
  const handleCompareToggle = useCallback(
    (routeIndex: number, flight: FlightResult) => {
      setCompareSelections((prev) => {
        const existing = prev.findIndex(
          (s) => s.flight.duffel_offer_id === flight.duffel_offer_id
        );
        if (existing >= 0) {
          return prev.filter((_, i) => i !== existing);
        }
        if (prev.length >= 2) return prev;
        return [...prev, { routeIndex, flight }];
      });
    },
    []
  );

  const handleCompareRemove = useCallback((index: number) => {
    setCompareSelections((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCompareClear = useCallback(() => {
    setCompareSelections([]);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              FlyCompare
            </h1>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              機票多點統整比價
            </span>
          </div>
          <div className="flex items-center gap-3">
            <FavoritesSheet />
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 主內容 */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Hero 區塊（僅搜尋前顯示） */}
        {routeStates.length === 0 && (
          <div className="text-center mb-8 md:mb-12 mt-4 md:mt-8">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground">
              同時比較多個目的地
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              不需開啟多個分頁，在單一畫面搜尋並比較不同目的地的航班與票價
            </p>
          </div>
        )}

        {/* 搜尋表單 */}
        <section className="mb-6 md:mb-8">
          <SearchForm 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            recentDestinations={recentDestinations}
          />
        </section>

        {/* 歷史搜尋紀錄 (僅在無搜尋結果且剛載入時顯示) */}
        {routeStates.length === 0 && (
          <SearchHistory 
            onSelectHistory={handleSearch} 
            history={history} 
            loading={isHistoryLoading} 
          />
        )}

        {/* 搜尋結果 */}
        {routeStates.length > 0 && (
          <section className={compareSelections.length > 0 ? 'pb-48' : ''}>
            <ResultsGrid
              routeStates={routeStates}
              compareSelections={compareSelections}
              onCompareToggle={handleCompareToggle}
            />
          </section>
        )}
      </div>

      {/* 比較列 */}
      <CompareBar
        selections={compareSelections}
        onRemove={handleCompareRemove}
        onClear={handleCompareClear}
      />
    </main>
  );
}
