'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FlightResult } from '@/lib/types';
import { formatTime, formatPrice, getAirlineLogoUrl } from '@/components/FlightCard';
import { FlightDetailsModal } from '@/components/FlightDetailsModal';

interface FavoriteRecord {
  id: string;
  flight_id: string;
  flight_data: FlightResult;
  created_at: string;
}

export function FavoritesSheet() {
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (e) {
      console.error('Failed to fetch favorites', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFavorites();
    }
  }, [open]);

  const removeFavorite = async (flight_id: string) => {
    try {
      const res = await fetch(`/api/favorites?flight_id=${encodeURIComponent(flight_id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(prev => prev.filter(f => f.flight_id !== flight_id));
      }
    } catch (e) {
      console.error('Failed to remove favorite', e);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="relative group overflow-hidden px-4 py-2 h-auto gap-2" />}>
        <Star className="w-5 h-5 text-amber-500 fill-amber-500/20 group-hover:fill-amber-500 transition-colors" />
        <span className="font-medium text-base">我的收藏</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> 
            我的收藏
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">載入中...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground flex flex-col items-center gap-3">
            <Star className="w-8 h-8 opacity-20" />
            <p>目前沒有收藏的航班</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => {
              const f = fav.flight_data;
              return (
                <div 
                  key={fav.flight_id} 
                  className="p-4 border rounded-xl bg-card relative group cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedFlight(f);
                    setModalOpen(true);
                  }}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.flight_id);
                    }}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={getAirlineLogoUrl(f.airline_code)}
                      alt={f.airline_code}
                      className="w-6 h-6 rounded object-contain bg-white/10"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <span className="font-medium text-sm block">{f.airline_name_zh}</span>
                      <span className="text-[10px] text-muted-foreground">{f.flight_number}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-lg">
                      {formatTime(f.departure_time)} <span className="text-muted-foreground text-xs font-sans">→</span> {formatTime(f.arrival_time)}
                    </div>
                    <div className="font-bold text-primary">
                      {formatPrice(f.price_twd)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>

      {/* 航班詳情彈窗 */}
      {selectedFlight && (
        <FlightDetailsModal 
          flight={selectedFlight} 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      )}
    </Sheet>
  );
}
