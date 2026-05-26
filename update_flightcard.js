const fs = require('fs');
const file = 'src/components/FlightCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr =         {/* 上半部：航空公司 + 起降時間 + 飛行時長 */};
const endStr =         {/* 下半部：行李 + 碳排放 */};

const newJSX = 
        {/* 航班航段資訊 (去程 + 回程) */}
        <div className="flex flex-col gap-4 mb-4">
          
          {/* 去程 (Outbound) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* 航空公司 */}
            <div className="flex items-center gap-2 min-w-[120px]">
              {!logoError ? (
                <img src={getAirlineLogoUrl(flight.airline_code)} alt={flight.airline_code} className="w-8 h-8 rounded object-contain bg-white/10" onError={() => setLogoError(true)} />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-[10px] font-bold">{flight.airline_code}</div>
              )}
              <div className="flex flex-col min-w-0 gap-0.5">
                <span className="text-sm font-medium truncate leading-none">{flight.airline_name_zh}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-mono leading-none">{flight.flight_number}</span>
                  {flight.source === 'serpapi' ? (
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 text-emerald-500 border-emerald-500/30">Google</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 text-blue-500 border-blue-500/30">Duffel</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 起降時間 */}
            <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold font-mono">{formatTime(flight.departure_time)}</span>
                <span className="text-[9px] text-muted-foreground/70">當地</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-2 flex-1 max-w-[150px]">
                <span className="text-[10px] text-muted-foreground">{formatDuration(flight.flight_duration_minutes)}</span>
                <div className="flex items-center gap-0.5 w-full justify-center">
                  <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
                  <div className="flex-1 h-px bg-muted-foreground/50 min-w-[20px]" />
                  {flight.stops > 0 && Array.from({ length: flight.stops }).map((_, i) => (
                    <div key={i} className="flex items-center gap-0.5"><Circle className="w-1.5 h-1.5 fill-amber-500 text-amber-500" /><div className="w-4 h-px bg-muted-foreground/50" /></div>
                  ))}
                  <Plane className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">{flight.stops === 0 ? '直飛' : \\ 次停靠\}</span>
              </div>
              <div className="relative flex flex-col items-center">
                <span className="text-lg font-semibold font-mono">{formatTime(flight.arrival_time)}</span>
                <span className="text-[9px] text-muted-foreground/70">當地</span>
                {getDayDiff(flight.departure_time, flight.arrival_time) > 0 && (
                  <span className="absolute -top-1 -right-4 text-[10px] text-amber-500 font-semibold">+\</span>
                )}
              </div>
            </div>
          </div>

          {/* 回程 (Inbound) - 若有資料 */}
          {flight.return_flight && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 min-w-[120px]">
                <img src={getAirlineLogoUrl(flight.return_flight.airline_code)} alt={flight.return_flight.airline_code} className="w-8 h-8 rounded object-contain bg-white/10" />
                <div className="flex flex-col min-w-0 gap-0.5">
                  <span className="text-sm font-medium truncate leading-none">{flight.return_flight.airline_name_zh}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono leading-none">{flight.return_flight.flight_number}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold font-mono">{formatTime(flight.return_flight.departure_time)}</span>
                  <span className="text-[9px] text-muted-foreground/70">當地</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-2 flex-1 max-w-[150px]">
                  <span className="text-[10px] text-muted-foreground">{formatDuration(flight.return_flight.flight_duration_minutes)}</span>
                  <div className="flex items-center gap-0.5 w-full justify-center">
                    <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
                    <div className="flex-1 h-px bg-muted-foreground/50 min-w-[20px]" />
                    {flight.return_flight.stops > 0 && Array.from({ length: flight.return_flight.stops }).map((_, i) => (
                      <div key={i} className="flex items-center gap-0.5"><Circle className="w-1.5 h-1.5 fill-amber-500 text-amber-500" /><div className="w-4 h-px bg-muted-foreground/50" /></div>
                    ))}
                    <Plane className="w-3 h-3 text-muted-foreground transform rotate-180" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{flight.return_flight.stops === 0 ? '直飛' : \\ 次停靠\}</span>
                </div>
                <div className="relative flex flex-col items-center">
                  <span className="text-lg font-semibold font-mono">{formatTime(flight.return_flight.arrival_time)}</span>
                  <span className="text-[9px] text-muted-foreground/70">當地</span>
                  {getDayDiff(flight.return_flight.departure_time, flight.return_flight.arrival_time) > 0 && (
                    <span className="absolute -top-1 -right-4 text-[10px] text-amber-500 font-semibold">+\</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 缺回程提示 */}
          {!flight.return_flight && flight.source === 'serpapi' && (
            <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md border border-border/50 text-center">
              回程航班需於 Google Flights 官網確認
            </div>
          )}

        </div>

        {/* 票價行 */}
        <div className="flex items-end justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground mb-1 font-semibold">含回程總價</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-none">
              {formatPrice(flight.price_twd)}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mb-1">
            {flight.price_currency_original} {flight.price_original.toLocaleString()}
          </span>
        </div>

;

const startIndex = content.indexOf(targetStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newJSX + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated FlightCard.tsx layout!');
} else {
  console.log('Could not find target strings for replacement.');
}
