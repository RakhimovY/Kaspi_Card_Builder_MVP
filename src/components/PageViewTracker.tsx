'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Component that tracks page views for analytics
 * Automatically sends pageview events when the route changes
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
