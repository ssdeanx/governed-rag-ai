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
    sm: { class: 'h-5 w-5', px: 20 },
    md: { class: 'h-6 w-6', px: 24 },
    lg: { class: 'h-8 w-8', px: 32 }
  };

  const { class: sizeClass, px } = sizeClasses[size] || sizeClasses.md;

  return (
    <svg
      className={`${sizeClass} ${className} flex-shrink-0 logo-fixed-size`}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Deanmachines Logo"
      focusable="false"
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

      {/* Stylized scorpion silhouette in the shield center */}
      <g transform="translate(0,0)" fill="currentColor" opacity="0.95">
        {/* body */}
        <ellipse cx="12" cy="13" rx="2.3" ry="2.8" />
        {/* claws */}
        <path d="M8.2 11.5c-.9-.6-1.6-1.6-1.6-2.7 0-1 .6-1.8 1.5-2.1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15.8 11.5c.9-.6 1.6-1.6 1.6-2.7 0-1-.6-1.8-1.5-2.1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* tail */}
        <path d="M14.5 9.5c1.2-1.2 2.2-1.6 3.3-1.3 0 .8-.4 1.8-1.4 2.7-.9.9-2.2 1.8-3.6 2.6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M16.8 6.2c.6-.6 1.6-.8 2.5-.4" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* legs */}
        <path d="M10 14.2L7.6 16" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M14 14.2L16.4 16" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

export default GovernedRAGLogo;