<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next"
import {
  mcpDisplayName,
  toolDisplayName,
  type McpDto,
  type ToolDto,
} from "~~/shared/mcp-panorama"

const props = withDefaults(
  defineProps<{
    tool: ToolDto
    mcp: McpDto
    active?: boolean
    /** Compact = used inside PdtBlock or dense panorama mode. */
    compact?: boolean
  }>(),
  { active: false, compact: false },
)

const emit = defineEmits<{ pick: [{ tool: ToolDto; mcp: McpDto }] }>()

const { locale, t } = useI18n()
const localePath = useLocalePath()

const displayName = computed(() => {
  // Placeholder tiles render the tool's display name (e.g. "RefactorBot") —
  // there is no real MCP yet, so the MCP-as-tile label uses the parent name.
  if (props.mcp.isPlaceholder) return toolDisplayName(props.tool, locale.value)
  return mcpDisplayName(props.mcp, locale.value)
})
const isReleased = computed(() => props.mcp.status === "released")
const showDeps = computed(() => props.mcp.depsCount >= 10)

const tooltip = computed(() => {
  const statusLabel = t(`mcpPanorama.status.${props.mcp.status}.label`)
  const toolName = toolDisplayName(props.tool, locale.value)
  const ctx = displayName.value === toolName ? "" : ` · ${toolName}`
  if (isReleased.value) {
    return `${displayName.value}${ctx} · ${t("mcpPanorama.detail.openInMarketplace")} →`
  }
  return `${displayName.value}${ctx} · ${statusLabel} (${t("mcpPanorama.detail.notAvailable")})`
})

const baseClass = computed(() => [
  "group inline-flex items-center gap-1.5 rounded-md text-[12px] leading-tight font-medium tracking-tight no-underline relative shrink-0 transition-all border",
  // status colors
  props.mcp.status === "released"
    && "bg-(--color-status-released-bg) text-(--color-status-released) border-(--color-status-released)/20 border-l-[3px] border-l-(--color-status-released)",
  props.mcp.status === "dev"
    && "bg-(--color-status-dev-bg) text-(--color-status-dev) border-(--color-status-dev)/20 border-l-[3px] border-l-(--color-status-dev)",
  props.mcp.status === "none"
    && "bg-(--color-status-none-bg) text-(--color-status-none) border-(--color-status-none)/20 border-l-[3px] border-l-(--color-status-none)",
  // density
  props.compact ? "px-[7px] py-[3px] text-[11px]" : "px-[9px] py-[5px]",
  // active ring
  props.active && isReleased.value && "ring-2 ring-(--color-status-released)/30",
  // hover (only when clickable)
  isReleased.value && "cursor-pointer hover:-translate-y-px hover:border-(--color-status-released) hover:shadow-[0_4px_12px_-4px] hover:shadow-(--color-status-released)/40",
])

function onClick(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
  emit("pick", { tool: props.tool, mcp: props.mcp })
}

function onStaticPick() {
  emit("pick", { tool: props.tool, mcp: props.mcp })
}
</script>

<template>
  <NuxtLink
    v-if="isReleased && mcp.extensionSlug"
    :to="localePath(`/extensions/${mcp.extensionSlug}`)"
    :title="tooltip"
    :class="baseClass"
    @click="onClick"
  >
    <span class="whitespace-nowrap shrink-0">{{ displayName }}</span>
    <span
      v-if="showDeps"
      class="font-mono text-[9px] font-semibold rounded px-1 py-0 bg-(--color-status-released) text-(--color-card)"
    >{{ mcp.depsCount }}</span>
    <ChevronRight :size="9" class="shrink-0 opacity-70" aria-hidden="true" />
  </NuxtLink>
  <button
    v-else
    type="button"
    :title="tooltip"
    :aria-disabled="mcp.isPlaceholder ? 'true' : undefined"
    :class="[...baseClass, 'cursor-pointer']"
    @click="onStaticPick"
  >
    <span class="whitespace-nowrap shrink-0">{{ displayName }}</span>
    <span
      v-if="showDeps"
      class="font-mono text-[9px] font-semibold rounded px-1 py-0 text-(--color-card)"
      :class="[
        mcp.status === 'dev' && 'bg-(--color-status-dev)',
        mcp.status === 'none' && 'bg-(--color-status-none)',
      ]"
    >{{ mcp.depsCount }}</span>
  </button>
</template>
