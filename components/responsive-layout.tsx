"use client";

/**
 * Responsive Container Components
 * ==============================
 *
 * Layout components that adapt to different screen sizes
 * with proper spacing, padding, and breakpoint adjustments.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-responsive";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * Component: ResponsiveContainer
 * Main layout container with responsive max-widths
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = "xl",
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        maxWidthClasses[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Component: ResponsiveGrid
 * Grid that adapts columns based on screen size
 *
 * IMPORTANT: Uses pre-compiled Tailwind classes, not dynamic strings.
 * Tailwind CSS only processes classes available at build time.
 * Never use: grid-cols-${n} or similar dynamic classes!
 *
 * @example
 * // ✅ CORRECT
 * <ResponsiveGrid columns={{ default: 1, md: 2, lg: 3 }}>
 *
 * // ❌ WRONG (doesn't work)
 * <div className={`grid-cols-${n}`}>
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
}

// Pre-compiled grid column classes for all possible values
const gridColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const smGridColsMap: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

const mdGridColsMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const lgGridColsMap: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

const xlGridColsMap: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

const xxlGridColsMap: Record<number, string> = {
  1: "2xl:grid-cols-1",
  2: "2xl:grid-cols-2",
  3: "2xl:grid-cols-3",
  4: "2xl:grid-cols-4",
  5: "2xl:grid-cols-5",
  6: "2xl:grid-cols-6",
};

export function ResponsiveGrid({
  children,
  className,
  columns = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
}: ResponsiveGridProps) {
  const gridClasses = [
    "grid gap-4 sm:gap-6 lg:gap-8",
    gridColsMap[columns.default] || "grid-cols-1",
    columns.sm && smGridColsMap[columns.sm],
    columns.md && mdGridColsMap[columns.md],
    columns.lg && lgGridColsMap[columns.lg],
    columns.xl && xlGridColsMap[columns.xl],
    columns["2xl"] && xxlGridColsMap[columns["2xl"]],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={gridClasses}>{children}</div>;
}

/**
 * Component: ResponsiveStack
 * Flex stack that switches direction on mobile
 */
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: "horizontal" | "vertical";
  spacing?: "xs" | "sm" | "md" | "lg";
  alignItems?: "start" | "center" | "end" | "stretch";
}

export function ResponsiveStack({
  children,
  className,
  direction = "vertical",
  spacing = "md",
  alignItems = "start",
}: ResponsiveStackProps) {
  const spacingClasses = {
    xs: "gap-2 sm:gap-3",
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  // On mobile: always vertical, on desktop: respect direction
  const directionClass =
    direction === "horizontal" ? "flex flex-col sm:flex-row" : "flex flex-col";

  return (
    <div
      className={cn(
        directionClass,
        spacingClasses[spacing],
        alignClasses[alignItems],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Component: ResponsiveText
 * Text that adjusts size based on screen size
 */
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl";
  mobile?: "xs" | "sm" | "base";
  desktop?: "lg" | "xl" | "2xl";
}

export function ResponsiveText({
  children,
  className,
  size = "base",
  mobile,
  desktop,
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const mobileClass = mobile ? sizeClasses[mobile] : sizeClasses[size];
  const desktopClass = desktop ? `md:${sizeClasses[desktop]}` : "";

  return (
    <span className={cn(mobileClass, desktopClass, className)}>{children}</span>
  );
}

/**
 * Component: HiddenOnMobile
 * Hide element on mobile devices
 */
interface HiddenProps {
  children: React.ReactNode;
  className?: string;
}

export function HiddenOnMobile({ children, className }: HiddenProps) {
  return <div className={cn("hidden md:block", className)}>{children}</div>;
}

/**
 * Component: VisibleOnMobile
 * Show element only on mobile devices
 */
export function VisibleOnMobile({ children, className }: HiddenProps) {
  return <div className={cn("block md:hidden", className)}>{children}</div>;
}

/**
 * Component: ResponsivePadding
 * Padding that adapts to screen size
 */
interface ResponsivePaddingProps {
  children: React.ReactNode;
  className?: string;
  p?: "xs" | "sm" | "md" | "lg";
}

export function ResponsivePadding({
  children,
  className,
  p = "md",
}: ResponsivePaddingProps) {
  const paddingClasses = {
    xs: "p-2 sm:p-3 md:p-4",
    sm: "p-3 sm:p-4 md:p-6",
    md: "p-4 sm:p-6 md:p-8",
    lg: "p-6 sm:p-8 md:p-12",
  };

  return <div className={cn(paddingClasses[p], className)}>{children}</div>;
}

/**
 * Component: ResponsiveDialog
 * Dialog that becomes fullscreen on mobile
 */
interface ResponsiveDialogProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
}

export function ResponsiveDialog({
  children,
  className,
  isOpen = true,
}: ResponsiveDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "md:inset-auto md:max-w-2xl md:mx-auto md:top-1/2 md:-translate-y-1/2",
        "bg-background rounded-none md:rounded-lg",
        "border-none md:border",
        className,
      )}
    >
      {children}
    </div>
  );
}
