'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatTime, formatDuration, getAirlineLogoUrl } from '@/components/FlightCard';
import { Plane, Circle, Luggage, Leaf } from 'lucide-react';
import type { FlightResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface FlightDetailsModalProps {
  flight: FlightResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlightDetailsModal({ flight, open, onOpenChange }: FlightDetailsModalProps) {
  if (!flight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[60%] w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <img
              src={getAirlineLogoUrl(flight.airline_code)}
              alt={flight.airline_code}
              className="w-8 h-8 rounded object-contain bg-white/10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {flight.airline_name_zh} 航班詳情
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 去程航班區塊 */}
          <div className="bg-muted/30 rounded-xl p-6 border border-border/50 mb-4">
            <h3 className="font-semibold text-sm text-primary mb-4 flex items-center gap-2">
              <Plane className="w-4 h-4" /> 去程航班 (Outbound)
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-mono font-bold tracking-tight text-primary">
                  {formatTime(flight.departure_time)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">出發 (當地時間)</span>
              </div>

              <div className="flex flex-col items-center flex-1 px-4">
                <span className="text-sm font-medium mb-2">{formatDuration(flight.flight_duration_minutes)}</span>
                <div className="flex items-center w-full max-w-[200px] gap-1">
                  <div className="w-2 h-2 rounded-full border-2 border-primary" />
                  <div className="flex-1 h-px bg-border relative">
                    {flight.stops > 0 && (
                      <div className="absolute inset-0 flex items-center justify-evenly">
                        {Array.from({ length: flight.stops }).map((_, i) => (
                          <Circle key={i} className="w-2 h-2 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    )}
                  </div>
                  <Plane className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground mt-2">
                  {flight.stops === 0 ? '直飛' : `${flight.stops} 次停靠`}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-3xl font-mono font-bold tracking-tight text-primary">
                  {formatTime(flight.arrival_time)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">抵達 (當地時間)</span>
              </div>
            </div>
          </div>

          {/* 回程航班區塊 */}
          {flight.return_flight && (
            <div className="bg-muted/30 rounded-xl p-6 border border-border/50 mb-6">
              <h3 className="font-semibold text-sm text-primary mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 transform rotate-180" /> 回程航班 (Inbound)
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-mono font-bold tracking-tight text-primary">
                    {formatTime(flight.return_flight.departure_time)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">出發 (當地時間)</span>
                </div>

                <div className="flex flex-col items-center flex-1 px-4">
                  <span className="text-sm font-medium mb-2">{formatDuration(flight.return_flight.flight_duration_minutes)}</span>
                  <div className="flex items-center w-full max-w-[200px] gap-1">
                    <div className="w-2 h-2 rounded-full border-2 border-primary" />
                    <div className="flex-1 h-px bg-border relative">
                      {flight.return_flight.stops > 0 && (
                        <div className="absolute inset-0 flex items-center justify-evenly">
                          {Array.from({ length: flight.return_flight.stops }).map((_, i) => (
                            <Circle key={i} className="w-2 h-2 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      )}
                    </div>
                    <Plane className="w-4 h-4 text-primary transform rotate-180" />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">
                    {flight.return_flight.stops === 0 ? '直飛' : `${flight.return_flight.stops} 次停靠`}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-3xl font-mono font-bold tracking-tight text-primary">
                    {formatTime(flight.return_flight.arrival_time)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">抵達 (當地時間)</span>
                </div>
              </div>
            </div>
          )}

          {/* 綜合資訊 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">基本資訊</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">航班號碼</span>
                <span className="font-mono font-medium">{flight.flight_number}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">航空公司</span>
                <span>{flight.airline_name_zh} ({flight.airline_code})</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">資料來源</span>
                {flight.source === 'serpapi' ? (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Google Flights</Badge>
                ) : (
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30">Duffel API</Badge>
                )}
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                <span className="text-muted-foreground">機票價格</span>
                <span className="font-bold text-lg text-primary">NT$ {flight.price_twd.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">行李與環保</h3>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Luggage className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="font-medium">托運行李</span>
                  <span className="text-muted-foreground text-xs">
                    {flight.checked_baggage_pieces != null && flight.checked_baggage_pieces > 0
                      ? `${flight.checked_baggage_kg ? `${flight.checked_baggage_kg}KG` : ''} × ${flight.checked_baggage_pieces} 件`
                      : '無托運行李'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Luggage className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="font-medium">手提行李</span>
                  <span className="text-muted-foreground text-xs">
                    {flight.carry_on_pieces != null && flight.carry_on_pieces > 0
                      ? `${flight.carry_on_kg ? `${flight.carry_on_kg}KG` : ''} × ${flight.carry_on_pieces} 件`
                      : '無手提行李'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Leaf className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="font-medium">碳排放預估</span>
                  <span className="text-muted-foreground text-xs">
                    {flight.carbon_emissions_kg
                      ? `${Math.round(flight.carbon_emissions_kg)} kg CO₂`
                      : '碳排放資料暫無'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground/50 text-right mt-4">
            Offer ID: {flight.duffel_offer_id}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
