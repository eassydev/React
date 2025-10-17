'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface TopCustomer {
  id: string;
  company_name: string;
  total_value?: number;  // For by_revenue and by_orders
  profit?: number;
  orders?: number;  // For by_orders
  profit_margin_percentage?: string;
}

interface B2BTopCustomersTableProps {
  title: string;
  data: TopCustomer[];
  metric: 'revenue' | 'profit' | 'orders';
}

const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

export default function B2BTopCustomersTable({ 
  title, 
  data, 
  metric 
}: B2BTopCustomersTableProps) {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRowClick = (customerId: string) => {
    router.push(`/admin/b2b/customers/${customerId}/analytics`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Company Name</TableHead>
              {metric === 'revenue' && (
                <>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Profit Margin</TableHead>
                </>
              )}
              {metric === 'profit' && (
                <>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </>
              )}
              {metric === 'orders' && (
                <>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((customer, index) => (
              <TableRow 
                key={customer.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(customer.id)}
              >
                <TableCell>
                  <Badge variant={index < 3 ? 'default' : 'secondary'}>
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {customer.company_name}
                </TableCell>
                {metric === 'revenue' && (
                  <>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(customer.total_value || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {customer.profit_margin_percentage || '0'}%
                      </Badge>
                    </TableCell>
                  </>
                )}
                {metric === 'profit' && (
                  <>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(customer.profit || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        {customer.profit_margin_percentage || '0'}%
                      </Badge>
                    </TableCell>
                  </>
                )}
                {metric === 'orders' && (
                  <>
                    <TableCell className="text-right font-semibold">
                      {customer.orders || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(customer.total_value || 0)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

