'use client'

import { useEffect, useState } from 'react'
import { History, ArrowRight, PlaneTakeoff, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RouteInput, TripType, CabinClass } from '@/lib/types'

interface HistorySession {
  id: string
  created_at: string
  passenger_count: number
  trip_type: TripType
  cabin_class: CabinClass
  departure_date: string
  return_date: string | null
  search_routes: {
    origin: string
    destination: string
    destination_city_zh: string
    sort_order: number
  }[]
}

interface SearchHistoryProps {
  onSelectHistory: (params: {
    routes: RouteInput[]
    departureDate: string
    returnDate?: string
    passengerCount: number
    cabinClass: CabinClass
    tripType: TripType
  }) => void
}

export default function SearchHistory({ onSelectHistory }: SearchHistoryProps) {
  const [history, setHistory] = useState<HistorySession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/flights/history')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.history) {
            setHistory(data.history)
          }
        }
      } catch (err) {
        console.error('Failed to fetch history:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHistory()
  }, [])

  if (loading || history.length === 0) {
    return null
  }

  return (
    <div className="mt-8 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-semibold tracking-tight">近期搜尋紀錄</h3>
        <span className="text-xs text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">保留 7 天</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((session) => {
          // 確保路徑有排序
          const routes = [...session.search_routes].sort((a, b) => a.sort_order - b.sort_order)
          
          return (
            <div 
              key={session.id}
              onClick={() => onSelectHistory({
                routes: routes.map(r => ({ origin: r.origin, destination: r.destination, cityZh: r.destination_city_zh || r.destination })),
                departureDate: session.departure_date,
                returnDate: session.return_date || undefined,
                passengerCount: session.passenger_count,
                cabinClass: session.cabin_class,
                tripType: session.trip_type
              })}
              className="bg-card border border-border/50 hover:border-indigo-500/50 hover:shadow-md transition-all rounded-xl p-4 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {session.trip_type === 'roundtrip' ? '來回' : '單程'} · {session.passenger_count} 位 · {
                    session.cabin_class === 'economy' ? '經濟艙' :
                    session.cabin_class === 'business' ? '商務艙' :
                    session.cabin_class === 'first' ? '頭等艙' : '豪經艙'
                  }
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                {routes.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium">
                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs">{r.origin}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs">{r.destination}</span>
                    <span className="text-muted-foreground text-xs ml-1">{r.destination_city_zh}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <PlaneTakeoff className="w-3.5 h-3.5" />
                  {session.departure_date}
                </div>
                {session.return_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    回程: {session.return_date}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
