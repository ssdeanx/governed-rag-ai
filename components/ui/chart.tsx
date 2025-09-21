"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]): boolean => Boolean(itemConfig && (itemConfig.theme ?? itemConfig.color))
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      ((itemConfig.theme?.[theme as keyof typeof itemConfig.theme]) !== null) ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

/**
 * Custom Recharts tooltip content renderer that formats and displays one or more tooltip items using the per-series chart configuration.
 *
 * Renders an optional header label and a list of payload entries (skipping items with type "none"). Each entry may show a configured icon, a colored indicator (dot/line/dashed), the resolved label from ChartConfig, and a formatted value. The component reads per-series overrides (label, icon, theme/color) from the ChartContext via useChart().
 *
 * @param payload - Recharts payload array for the active tooltip (explicitly accepted because library types may omit it).
 * @param active - Whether the tooltip is currently active; when falsy the component returns null.
 * @param indicator - Visual style of the item indicator: "dot" | "line" | "dashed".
 * @param hideLabel - When true, suppresses the tooltip header label.
 * @param hideIndicator - When true, suppresses the visual indicator for items that don't provide a custom icon.
 * @param label - Optional label override for the tooltip header; when a matching entry exists in ChartConfig the configured label is used.
 * @param labelFormatter - Optional function to format the header label; receives (value, payload).
 * @param formatter - Optional formatter function passed through from Recharts to render an individual item value.
 * @param nameKey - Key preference used to resolve an item's config/label (falls back to item.name, item.dataKey, then "value").
 * @param labelKey - Key preference used to resolve the tooltip header from payload (falls back to item.dataKey/item.name when omitted).
 * @param className - Additional container CSS class names.
 * @returns A JSX element containing the tooltip content, or null when inactive or when payload is empty.
 */
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: RechartsPrimitive.TooltipProps<any, any> &
  React.ComponentProps<"div"> & {
    // Explicitly include payload to satisfy TypeScript when the library types don't expose it here
    payload?: any
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    label?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${(Boolean((labelKey ?? (item?.dataKey) ?? item?.name))) || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label ?? label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {nestLabel ? null : tooltipLabel}
      <div className="grid gap-1.5">
        {payload
          .filter((item: { type: string }) => item.type !== "none")
          .map((item: any, index: number) => {
            const key = `${(nameKey ?? (item.name) ?? item.dataKey) ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? item.payload.fill ?? item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

/**
 * Renders a horizontal chart legend from Recharts payload entries using per-series config.
 *
 * Accepts a Recharts-style `payload` array and maps each visible item (item.type !== "none")
 * to a legend entry that shows either a configured icon or a colored square and the series label
 * resolved from the chart config.
 *
 * @param className - Optional container class names.
 * @param hideIcon - When true, forces the colored square indicator even if a series defines a custom icon.
 * @param payload - Recharts legend payload array; each entry is expected to be an object that may contain `type`, `dataKey`, `name`, `value`, and `color`.
 * @param verticalAlign - Controls vertical spacing: `"top"` uses bottom padding, otherwise top padding is applied.
 * @param nameKey - Optional key name to use when resolving the series config for a payload item (falls back to `item.dataKey` then `"value"`).
 *
 * @returns A legend container element or `null` when `payload` is empty or not provided.
 */
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
    payload?: any
    verticalAlign?: "top" | "middle" | "bottom"
  } & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!(payload?.length)) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item: { type: string }) => item.type !== "none")
        .map((item: any) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

/**
 * Resolve the per-series ChartConfig entry that corresponds to a Recharts payload item.
 *
 * Looks for a string key in the provided payload (or in a nested `payload.payload`) under `key`.
 * If found and that key exists in `config`, returns the matching config entry. Otherwise returns
 * `config[key]` (which may be undefined). If `payload` is not an object, returns undefined.
 *
 * @param config - The chart's full ChartConfig mapping series keys to per-series config.
 * @param payload - A Recharts payload item (or wrapper) to inspect for a series-identifying key.
 * @param key - The field name to look for on `payload` (e.g., "name" or a custom key).
 * @returns The matching per-series config from `config`, or undefined if none can be resolved.
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in (payload as Record<string, unknown>) &&
    typeof (payload as Record<string, unknown>).payload === "object" &&
    (payload as Record<string, unknown>).payload !== null
      ? (payload as Record<string, unknown>).payload
      : undefined

  let configLabelKey: string = key

  if (
    key in (payload as Record<string, unknown>) &&
    typeof (payload as Record<string, unknown>)[key] === "string"
  ) {
    configLabelKey = (payload as Record<string, unknown>)[key] as string
  } else if (
    payloadPayload &&
    key in (payloadPayload as Record<string, unknown>) &&
    typeof (payloadPayload as Record<string, unknown>)[key] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
