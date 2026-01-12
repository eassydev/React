'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface B2BMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  alert?: boolean;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  valueClassName?: string;
  onClick?: () => void; // ✅ NEW: Click handler for drill-down
}

export default function B2BMetricCard({
  title,
  value,
  subtitle,
  icon,
  alert = false,
  trend,
  className,
  valueClassName,
  onClick // ✅ NEW
}: B2BMetricCardProps) {
  const isPositive = trend && trend.value >= 0;
  const isNegative = trend && trend.value < 0;

  return (
    <Card
      className={`${className} ${alert ? 'border-l-4 border-l-red-500' : ''} ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-black dark:text-white">{title}</CardTitle>
        {icon && (
          <div className="text-black dark:text-white">
            {icon}
          </div>
        )}
        {alert && !icon && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-extrabold text-black dark:text-white ${valueClassName || ''}`}>
          {value}
        </div>

        {subtitle && (
          <p className="text-sm font-medium text-black dark:text-white mt-2">{subtitle}</p>
        )}

        {trend && (
          <div className="flex items-center space-x-1 text-xs mt-2">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={`${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

