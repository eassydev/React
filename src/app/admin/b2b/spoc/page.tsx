'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { B2BSPOCManager } from '@/components/b2b/B2BSPOCManager';

export default function SPOCManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SPOC Management</h1>
          <p className="text-gray-600">Manage Single Point of Contact assignments for B2B customers</p>
        </div>
      </div>

      {/* SPOC Manager Component */}
      <Card>
        <CardHeader>
          <CardTitle>SPOC Assignments & Workload Management</CardTitle>
        </CardHeader>
        <CardContent>
          <B2BSPOCManager />
        </CardContent>
      </Card>
    </div>
  );
}
