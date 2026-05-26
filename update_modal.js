const fs = require('fs');
const file = 'src/components/FlightDetailsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = <div className="bg-muted/30 rounded-xl p-6 border border-border/50 mb-6">;
const endStr =           {/* 綜合資訊 Grid */};

const newJSX = 
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
                  {flight.stops === 0 ? '直飛' : \\ 次停靠\}
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
                    {flight.return_flight.stops === 0 ? '直飛' : \\ 次停靠\}
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

;

const startIndex = content.indexOf(targetStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newJSX + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated FlightDetailsModal.tsx layout!');
} else {
  console.log('Could not find target strings for replacement.');
}
