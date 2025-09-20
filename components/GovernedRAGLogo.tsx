'use client';

import React from 'react';

interface GovernedRAGLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * React component that renders the Governed RAG SVG logo with configurable size and additional CSS classes.
 *
 * Renders an accessible (<svg aria-label="Governed RAG Logo">) logo composed of a shield, circuit/AI motif,
 * data-flow arrows, and a lock symbol. Color is driven by `currentColor` so the icon inherits text color.
 *
 * @param className - Optional additional CSS classes to append to the computed size classes.
 * @param size - Visual size of the icon; one of `'sm' | 'md' | 'lg'`. Defaults to `'md'`.
 * @returns A JSX element containing the SVG logo.
 */
export function GovernedRAGLogo({ className = '', size = 'md' }: GovernedRAGLogoProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Governed RAG Logo"
    >
      {/* Shield base */}
      <path
        d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner shield lines for security pattern */}
      <path
        d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* AI/RAG circuit pattern */}
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="currentColor"
        opacity="0.8"
      />

      {/* Circuit connections */}
      <path
        d="M8 10L10 12L8 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      <path
        d="M16 10L14 12L16 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Data flow arrows */}
      <path
        d="M6 8L4 6M4 6L6 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />

      <path
        d="M18 8L20 6M20 6L18 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Security lock symbol */}
      <rect
        x="10.5"
        y="15"
        width="3"
        height="2"
        rx="0.5"
        fill="currentColor"
        opacity="0.8"
      />

      <path
        d="M11.5 15V13.5C11.5 12.67 12.17 12 13 12C13.83 12 14.5 12.67 14.5 13.5V15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

export default GovernedRAGLogo;