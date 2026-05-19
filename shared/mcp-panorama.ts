// Types and helpers shared between the MCP Panorama API and its UI.

import type { McpStatus } from "~~/shared/data/mcp-landscape"

export type Layer = "industry" | "public"

/**
 * A single MCP server. This is the leaf entity rendered as a tile on the
 * panorama — a tool may expose 0–N MCPs, plus a synthesized placeholder when
 * none exist so the inventory stays visible.
 */
export interface McpDto {
  /** mcp_landscape_mcps.id, or a synthesized negative id when this is a
   * placeholder MCP for a tool that doesn't expose any. */
  id: number
  slug: string
  name: string
  nameZh: string | null
  status: McpStatus
  depsCount: number
  blurb: string
  blurbZh: string
  tags: string[]
  /** When status === "released", the marketplace listing slug. */
  extensionSlug: string | null
  /** True when this row was synthesized client/server-side because the tool
   * has no MCPs yet; rendered greyed-out without a marketplace link. */
  isPlaceholder: boolean
}

/**
 * A PDT software tool — the *product* that owns one or more MCPs. The tile
 * row is grouped under its tool header in the panorama.
 */
export interface ToolDto {
  id: number
  slug: string
  name: string
  nameZh: string | null
  blurb: string
  blurbZh: string
  ownerPrimary: string
  ownerSecondary: string | null
  /** Always ≥ 1 — a placeholder is synthesized when the tool has no real MCPs. */
  mcps: McpDto[]
  /** "released wins" rollup: released if any MCP is released, else dev if any
   * is in-dev, else none. Used for tool-level summaries; tiles render per-MCP. */
  rollupStatus: McpStatus
}

export interface StatusCounts {
  released: number
  dev: number
  none: number
}

/** Counts are over **MCPs** (the leaf tile entity), not tools. */
export interface GroupStats {
  total: number
  counts: StatusCounts
  releasedPct: number
  activePct: number
  lagPct: number
}

export interface PdtBlock {
  key: string
  label: string
  labelZh: string
  items: ToolDto[]
}

export interface SectorGroup {
  kind: "sector"
  key: string
  label: string
  labelZh: string
  short: string
  items: ToolDto[]
  stats: GroupStats
}

export interface DomainGroup {
  kind: "domain"
  key: string
  label: string
  labelZh: string
  short: string
  items: ToolDto[]
  pdts: PdtBlock[]
  stats: GroupStats
}

export type Group = SectorGroup | DomainGroup

export interface LayerPayload {
  layer: Layer
  layerStats: GroupStats
  groups: Group[]
}

export type RankKey = "leading" | "onTrack" | "lagging" | "early"

/** Returns the rank label for a group's stats — null if too small or middling. */
export function rankFor(stats: GroupStats): RankKey | null {
  if (stats.total < 3) return null
  if (stats.releasedPct >= 75) return "leading"
  if (stats.releasedPct >= 50) return "onTrack"
  if (stats.lagPct >= 50) return "lagging"
  if (stats.releasedPct < 25) return "early"
  return null
}

export const STATUS_ORDER: McpStatus[] = ["none", "dev", "released"]

/** Localised display name for a tool (Chinese fallback to English when null). */
export function toolDisplayName(tool: ToolDto, locale: string): string {
  if (locale === "zh" && tool.nameZh) return tool.nameZh
  return tool.name
}

/** Localised display blurb for a tool. */
export function toolDisplayBlurb(tool: ToolDto, locale: string): string {
  return locale === "zh" ? tool.blurbZh : tool.blurb
}

/** Localised display name for an MCP (Chinese fallback to English). */
export function mcpDisplayName(mcp: McpDto, locale: string): string {
  if (locale === "zh" && mcp.nameZh) return mcp.nameZh
  return mcp.name
}

/** Localised display blurb for an MCP. */
export function mcpDisplayBlurb(mcp: McpDto, locale: string): string {
  return locale === "zh" ? mcp.blurbZh : mcp.blurb
}

/** Localised group title. */
export function groupDisplayTitle(g: Group, locale: string): string {
  return locale === "zh" ? g.labelZh : g.label
}

export function pdtDisplayTitle(p: PdtBlock, locale: string): string {
  return locale === "zh" ? p.labelZh : p.label
}
