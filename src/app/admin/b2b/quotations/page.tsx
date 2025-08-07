'use client';

import React from 'react';
import { Metadata } from 'next';
import B2BQuotationDashboard from '@/components/b2b/B2BQuotationDashboard';

// Note: This would be generated on the server in a real Next.js app
// export const metadata: Metadata = {
//   title: 'B2B Quotations | Admin Panel',
//   description: 'Manage B2B quotations, create quotes, and track approval workflows',
// };

export default function B2BQuotationsPage() {
  return (
    <div className="container mx-auto py-6">
      <B2BQuotationDashboard />
    </div>
  );
}
