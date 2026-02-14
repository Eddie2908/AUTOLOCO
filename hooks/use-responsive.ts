"use client";

/**
 * Hook for Responsive Design Detection
 * ====================================
 *
 * Provides accurate breakpoint detection with SSR-safe rendering
 * and real-time responsive state updates.
 *
 * Tailwind Breakpoints:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */

import { useState, useEffect, useCallback } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
  windowWidth: number;
  isSSR: boolean;
}

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Get the current breakpoint based on window width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Hook: useResponsive
 *
 * Returns responsive state and breakpoint information.
 * Safe for SSR - returns mobile-first defaults on server.
 *
 * @example
 * const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive()
 *
 * if (isMobile) {
 *   return <MobileMenu />
 * }
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    currentBreakpoint: "xs",
    windowWidth: typeof window !== "undefined" ? window.innerWidth : 0,
    isSSR: typeof window === "undefined",
  });

  useEffect(() => {
    // Initial setup after hydration
    const updateState = () => {
      const width = window.innerWidth;
      const breakpoint = getBreakpoint(width);

      setState({
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        currentBreakpoint: breakpoint,
        windowWidth: width,
        isSSR: false,
      });
    };

    // Set initial state
    updateState();

    // Listen to resize events with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateState, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return state;
}

/**
 * Hook: useMediaQuery
 *
 * Simple media query matching hook.
 *
 * @example
 * const isSmallScreen = useMediaQuery("(max-width: 768px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener with fallback for older browsers
    if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    } else {
      mediaQuery.addEventListener("change", listener);
    }

    return () => {
      if (mediaQuery.removeListener) {
        mediaQuery.removeListener(listener);
      } else {
        mediaQuery.removeEventListener("change", listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook: useIsMounted
 *
 * Returns true only after component is mounted on client.
 * Useful to prevent hydration mismatches.
 *
 * @example
 * const isMounted = useIsMounted()
 * if (!isMounted) return null
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * Component: ResponsiveProvider
 *
 * Wraps children and provides responsive breakpoint data via context.
 * Include this at the top level of your app.
 */
export const ResponsiveBreakpoints = {
  mobile: BREAKPOINTS.md,
  tablet: BREAKPOINTS.lg,
  desktop: BREAKPOINTS.xl,
  wide: BREAKPOINTS["2xl"],
};
