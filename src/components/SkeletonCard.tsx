'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-border/50 animate-pulse">
      <CardContent className="p-4 space-y-3">
        {/* 航空公司 + 時間列 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-px w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        {/* 價格 */}
        <Skeleton className="h-7 w-32" />
        {/* 行李 + 碳排 */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        {/* 底部 */}
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
