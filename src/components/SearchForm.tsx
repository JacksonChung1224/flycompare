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

// ============================================================
// AirportInput 子元件：機場搜尋輸入框 + 自動補全
// ============================================================
function AirportInput({
  value,
  label,
  placeholder,
  onSelect,
}: {
  value: string;
  label: string;
  placeholder: string;
  onSelect: (airport: Airport) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 搜尋機場
  const searchAirports = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/airports/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.airports || []);
    } catch {
      setResults([]);
    }
  }, []);

  // 輸入變更時搜尋
  useEffect(() => {
    if (query.length >= 1 && !selectedAirport) {
      const timer = setTimeout(() => searchAirports(query), 200);
      return () => clearTimeout(timer);
    }
    if (!query) {
      searchAirports('');
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

  return (
    <div className="relative flex-1 min-w-0">
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors"
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedAirport(null);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (!query) searchAirports('');
          }}
        />
        {selectedAirport && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
          >
            {selectedAirport.code}
          </Badge>
        )}
      </div>

      {/* 搜尋結果下拉 */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-popover shadow-xl"
        >
          {results.map((airport) => (
            <button
              key={airport.code}
              className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors flex items-center gap-3"
              onClick={() => {
                setQuery(`${airport.cityZh} ${airport.code}`);
                setSelectedAirport(airport);
                setIsOpen(false);
                onSelect(airport);
              }}
            >
              <span className="font-mono text-sm font-semibold text-primary min-w-[3ch]">
                {airport.code}
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm truncate">{airport.cityZh} — {airport.nameZh}</span>
                <span className="text-xs text-muted-foreground truncate">{airport.countryZh}</span>
              </span>
            </button>
          ))}
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
}

interface RouteInputState {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  cityZh: string;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
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
  const updateOrigin = (id: string, airport: Airport) => {
    setRoutes(
      routes.map((r) =>
        r.id === id
          ? { ...r, origin: `${airport.cityZh} ${airport.code}`, originCode: airport.code }
          : r
      )
    );
  };

  // 更新航線的目的地
  const updateDestination = (id: string, airport: Airport) => {
    setRoutes(
      routes.map((r) =>
        r.id === id
          ? {
              ...r,
              destination: `${airport.cityZh} ${airport.code}`,
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
    <div className="w-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-2xl">
      {/* 頂部控制列 */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
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

        {/* 出發日期 */}
        <Popover open={departureDateOpen} onOpenChange={setDepartureDateOpen}>
          <PopoverTrigger
            className="inline-flex items-center h-9 text-xs px-3 min-w-[130px] justify-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
            {departureDate
              ? format(departureDate, 'MM/dd (EEE)', { locale: zhTW })
              : '出發日期'}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={departureDate}
              onSelect={(d) => {
                setDepartureDate(d ?? undefined);
                setDepartureDateOpen(false);
              }}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>

        {/* 回程日期（僅來回時顯示） */}
        {tripType === 'roundtrip' && (
          <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
            <PopoverTrigger
              className="inline-flex items-center h-9 text-xs px-3 min-w-[130px] justify-start rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              {returnDate
                ? format(returnDate, 'MM/dd (EEE)', { locale: zhTW })
                : '回程日期'}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(d) => {
                  setReturnDate(d ?? undefined);
                  setReturnDateOpen(false);
                }}
                disabled={(date) =>
                  date < new Date() || (departureDate ? date < departureDate : false)
                }
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* 目的地列表 */}
      <div className="space-y-3 mb-5">
        {routes.map((route, index) => (
          <div
            key={route.id}
            className="flex items-end gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 transition-all hover:border-border/60"
          >
            <span className="text-xs text-muted-foreground font-mono mb-2 min-w-[20px]">
              {index + 1}.
            </span>

            {/* 出發機場 */}
            <AirportInput
              value={route.origin}
              label="出發地"
              placeholder="輸入城市或機場代碼"
              onSelect={(airport) => updateOrigin(route.id, airport)}
            />

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mb-2" />

            {/* 目的地機場 */}
            <AirportInput
              value={route.destination}
              label="目的地"
              placeholder="輸入城市或機場代碼"
              onSelect={(airport) => updateDestination(route.id, airport)}
            />

            {/* 刪除按鈕（第一組不可刪除） */}
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 mb-1 text-muted-foreground hover:text-destructive"
                onClick={() => removeRoute(route.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* 底部操作列 */}
      <div className="flex items-center justify-between gap-3">
        {/* 新增目的地按鈕 */}
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={addRoute}
          disabled={routes.length >= 6}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          新增目的地
          <span className="ml-1 text-muted-foreground">({routes.length}/6)</span>
        </Button>

        {/* 搜尋按鈕 */}
        <Button
          size="lg"
          className="px-8 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
          disabled={!canSubmit || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              搜尋中...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              搜尋航班
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
