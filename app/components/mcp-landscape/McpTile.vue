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
    /** Compact = used inside ToolMcpsCard. */
    compact?: boolean
  }>(),
  { active: false, compact: false },
)

const emit = defineEmits<{ pick: [{ tool: ToolDto; mcp: McpDto }] }>()

const { locale, t } = useI18n()
const localePath = useLocalePath()

const isReleased = computed(() => props.mcp.status === "released")
const showDeps = computed(() => props.mcp.depsCount >= 10)

// Placeholder pills are visually quiet — the tool name is already in the
// card header above, so the pill just signals "no MCP yet" with an em dash.
const displayName = computed(() => {
  if (props.mcp.isPlaceholder) return "—"
  return mcpDisplayName(props.mcp, locale.value)
})

const tooltip = computed(() => {
  const statusLabel = t(`mcpPanorama.status.${props.mcp.status}.label`)
  const toolName = toolDisplayName(props.tool, locale.value)
  if (props.mcp.isPlaceholder) {
    return `${toolName} · ${statusLabel} (${t("mcpPanorama.detail.notAvailable")})`
  }
  const mcpName = mcpDisplayName(props.mcp, locale.value)
  if (isReleased.value) {
    return `${mcpName} · ${toolName} · ${t("mcpPanorama.detail.openInMarketplace")} →`
  }
  return `${mcpName} · ${toolName} · ${statusLabel} (${t("mcpPanorama.detail.notAvailable")})`
})

const baseClass = computed(() => [
  "group inline-flex items-center gap-1 rounded-full leading-none font-medium tracking-tight no-underline relative shrink-0 transition-all",
  props.mcp.status === "released"
    && "bg-(--color-status-released-bg) text-(--color-status-released)",
  props.mcp.status === "dev"
    && "bg-(--color-status-dev-bg) text-(--color-status-dev)",
  props.mcp.status === "none"
    && "bg-(--color-status-none-bg) text-(--color-status-none)",
  props.compact ? "px-2 py-[3px] text-[11px]" : "px-2.5 py-[5px] text-[12px]",
  props.active && isReleased.value
    && "ring-2 ring-(--color-status-released)/30 ring-offset-1 ring-offset-(--color-card)",
  isReleased.value
    && "cursor-pointer hover:-translate-y-px hover:bg-(--color-status-released)/15",
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
      class="font-mono text-[9px] opacity-70 shrink-0"
    >· {{ mcp.depsCount }}</span>
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
      class="font-mono text-[9px] opacity-70 shrink-0"
    >· {{ mcp.depsCount }}</span>
  </button>
</template>
