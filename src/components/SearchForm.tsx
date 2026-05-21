'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Plane,
  Plus,
  X,
  CalendarIcon,
  Search,
  Loader2,
  Users,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { Airport, CabinClass, TripType, RouteInput } from '@/lib/types';

import { AIRPORTS } from '@/lib/airports-data';
import { POPULAR_DESTINATIONS, HOT_PICKS } from '@/lib/popular-destinations';
import { isRecommendedRoute } from '@/lib/route-mapping';

// 台灣主要出發地 (For Origin dropdown)
const TAIWAN_ORIGINS = [
  { code: 'TPE', cityZh: '桃園', nameZh: '桃園國際機場', emoji: '✈️' },
  { code: 'KHH', cityZh: '高雄', nameZh: '小港機場', emoji: '⚓' },
  { code: 'TSA', cityZh: '台北', nameZh: '松山機場', emoji: '🏙️' },
  { code: 'RMQ', cityZh: '台中', nameZh: '清泉崗機場', emoji: '☀️' },
];

// ============================================================
// AirportInput 子元件：機場搜尋輸入框 + 自動補全 + 熱門目的地
// ============================================================
function AirportInput({
  value,
  label,
  placeholder,
  onSelect,
  onClear,
  isDestination = false,
  recentDestinations = [],
  pairedAirportCode,
  id,
}: {
  value: string;
  label: string;
  placeholder: string;
  onSelect: (airport: { code: string; cityZh: string; nameZh?: string }) => void;
  onClear?: () => void;
  isDestination?: boolean;
  recentDestinations?: { code: string; cityZh: string }[];
  pairedAirportCode?: string;
  id?: string;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<{ code: string } | null>(value ? { code: value.split(' ').pop() || '' } : null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state if value changes from outside (e.g. from history click)
  useEffect(() => {
    setQuery(value);
    if (value) {
      setSelectedAirport({ code: value.split(' ').pop() || '' });
    } else {
      setSelectedAirport(null);
    }
  }, [value]);

  // 前端即時搜尋邏輯
  const searchAirports = useCallback((q: string) => {
    if (!q) {
      setResults([]);
      return;
    }
    const qLower = q.toLowerCase();
    const filtered = AIRPORTS.filter((a) =>
      a.keywords?.some((k) => k.toLowerCase().includes(qLower)) ||
      a.code.toLowerCase().includes(qLower) ||
      a.cityZh.includes(q) ||
      a.nameZh.includes(q)
    ).slice(0, 15);
    setResults(filtered);
  }, []);

  // 輸入變更時搜尋
  useEffect(() => {
    if (query.length >= 1 && !selectedAirport) {
      searchAirports(query);
    } else if (!query) {
      setResults([]);
    }
  }, [query, searchAirports, selectedAirport]);

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string, cityZh: string, nameZh?: string) => {
    setQuery(`${cityZh} ${code}`);
    setSelectedAirport({ code });
    setIsOpen(false);
    onSelect({ code, cityZh, nameZh });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setSelectedAirport(null);
    setIsOpen(true);
    if (onClear) onClear();
  };

  const showPopular = isDestination && !query;
  const showOriginPicks = !isDestination && !query;

  // 過濾目的地
  const filteredHotPicks = HOT_PICKS.filter(d => 
    isRecommendedRoute(pairedAirportCode, d.code)
  );
  
  const getFilteredDestinations = (country: string, tag?: string) => {
    return POPULAR_DESTINATIONS.filter(d => {
      const matchCountryOrTag = tag ? d.tags?.includes(tag) : d.countryZh === country;
      return matchCountryOrTag && isRecommendedRoute(pairedAirportCode, d.code);
    });
  };

  return (
    <div className="relative flex-1 min-w-0 flex flex-col justify-center px-1">
      <label className="text-xs font-semibold text-muted-foreground/80 mb-0.5 px-3 block">{label}</label>
      <div className="relative group flex items-center">
        <Plane className="absolute left-3 h-5 w-5 text-primary/60" />
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          className="w-full h-10 md:h-12 pl-10 pr-16 rounded-md border-0 bg-transparent text-base md:text-lg font-bold text-foreground focus:ring-0 placeholder:text-muted-foreground/40 placeholder:font-normal transition-colors"
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedAirport(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {selectedAirport && (
          <Badge 
            variant="secondary" 
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-xs flex items-center gap-1 py-0.5 px-2 cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 rounded-full shadow-sm"
            onClick={handleClear}
            title="清除選項"
          >
            <X className="w-3.5 h-3.5" />
            <span className="font-medium">清除</span>
          </Badge>
        )}
      </div>

      {/* 下拉選單 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[400px] overflow-auto rounded-lg border border-border bg-popover shadow-xl"
        >
          {/* 輸入中：顯示搜尋結果 */}
          {query.length > 0 && results.length > 0 && (
            <div className="py-2">
              {results.map((airport) => (
                <button
                  key={airport.code}
                  className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors flex items-center gap-3"
                  onClick={() => handleSelect(airport.code, airport.cityZh, airport.nameZh)}
                >
                  <span className="font-mono text-sm font-semibold text-primary min-w-[3ch]">
                    {airport.code}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-sm truncate">{airport.countryZh}・{airport.cityZh}・{airport.nameZh}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          
          {query.length > 0 && results.length === 0 && (
            <div className="p-4 text-sm text-center text-muted-foreground">找不到符合的機場</div>
          )}

          {/* 未輸入：顯示熱門與最近搜尋 (僅目的地) */}
          {showPopular && (
            <div className="p-3 space-y-4">
              {/* 最近搜過 */}
              {recentDestinations.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    🕒 上次搜過
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentDestinations.map((d) => (
                      <button
                        key={d.code}
                        onClick={() => handleSelect(d.code, d.cityZh)}
                        className="text-xs bg-accent hover:bg-accent/80 px-2.5 py-1.5 rounded-md border border-border/50 transition-colors"
                      >
                        {d.cityZh} <span className="font-mono text-muted-foreground ml-1">{d.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 熱門分類 */}
              {[
                { title: '🔥 台灣人最愛', data: filteredHotPicks },
                { title: '🇯🇵 日本', data: getFilteredDestinations('日本') },
                { title: '🇰🇷 韓國', data: getFilteredDestinations('韓國') },
                { title: '🌏 東南亞', data: getFilteredDestinations('東南亞', '東南亞') },
              ].filter(group => group.data.length > 0).map((group, idx) => (
                <div key={idx}>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">{group.title}</div>
                  <div className="grid grid-cols-1 gap-2">
                    {group.data.map((d) => (
                      <button
                        key={d.code}
                        onClick={() => handleSelect(d.code, d.cityZh)}
                        title={`${d.cityZh} ${d.nameZh}`}
                        className="text-left bg-background hover:bg-accent hover:border-primary/40 border border-border/50 px-3 py-2.5 rounded-lg transition-all flex items-center gap-2.5 group"
                      >
                        <span className="text-lg shrink-0">{d.emoji}</span>
                        <span className="flex-1 min-w-0 flex flex-col">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{d.cityZh}・{d.nameZh}</span>
                        </span>
                        <span className="font-mono text-xs text-muted-foreground font-semibold bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary px-1.5 py-0.5 rounded shrink-0 transition-colors">
                          {d.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 未輸入：顯示出發地快選 (僅出發地) */}
          {showOriginPicks && (
            <div className="p-3 space-y-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">🇹🇼 台灣出發</div>
                <div className="grid grid-cols-1 gap-2">
                  {TAIWAN_ORIGINS.map((d) => {
                    // 如果使用者先選了目的地，我們要檢查這個出發地有沒有飛那裡
                    const isValid = isRecommendedRoute(d.code, pairedAirportCode);
                    if (!isValid) return null; // 隱藏沒有直飛的選項

                    return (
                      <button
                        key={d.code}
                        onClick={() => handleSelect(d.code, d.cityZh)}
                        title={`${d.cityZh} ${d.nameZh}`}
                        className="text-left bg-background hover:bg-accent hover:border-primary/40 border border-border/50 px-3 py-2.5 rounded-lg transition-all flex items-center gap-2.5 group"
                      >
                        <span className="text-lg shrink-0">{d.emoji}</span>
                        <span className="flex-1 min-w-0 flex flex-col">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{d.cityZh}・{d.nameZh}</span>
                        </span>
                        <span className="font-mono text-xs text-muted-foreground font-semibold bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary px-1.5 py-0.5 rounded shrink-0 transition-colors">
                          {d.code}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SearchForm 主元件
// ============================================================
export interface SearchFormProps {
  onSearch: (params: {
    routes: RouteInput[];
    departureDate: string;
    returnDate?: string;
    passengerCount: number;
    cabinClass: CabinClass;
    tripType: TripType;
  }) => void;
  isLoading: boolean;
  recentDestinations?: { code: string; cityZh: string }[];
}

interface RouteInputState {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  cityZh: string;
}

export default function SearchForm({ onSearch, isLoading, recentDestinations = [] }: SearchFormProps) {
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [passengerCount, setPassengerCount] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('economy');
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [departureDateOpen, setDepartureDateOpen] = useState(false);
  const [returnDateOpen, setReturnDateOpen] = useState(false);

  // 動態目的地列表（預設 3 組）
  const [routes, setRoutes] = useState<RouteInputState[]>([
    { id: '1', origin: '', originCode: '', destination: '', destinationCode: '', cityZh: '' },
    { id: '2', origin: '', originCode: '', destination: '', destinationCode: '', cityZh: '' },
    { id: '3', origin: '', originCode: '', destination: '', destinationCode: '', cityZh: '' },
  ]);

  // 新增航線
  const addRoute = () => {
    if (routes.length >= 6) return;
    setRoutes([
      ...routes,
      {
        id: Date.now().toString(),
        origin: '',
        originCode: '',
        destination: '',
        destinationCode: '',
        cityZh: '',
      },
    ]);
  };

  // 刪除航線（保留至少 1 組）
  const removeRoute = (id: string) => {
    if (routes.length <= 1) return;
    setRoutes(routes.filter((r) => r.id !== id));
  };

  // 更新航線的出發機場
  const updateOrigin = (id: string, airport: { code: string; cityZh: string; nameZh?: string }) => {
    setRoutes(
      routes.map((r) =>
        r.id === id
          ? { ...r, origin: airport.code ? `${airport.cityZh} ${airport.code}` : '', originCode: airport.code }
          : r
      )
    );
  };

  // 更新航線的目的地
  const updateDestination = (id: string, airport: { code: string; cityZh: string; nameZh?: string }) => {
    setRoutes(
      routes.map((r) =>
        r.id === id
          ? {
              ...r,
              destination: airport.code ? `${airport.cityZh} ${airport.code}` : '',
              destinationCode: airport.code,
              cityZh: airport.cityZh,
            }
          : r
      )
    );
  };

  // 提交搜尋
  const handleSubmit = () => {
    const validRoutes = routes.filter((r) => r.originCode && r.destinationCode);
    if (validRoutes.length === 0) return;
    if (!departureDate) return;

    onSearch({
      routes: validRoutes.map((r) => ({
        origin: r.originCode,
        destination: r.destinationCode,
        cityZh: r.cityZh,
      })),
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      returnDate: tripType === 'roundtrip' && returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
      passengerCount,
      cabinClass,
      tripType,
    });
  };

  const canSubmit =
    routes.some((r) => r.originCode && r.destinationCode) &&
    departureDate &&
    (tripType === 'oneway' || returnDate);

  return (
    <div className="w-full relative z-10 max-w-6xl mx-auto">
      {/* 頂部控制列 (全域設定) */}
      <div className="flex flex-wrap items-center gap-3 mb-3 px-1">
        {/* 行程類型 */}
        <div className="flex bg-muted/50 rounded-lg p-0.5">
          <button
            type="button"
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              tripType === 'roundtrip'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTripType('roundtrip')}
          >
            來回
          </button>
          <button
            type="button"
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              tripType === 'oneway'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTripType('oneway')}
          >
            單程
          </button>
        </div>

        {/* 人數 */}
        <Select
          value={passengerCount.toString()}
          onValueChange={(v) => v && setPassengerCount(parseInt(v))}
        >
          <SelectTrigger className="w-auto min-w-[100px] h-9 text-xs">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue>{passengerCount} 位旅客</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} 位旅客
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 艙等 */}
        <Select value={cabinClass} onValueChange={(v) => v && setCabinClass(v as CabinClass)}>
          <SelectTrigger className="w-auto min-w-[120px] h-9 text-xs">
            <SelectValue>
              {{ economy: '經濟艙', premium_economy: '豪華經濟艙', business: '商務艙', first: '頭等艙' }[cabinClass]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economy">經濟艙</SelectItem>
            <SelectItem value="premium_economy">豪華經濟艙</SelectItem>
            <SelectItem value="business">商務艙</SelectItem>
            <SelectItem value="first">頭等艙</SelectItem>
          </SelectContent>
        </Select>

        {/* 出發日期被移到下方主表單中 */}
      </div>

      <div className="space-y-3">
        {/* 主要搜尋橫幅與額外航線 */}
        {routes.map((route, index) => (
          <div
            key={route.id}
            className={`flex flex-col lg:flex-row bg-background rounded-2xl lg:rounded-full shadow-lg border border-border/50 relative ${index === 0 ? 'p-1 lg:p-1.5' : 'p-1 lg:p-1.5 lg:w-[60%]'}`}
          >
            {/* 航線標記 (手機版顯示) */}
            <div className="lg:hidden px-4 pt-3 pb-1 flex items-center justify-between border-b border-border/30">
              <span className="text-xs font-semibold text-primary">第 {index + 1} 段航線</span>
              {index > 0 && (
                <button onClick={() => removeRoute(route.id)} className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" /> 移除
                </button>
              )}
            </div>

            {/* 出發與目的地群組 */}
            <div className="flex flex-col md:flex-row flex-1 lg:border-r border-border/50">
              {/* 出發機場 */}
              <div className="flex-1 border-b md:border-b-0 md:border-r border-border/50 hover:bg-muted/30 transition-colors rounded-t-xl lg:rounded-l-full lg:rounded-tr-none min-h-[60px] md:min-h-[72px] flex flex-col justify-center">
                <AirportInput
                  id={`origin-${route.id}`}
                  value={route.origin}
                  label="出發地"
                  placeholder="從哪裡出發？"
                  onSelect={(airport) => {
                    updateOrigin(route.id, airport);
                    setTimeout(() => document.getElementById(`dest-${route.id}`)?.focus(), 10);
                  }}
                  onClear={() => updateOrigin(route.id, { code: '', cityZh: '' })}
                  isDestination={false}
                  pairedAirportCode={route.destinationCode}
                />
              </div>

              {/* 轉換箭頭/圖示 (電腦版隱藏，或作為分隔) */}
              <div className="hidden md:flex absolute left-1/2 lg:left-[25%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 bg-background border border-border rounded-full items-center justify-center shadow-sm text-primary">
                <ArrowRight className="h-4 w-4" />
              </div>

              {/* 目的地機場 */}
              <div className="flex-1 hover:bg-muted/30 transition-colors md:rounded-r-xl lg:rounded-none min-h-[60px] md:min-h-[72px] flex flex-col justify-center">
                <AirportInput
                  id={`dest-${route.id}`}
                  value={route.destination}
                  label="目的地"
                  placeholder="想去哪裡？"
                  onSelect={(airport) => {
                    updateDestination(route.id, airport);
                    if (index === 0) setTimeout(() => setDepartureDateOpen(true), 10);
                  }}
                  onClear={() => updateDestination(route.id, { code: '', cityZh: '' })}
                  isDestination={true}
                  recentDestinations={recentDestinations}
                  pairedAirportCode={route.originCode}
                />
              </div>
            </div>

            {/* 第一組航線才顯示的日期選擇與搜尋按鈕 */}
            {index === 0 && (
              <div className="flex flex-col md:flex-row flex-1 lg:flex-[0.8]">
                {/* 日期選擇區 */}
                <div className="flex flex-1 border-t lg:border-t-0 border-b md:border-b-0 border-border/50">
                  {/* 出發日期 */}
                  <div className="flex-1 border-r border-border/50 hover:bg-muted/30 transition-colors min-h-[60px] md:min-h-[72px] flex flex-col justify-center px-4">
                    <label className="text-xs font-semibold text-muted-foreground/80 mb-0.5">出發日期</label>
                    <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
                      <PopoverTrigger className="text-left w-full h-10 md:h-12 bg-transparent text-base md:text-lg font-bold text-foreground focus:outline-none flex items-center gap-2 cursor-pointer truncate">
                        <CalendarIcon className="h-5 w-5 text-primary/60 shrink-0" />
                        <span className="truncate">
                          {departureDate ? format(departureDate, 'MM/dd (EEE)', { locale: zhTW }) : '選擇日期'}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={departureDate}
                          onSelect={(d) => {
                            setDepartureDate(d ?? undefined);
                            setDepartureDateOpen(false);
                            if (tripType === 'roundtrip' && !returnDate) {
                              setTimeout(() => setReturnDateOpen(true), 150);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          locale={zhTW}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 回程日期 */}
                  <div className={`flex-1 hover:bg-muted/30 transition-colors min-h-[60px] md:min-h-[72px] flex flex-col justify-center px-4 ${tripType === 'oneway' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="text-xs font-semibold text-muted-foreground/80 mb-0.5">回程日期</label>
                    <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                      <PopoverTrigger className="text-left w-full h-10 md:h-12 bg-transparent text-base md:text-lg font-bold text-foreground focus:outline-none flex items-center gap-2 cursor-pointer truncate">
                        <CalendarIcon className="h-5 w-5 text-primary/60 shrink-0" />
                        <span className="truncate">
                          {tripType === 'oneway' ? '單程' : returnDate ? format(returnDate, 'MM/dd (EEE)', { locale: zhTW }) : '選擇日期'}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={(d) => {
                            setReturnDate(d ?? undefined);
                            setReturnDateOpen(false);
                          }}
                          disabled={(date) => date < new Date() || (departureDate ? date < departureDate : false)}
                          locale={zhTW}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* 搜尋按鈕 */}
                <div className="p-2 md:p-0 md:pl-2 flex items-center justify-center lg:pr-1">
                  <Button
                    size="lg"
                    className="w-full md:w-auto h-14 md:h-[calc(100%-8px)] lg:h-[64px] px-8 md:px-10 rounded-xl lg:rounded-full text-base lg:text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98]"
                    disabled={!canSubmit || isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 mr-2 animate-spin" />
                        搜尋中...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 lg:h-6 lg:w-6 lg:mr-2" />
                        <span className="lg:inline">搜尋</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* 第二組以後的刪除按鈕 (電腦版) */}
            {index > 0 && (
              <div className="hidden lg:flex items-center justify-center pr-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeRoute(route.id)}
                  title="移除此航線"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部操作列 (新增目的地) */}
      <div className="mt-4 flex items-center justify-start px-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-full px-4"
          onClick={addRoute}
          disabled={routes.length >= 6}
        >
          <Plus className="h-4 w-4 mr-1.5 border-2 border-primary rounded-full p-0.5" />
          新增其他想比較的目的地
          <span className="ml-2 text-primary/60 text-xs">({routes.length}/6)</span>
        </Button>
      </div>
    </div>
  );
}
