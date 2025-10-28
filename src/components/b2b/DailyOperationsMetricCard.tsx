'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { OrderMetric } from '@/lib/api';
import OrderListTable from './OrderListTable';

interface DailyOperationsMetricCardProps {
  title: string;
  metric: OrderMetric;
  icon?: React.ReactNode;
  badgeColor?: string;
  emptyMessage?: string;
}

export default function DailyOperationsMetricCard({
  title,
  metric,
  icon,
  badgeColor = 'bg-blue-500',
  emptyMessage
}: DailyOperationsMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Count Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold">
              {metric.count}
            </div>
            <Badge 
              className={`${badgeColor} text-white border-none`}
            >
              {metric.count === 1 ? 'Order' : 'Orders'}
            </Badge>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground mb-3">
          {formatDate(metric.date)}
        </p>

        {/* Expand/Collapse Button */}
        {metric.count > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                View Details
              </>
            )}
          </Button>
        )}

        {/* Expanded Order List */}
        {isExpanded && metric.count > 0 && (
          <div className="mt-4">
            <OrderListTable 
              orders={metric.orders} 
              emptyMessage={emptyMessage || 'No orders found'}
            />
          </div>
        )}

        {/* Empty State */}
        {metric.count === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {emptyMessage || 'No orders for this period'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

