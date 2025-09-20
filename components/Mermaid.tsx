'use client'

import { useEffect } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  id?: string
}

/**
 * Render a Mermaid diagram from a Mermaid chart definition string.
 *
 * Initializes the mermaid library on mount (theme: "default", startOnLoad: true, securityLevel: "loose")
 * and signals that content is ready for rendering, then mounts a div with class "mermaid" containing
 * the provided chart source.
 *
 * @param chart - Mermaid chart definition (text) to render inside the component
 * @param id - Optional explicit DOM id for the container; if omitted an id is generated
 * @returns A JSX element containing the mermaid diagram container
 */
export function Mermaid({ chart, id }: MermaidProps) {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    })
    mermaid.contentLoaded()
  }, [])

  const chartId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="mermaid" id={chartId}>
      {chart}
    </div>
  )
}