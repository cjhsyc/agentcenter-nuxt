import { describe, expect, it } from "vitest"
import {
  mcpDisplayBlurb,
  mcpDisplayName,
  rankFor,
  toolDisplayBlurb,
  toolDisplayName,
  type GroupStats,
  type McpDto,
  type ToolDto,
} from "./mcp-panorama"

function stats(released: number, dev: number, none: number): GroupStats {
  const total = released + dev + none
  return {
    total,
    counts: { released, dev, none },
    releasedPct: total === 0 ? 0 : Math.round((released / total) * 100),
    activePct: total === 0 ? 0 : Math.round(((released + dev) / total) * 100),
    lagPct: total === 0 ? 0 : Math.round((none / total) * 100),
  }
}

function mkMcp(over: Partial<McpDto> = {}): McpDto {
  return {
    id: 1, slug: "x-mcp", name: "x-mcp", nameZh: null,
    status: "none", depsCount: 0, blurb: "", blurbZh: "", tags: [],
    extensionSlug: null, isPlaceholder: false,
    ...over,
  }
}

function mkTool(over: Partial<ToolDto> = {}): ToolDto {
  return {
    id: 1, slug: "x", name: "X", nameZh: null, blurb: "", blurbZh: "",
    ownerPrimary: "x", ownerSecondary: null,
    mcps: [mkMcp()], rollupStatus: "none",
    ...over,
  }
}

describe("rankFor", () => {
  it("returns null for groups with fewer than 3 MCPs", () => {
    expect(rankFor(stats(2, 0, 0))).toBeNull()
    expect(rankFor(stats(0, 0, 2))).toBeNull()
  })

  it("returns leading at >= 75% released", () => {
    expect(rankFor(stats(8, 1, 1))).toBe("leading")
    expect(rankFor(stats(3, 1, 0))).toBe("leading")
  })

  it("returns onTrack at 50–74% released", () => {
    expect(rankFor(stats(5, 5, 0))).toBe("onTrack")
    expect(rankFor(stats(6, 4, 0))).toBe("onTrack")
  })

  it("returns lagging when >= 50% are no-mcp-needed", () => {
    expect(rankFor(stats(0, 1, 4))).toBe("lagging")
    expect(rankFor(stats(1, 1, 5))).toBe("lagging")
  })

  it("returns early when very low coverage and not lagging", () => {
    expect(rankFor(stats(0, 4, 0))).toBe("early")
  })

  it("returns null in the middling band", () => {
    expect(rankFor(stats(1, 2, 1))).toBeNull()
  })
})

describe("toolDisplayName", () => {
  it("falls back to English when nameZh is null even in zh locale", () => {
    expect(toolDisplayName(mkTool({ name: "IDE" }), "zh")).toBe("IDE")
  })

  it("uses nameZh in zh locale when set", () => {
    expect(toolDisplayName(mkTool({ name: "5G-Sim", nameZh: "5G 仿真" }), "zh")).toBe("5G 仿真")
  })

  it("uses English in en locale even when nameZh is set", () => {
    expect(toolDisplayName(mkTool({ name: "5G-Sim", nameZh: "5G 仿真" }), "en")).toBe("5G-Sim")
  })
})

describe("toolDisplayBlurb", () => {
  const tool = mkTool({ blurb: "english", blurbZh: "中文" })

  it("returns english blurb in en locale", () => {
    expect(toolDisplayBlurb(tool, "en")).toBe("english")
  })

  it("returns chinese blurb in zh locale", () => {
    expect(toolDisplayBlurb(tool, "zh")).toBe("中文")
  })
})

describe("mcpDisplayName", () => {
  it("falls back to English when nameZh is null even in zh locale", () => {
    expect(mcpDisplayName(mkMcp({ name: "codecheck-mcp" }), "zh")).toBe("codecheck-mcp")
  })

  it("uses nameZh in zh locale when set", () => {
    expect(mcpDisplayName(mkMcp({ name: "codecheck-mcp", nameZh: "代码检查" }), "zh")).toBe("代码检查")
  })
})

describe("mcpDisplayBlurb", () => {
  const m = mkMcp({ blurb: "english", blurbZh: "中文" })

  it("returns english blurb in en locale", () => {
    expect(mcpDisplayBlurb(m, "en")).toBe("english")
  })

  it("returns chinese blurb in zh locale", () => {
    expect(mcpDisplayBlurb(m, "zh")).toBe("中文")
  })
})
