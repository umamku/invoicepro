import posthog from 'posthog-js';

// Extend window interface for Google Analytics dataLayer & gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let isInitialized = false;

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-T4LLFZ4GX';

/**
 * Check if the user is running the app as an installed PWA (Standalone mode)
 * Works for both Android / Chrome and iOS Safari "Add to Home Screen"
 */
export const isStandalonePWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Initialize PostHog and Google Analytics 4 (GA4)
 * Only initializes if environment keys are provided.
 */
export const initAnalytics = () => {
  if (isInitialized || typeof window === 'undefined') return;

  // 1. Initialize PostHog
  if (POSTHOG_KEY) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false, // Explicitly false to respect user privacy and avoid capturing sensitive invoice data
        capture_pageview: false, // We control page/tab views manually
        persistence: 'localStorage',
      });
    } catch (err) {
      console.warn('[PostHog] Init error:', err);
    }
  }

  // 2. Initialize Google Analytics 4 (GA4)
  if (GA_MEASUREMENT_ID) {
    try {
      if (!document.getElementById('ga-gtag-script')) {
        const script = document.createElement('script');
        script.id = 'ga-gtag-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
          send_page_view: false, // Handled manually via trackPageView
        });
      }
    } catch (err) {
      console.warn('[GA4] Init error:', err);
    }
  }

  isInitialized = true;
};

/**
 * Track a page/tab change across PostHog and GA4
 */
export const trackPageView = (pageName: string, path?: string) => {
  const currentPath = path || `/${pageName}`;
  const isPwa = isStandalonePWA();

  // PostHog
  if (POSTHOG_KEY) {
    try {
      posthog.capture('$pageview', {
        $current_url: window.location.origin + currentPath,
        page_name: pageName,
        is_pwa: isPwa,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Google Analytics & Google Tag Manager (GTM)
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'page_view', {
          page_title: pageName,
          page_location: window.location.origin + currentPath,
          page_path: currentPath,
          is_pwa: isPwa,
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (Array.isArray(window.dataLayer)) {
      try {
        window.dataLayer.push({
          event: 'page_view',
          page_title: pageName,
          page_path: currentPath,
          is_pwa: isPwa,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};

/**
 * Track custom feature events (prints, downloads, creation, etc.)
 * Strictly send non-sensitive operational telemetry only.
 */
export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  const enrichedProperties = {
    ...properties,
    is_pwa: isStandalonePWA(),
  };

  // PostHog
  if (POSTHOG_KEY) {
    try {
      posthog.capture(eventName, enrichedProperties);
    } catch (e) {
      console.error(e);
    }
  }

  // Google Analytics & Google Tag Manager (GTM)
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, enrichedProperties);
      } catch (e) {
        console.error(e);
      }
    }

    if (Array.isArray(window.dataLayer)) {
      try {
        window.dataLayer.push({
          event: eventName,
          ...enrichedProperties,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
};
