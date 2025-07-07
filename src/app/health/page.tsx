import React from 'react';

import Link from 'next/link';

import { Lock } from 'lucide-react';

export default function page() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <Lock className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Health Check
        </h1>
        <p className="mt-4 text-muted-foreground">Succesfully</p>
        <div className="mt-6"></div>
      </div>
    </div>
  );
}
