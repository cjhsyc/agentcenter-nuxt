<script setup lang="ts">
import {
  toolDisplayName,
  type McpDto,
  type ToolDto,
} from "~~/shared/mcp-panorama"
import McpTile from "./McpTile.vue"

const props = defineProps<{
  tool: ToolDto
  activeMcpId: number | null
}>()

const emit = defineEmits<{ pick: [{ tool: ToolDto; mcp: McpDto }] }>()

const { locale, t } = useI18n()

const toolName = computed(() => toolDisplayName(props.tool, locale.value))

// Real (non-placeholder) MCPs only — placeholder tools shouldn't claim "×1".
const realMcpCount = computed(
  () => props.tool.mcps.filter((m) => !m.isPlaceholder).length,
)

const rollupBorderClass = computed(() => {
  switch (props.tool.rollupStatus) {
    case "released":
      return "border-l-(--color-status-released)"
    case "dev":
      return "border-l-(--color-status-dev)"
    default:
      return "border-l-(--color-status-none)"
  }
})

const rollupDotClass = computed(() => {
  switch (props.tool.rollupStatus) {
    case "released":
      return "bg-(--color-status-released)"
    case "dev":
      return "bg-(--color-status-dev)"
    default:
      return "bg-(--color-status-none)"
  }
})

const rollupAriaLabel = computed(() =>
  t(`mcpPanorama.status.${props.tool.rollupStatus}.label`),
)
</script>

<template>
  <article
    class="bg-(--color-card) border border-(--color-border) border-l-[3px] rounded-md px-2.5 py-2 flex flex-col gap-1.5 transition hover:border-(--color-ink-muted)/40"
    :class="rollupBorderClass"
  >
    <header class="flex items-center gap-2 min-w-0">
      <span class="font-serif text-[13px] font-medium tracking-tight text-(--color-ink) truncate">
        {{ toolName }}
      </span>
      <span
        v-if="realMcpCount > 1"
        class="font-mono text-[9px] text-(--color-ink-muted) shrink-0"
        :aria-label="`${realMcpCount} MCPs`"
      >×{{ realMcpCount }}</span>
      <span
        class="ml-auto size-[6px] rounded-full shrink-0"
        :class="rollupDotClass"
        :aria-label="rollupAriaLabel"
      />
    </header>
    <div class="flex flex-wrap gap-1">
      <McpTile
        v-for="mcp in tool.mcps"
        :key="mcp.id"
        :tool="tool"
        :mcp="mcp"
        :active="activeMcpId === mcp.id"
        compact
        @pick="(p) => emit('pick', p)"
      />
    </div>
  </article>
</template>
