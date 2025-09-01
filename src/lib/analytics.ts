/**
 * Plausible Analytics integration
 * Sends custom events to Plausible for tracking user interactions
 */

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

interface PlausibleEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
}

/**
 * Send a custom event to Plausible
 * @param event - Event name and optional properties
 */
export function trackEvent(event: PlausibleEvent): void {
  if (!PLAUSIBLE_DOMAIN || typeof window === 'undefined') {
    return;
  }

  try {
    // Create the event URL
    const url = new URL('https://plausible.io/api/event');
    url.searchParams.set('name', event.name);
    url.searchParams.set('domain', PLAUSIBLE_DOMAIN);
    url.searchParams.set('url', window.location.href);
    url.searchParams.set('screen_width', window.screen.width.toString());
    url.searchParams.set('screen_height', window.screen.height.toString());

    // Add custom properties if provided
    if (event.props) {
      Object.entries(event.props).forEach(([key, value]) => {
        url.searchParams.set(`props[${key}]`, value.toString());
      });
    }

    // Send the event using fetch
    fetch(url.toString(), {
      method: 'GET',
      mode: 'no-cors', // Plausible doesn't support CORS for events
    }).catch((error) => {
      // Silently fail in production, log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send Plausible event:', error);
      }
    });
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error sending Plausible event:', error);
    }
  }
}

/**
 * Track file drop event
 * @param fileCount - Number of files dropped
 */
export function trackFileDrop(fileCount: number): void {
  trackEvent({
    name: 'drop_files',
    props: {
      file_count: fileCount,
    },
  });
}

/**
 * Track processing start event
 * @param fileCount - Number of files being processed
 */
export function trackProcessStart(fileCount: number): void {
  trackEvent({
    name: 'process_start',
    props: {
      file_count: fileCount,
    },
  });
}

/**
 * Track processing completion event
 * @param fileCount - Number of files processed
 * @param successCount - Number of successfully processed files
 */
export function trackProcessDone(fileCount: number, successCount: number): void {
  trackEvent({
    name: 'process_done',
    props: {
      file_count: fileCount,
      success_count: successCount,
    },
  });
}

/**
 * Track ZIP export event
 * @param fileCount - Number of files in the export
 */
export function trackExportZip(fileCount: number): void {
  trackEvent({
    name: 'export_zip',
    props: {
      file_count: fileCount,
    },
  });
}

/**
 * Track page view event
 * @param page - Page name/path
 */
export function trackPageView(page: string): void {
  trackEvent({
    name: 'pageview',
    props: {
      page,
    },
  });
}
