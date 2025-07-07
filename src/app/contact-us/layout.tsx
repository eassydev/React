import React from 'react';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Contact Us - Eassy Life',
  description:
    'Contact Eassy Life for any questions, support, or feedback. We are here to help you with our home services.',
  keywords: 'contact, support, eassy life, home services, customer service',
  openGraph: {
    title: "Contact Eassy Life - We're Here to Help",
    description: 'Reach out to our support team for any assistance with our home services.',
    type: 'website',
    url: 'https://admin.eassylife.in/contact-us',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://admin.eassylife.in/contact-us',
  },
};

interface ContactUsLayoutProps {
  children: React.ReactNode;
}

export default function ContactUsLayout({ children }: ContactUsLayoutProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        {/* Main content */}
        <main>{children}</main>
        <Toaster />
      </div>
    </ToastProvider>
  );
}
